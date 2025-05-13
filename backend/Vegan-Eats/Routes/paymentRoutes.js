const express = require('express');
const router = express.Router();
const axios = require('axios');


router.post('/mock-payment', async (req, res) => {
    try {
      const cfUrl = process.env.PAYMENT_VALIDATE_URL;
      console.log('CF URL', cfUrl);
      console.log('CF request body', req.body);
      const { data, status } = await axios.post(cfUrl, req.body);
      res.status(status).json(data);
    } catch (err) {
      console.error('CF error', err.response?.data || err.message);
      res.status(err.response?.status || 500)
         .json({ error: err.response?.data?.error || err.message });
    }
  });

 
module.exports = router;
