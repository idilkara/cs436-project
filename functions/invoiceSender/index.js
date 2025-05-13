const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });

exports.invoiceSender = async (req, res) => {
  cors(req, res, async () => {
    try {
      const order = req.body; // assume full order payload
      // 1) Build PDF in memory
      const doc = new PDFDocument();
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        const pdfData = Buffer.concat(buffers);
        // 2) Send via SMTP
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT),
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: order.email,
          subject: `Your invoice #${order._id}`,
          text: 'Thank you for your order!',
          attachments: [{ filename: 'invoice.pdf', content: pdfData }],
        });
        res.json({ success: true });
      });
      doc.text(`Invoice for order ${order._id}\nTotal: $${order.total}`);
      doc.end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
};