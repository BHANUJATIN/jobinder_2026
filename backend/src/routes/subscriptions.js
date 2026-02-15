const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const stripeService = require('../services/stripeService');

router.get('/plans', async (req, res, next) => {
  try {
    const plans = await stripeService.getPlans();
    res.json(plans);
  } catch (err) {
    next(err);
  }
});

router.post('/checkout', authenticate, async (req, res, next) => {
  try {
    const { planId, billingCycle } = req.body;
    const result = await stripeService.createCheckout(req.user.id, planId, billingCycle);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/cancel', authenticate, async (req, res, next) => {
  try {
    const result = await stripeService.cancelSubscription(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
