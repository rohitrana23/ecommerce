const Razorpay = require("razorpay");
const dotenv = require("dotenv");

let razorpayInstance = null;

const getRazorpayInstance = () => {
  // Re-read dotenv in case .env was modified while the server was running
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === "your_razorpay_key_id") {
    dotenv.config();
  }

  const key_id = process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : "";
  const key_secret = process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : "";

  if (!key_id || !key_secret || key_id === "your_razorpay_key_id" || key_secret === "your_razorpay_secret") {
    throw new Error(
      "Razorpay credentials missing. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Backend/.env and restart your server."
    );
  }

  if (!razorpayInstance || razorpayInstance.key_id !== key_id) {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret
    });
  }

  return razorpayInstance;
};

module.exports = { getRazorpayInstance };
