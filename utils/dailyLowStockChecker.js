const Item = require("../models/Item");
const sendLowStockEmail = require("./lowStockEmailer");

const checkLowStockAndSendEmails = async () => {
  try {
    const lowStockItems = await Item.find({
      $expr: { $lte: ["$quantity", "$reorderLevel"] },
      lowStockEmailSent: false,
    });

    for (const item of lowStockItems) {
      await sendLowStockEmail(item);
      item.lowStockEmailSent = true;
      await item.save();
    }

    console.log(`Sent low stock emails for ${lowStockItems.length} items.`);
  } catch (error) {
    console.error("Error in checkLowStockAndSendEmails:", error);
  }
};

module.exports = checkLowStockAndSendEmails;
