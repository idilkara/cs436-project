const stripe = require('stripe')(process.env.STRIPE_SECRET);
const cors = require('cors')({ origin: true });

exports.paymentValidate = async (req, res) => {
  cors(req, res, async () => {
    try {
      const { amount, paymentMethodId } = req.body;
      const intent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
      });
      res.json({ status: intent.status, clientSecret: intent.client_secret });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
};