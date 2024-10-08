const sendEmail = require("./sendEmail");

const sendLowStockEmail = async (item) => {
  const subject = `Low Stock Alert: ${item.name}`;
  const message = `
    <h2>Low Stock Alert</h2>
    <p>The following item is low in stock:</p>
    <ul>
      <li>Name: ${item.name}</li>
      <li>Item Code: ${item.itemCode}</li>
      <li>Current Quantity: ${item.quantity}</li>
      <li>Reorder Level: ${item.reorderLevel}</li>
    </ul>
    <p>Please reorder this item soon.</p>
  `;
  const send_to = process.env.MANAGER_EMAIL;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = process.env.EMAIL_USER;

  await sendEmail(subject, message, send_to, sent_from, reply_to);
};

module.exports = sendLowStockEmail;
