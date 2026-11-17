const express = require("express");
const router = express.Router();
const { handleChat } = require("../controllers/aiController");

// AI Shopping Assistant Chatbot endpoint
router.post("/chat", handleChat);

module.exports = router;
