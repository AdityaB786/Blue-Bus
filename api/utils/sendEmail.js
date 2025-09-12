// utils/sendEmail.js
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * @param {string} to - 
 * @param {string} subject - 
 * @param {string} text - 
 * @param {string} html -
 */
async function sendEmail(to, subject, text, html) {
  const msg = {
    to,
    from: {
      email: process.env.FROM_EMAIL,        
      name: 'BlueBus Booking'
    },
    replyTo: process.env.REPLY_TO || process.env.FROM_EMAIL,
    subject,
    text,
    html
  };

  console.log('📧 Attempting to send email:', msg);

  try {
    const [response] = await sgMail.send(msg);
    console.log(`Email sent to ${to}, statusCode:`, response.statusCode);
  } catch (err) {
    console.error('Error sending email:', err.response?.body || err);
  }
}

module.exports = sendEmail;
