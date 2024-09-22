const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");

const contactUs = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!subject || !message) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  const send_to = process.env.EMAIL_USER;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = user.email;

  // Send Email
  try {
    await sendEmail(subject, message, send_to, sent_from, reply_to);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500);
    throw new Error("Error sending email");
  }
});

module.exports = {
  contactUs,
};
