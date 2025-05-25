// // const stripe = require('stripe')(process.env.STRIPE_SECRET);

// const stripe = require('stripe')('sk_test_51MockKeyForLocalTestingOnlyDontUseInProd');


// const cors = require('cors')({ origin: true });

// exports.paymentValidate = async (req, res) => {
//   cors(req, res, async () => {
//     try {
//       const { amount, paymentMethodId } = req.body;
//       const intent = await stripe.paymentIntents.create({
//         amount,
//         currency: 'usd',
//         payment_method: paymentMethodId,
//         confirmation_method: 'manual',
//         confirm: true,
//       });
//       res.json({ status: intent.status, clientSecret: intent.client_secret });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: err.message });
//     }
//   });
// };

const cors = require('cors')({ origin: true });

exports.paymentValidate = async (req, res) => {
  cors(req, res, async () => {
    try {
      const { amount, paymentMethodId } = req.body;

      // // Simulate payment logic
      // if (!amount || !paymentMethodId) {
      //   throw new Error('Missing amount or payment method ID');
      // }

      // Simulate success or failure randomly
      const mockIntent = {
        status: Math.random() > 0.0 ? 'succeeded' : 'requires_action',
        clientSecret: 'mock_client_secret_' + Date.now(),
      };

      res.json(mockIntent);
    } catch (err) {
      console.error('Mock error:', err);
      res.status(500).json({ error: err.message });
    }
  });
};
