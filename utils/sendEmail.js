// const nodemailer = require("nodemailer");

// const sendEmail = async (subject, message, send_to, sent_from, reply_to) => {
//   //   try {
//   // Create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: 587,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//     tls: {
//       rejectUnauthorized: false,
//     },
//   });

//   // Options for sending email
//   const options = {
//     from: sent_from,
//     to: send_to,
//     replyTo: reply_to,
//     subject: subject,
//     html: message,
//   };

//   // Send email
//   transporter.sendMail(options, (error, info) => {
//     if (error) {
//       console.error("Error sending email:", error);
//     } else {
//       console.log("Email sent:", info.response);
//     }
//   });
// };

const sgMail = require("@sendgrid/mail");

// Set the SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (subject, message, send_to, sent_from, reply_to) => {
  try {
    const msg = {
      to: send_to,
      from: sent_from,
      subject: subject,
      html: message,
      replyTo: reply_to,
    };

    const info = await sgMail.send(msg);
    console.log("Email sent successfully:", info);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error;
  }
};

module.exports = sendEmail;
