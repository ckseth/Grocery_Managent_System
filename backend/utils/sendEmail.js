const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_EMAIL || 'test_user',
      pass: process.env.SMTP_PASSWORD || 'test_pass'
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'GroceryGo Support'} <${process.env.FROM_EMAIL || 'noreply@grocerygo.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent: %s', info.messageId);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

module.exports = sendEmail;
