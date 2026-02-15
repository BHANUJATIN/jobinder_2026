const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const env = require('../config/env');
const stripeService = require('../services/stripeService');

const stripe = new Stripe(env.stripe.secretKey);

router.post('/stripe', async (req, res) => {
  let event;

  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, env.stripe.webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook error' });
  }

  try {
    await stripeService.handleWebhook(event);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err.message);
    res.status(500).json({ error: 'Webhook handler error' });
  }
});

module.exports = router;
