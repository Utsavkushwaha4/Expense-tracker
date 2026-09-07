const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: '64.233.184.108', // Google Gmail direct IPv4 address
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      servername: 'smtp.gmail.com', // SSL handshake verify karne ke liye zaroori hai
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"FinPulse Expense Tracker" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;