const Stripe = require('stripe');
const env = require('../config/env');
const prisma = require('../config/db');

const stripe = new Stripe(env.stripe.secretKey);

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    maxFolders: 1,
    maxTables: 2,
    maxJobsPerMonth: 100,
  },
  starter: {
    name: 'Starter',
    priceMonthly: 2900, // $29 in cents
    priceYearly: 29000, // $290 in cents
    maxFolders: 5,
    maxTables: 10,
    maxJobsPerMonth: 1000,
  },
  professional: {
    name: 'Professional',
    priceMonthly: 9900,
    priceYearly: 99000,
    maxFolders: null, // unlimited
    maxTables: 50,
    maxJobsPerMonth: 10000,
  },
  enterprise: {
    name: 'Enterprise',
    priceMonthly: null, // custom
    maxFolders: null,
    maxTables: null,
    maxJobsPerMonth: null,
  },
};

async function getPlans() {
  return Object.entries(PLANS).map(([key, plan]) => ({
    id: key,
    ...plan,
  }));
}

async function createCheckout(userId, planId, billingCycle = 'monthly') {
  const plan = PLANS[planId];
  if (!plan || planId === 'free') {
    const err = new Error('Invalid plan');
    err.status = 400;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  let customerId;
  const existingSub = await prisma.subscription.findFirst({
    where: { userId, stripeCustomerId: { not: null } },
  });

  if (existingSub?.stripeCustomerId) {
    customerId = existingSub.stripeCustomerId;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.fullName,
      metadata: { userId },
    });
    customerId = customer.id;
  }

  const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `Jobinder ${plan.name}` },
          unit_amount: price,
          recurring: { interval: billingCycle === 'yearly' ? 'year' : 'month' },
        },
        quantity: 1,
      },
    ],
    success_url: `${env.frontendUrl}/settings?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.frontendUrl}/settings`,
    metadata: { userId, planId, billingCycle },
  });

  return { url: session.url };
}

async function handleWebhook(event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { userId, planId, billingCycle } = session.metadata;
      const plan = PLANS[planId];

      await prisma.subscription.upsert({
        where: { id: (await prisma.subscription.findFirst({ where: { userId } }))?.id || 'new' },
        update: {
          planName: planId,
          planPrice: (billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly) / 100,
          billingCycle,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          status: 'active',
          maxFolders: plan.maxFolders,
          maxTables: plan.maxTables,
          maxJobsPerMonth: plan.maxJobsPerMonth,
        },
        create: {
          userId,
          planName: planId,
          planPrice: (billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly) / 100,
          billingCycle,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          status: 'active',
          maxFolders: plan.maxFolders,
          maxTables: plan.maxTables,
          maxJobsPerMonth: plan.maxJobsPerMonth,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionTier: planId, subscriptionStatus: 'active' },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const dbSub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (dbSub) {
        await prisma.subscription.update({
          where: { id: dbSub.id },
          data: { status: 'cancelled' },
        });
        await prisma.user.update({
          where: { id: dbSub.userId },
          data: { subscriptionTier: 'free', subscriptionStatus: 'cancelled' },
        });
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const dbSub = await prisma.subscription.findFirst({
        where: { stripeCustomerId: invoice.customer },
      });
      if (dbSub) {
        await prisma.subscription.update({
          where: { id: dbSub.id },
          data: { status: 'past_due' },
        });
        await prisma.user.update({
          where: { id: dbSub.userId },
          data: { subscriptionStatus: 'past_due' },
        });
      }
      break;
    }
  }
}

async function cancelSubscription(userId) {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'active', stripeSubscriptionId: { not: null } },
  });

  if (!sub) {
    const err = new Error('No active subscription');
    err.status = 400;
    throw err;
  }

  await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
  return { message: 'Subscription cancelled' };
}

module.exports = { getPlans, createCheckout, handleWebhook, cancelSubscription, PLANS };
