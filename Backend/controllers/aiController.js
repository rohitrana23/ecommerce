const Product = require("../models/Product");
const { generateShoppingResponse } = require("../services/geminiService");

/**
 * Intelligent helper to extract search parameters (category, budget, keywords) from user query
 */
const parseUserIntent = (message, history = []) => {
  const text = message.toLowerCase().trim();
  const intent = {
    budget: null,
    category: null,
    sortBy: null,
    keywords: [],
    isLatest: false,
    isBestRated: false,
    isComparison: false
  };

  // 1. Budget detection (e.g. "under 1000", "under ₹2000", "budget of 3000", "below 150")
  const budgetMatch = text.match(/(?:under|below|less than|budget of|within)\s*(?:₹|rs\.?|\$)?\s*(\d+(?:,\d+)?)/i);
  if (budgetMatch) {
    const rawVal = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
    if (!isNaN(rawVal)) {
      intent.budget = rawVal;
    }
  }

  // 2. Category matching
  if (/audio|headphone|earbud|sound|music/i.test(text)) {
    intent.category = "Audio";
  } else if (/wearable|watch|smartwatch|fitness|tracker/i.test(text)) {
    intent.category = "Wearables";
  } else if (/footwear|shoe|sneaker|running/i.test(text)) {
    intent.category = "Footwear";
  } else if (/gaming|keyboard|mouse|gamer/i.test(text)) {
    intent.category = "Gaming";
  } else if (/accessories|accessory|backpack|bag|sunglasses/i.test(text)) {
    intent.category = "Accessories";
  }

  // 3. Modifiers (latest, best rated, compare)
  if (/latest|new arrival|new release|newest/i.test(text)) {
    intent.isLatest = true;
  }
  if (/best|top rated|highest rating|top review|popular/i.test(text)) {
    intent.isBestRated = true;
  }
  if (/compare|versus|vs\.?|difference between/i.test(text)) {
    intent.isComparison = true;
  }

  // 4. Memory lookup: Check previous messages if query is a follow-up (e.g. "which one is better", "which one has best battery")
  const isFollowUp = /which one|the first|the second|tell me more|compare these/i.test(text);
  if (isFollowUp && Array.isArray(history) && history.length > 0) {
    const lastBotMessage = [...history].reverse().find((h) => h.role === "assistant" || h.role === "model");
    if (lastBotMessage && lastBotMessage.content) {
      // Find category in previous response if not present
      if (!intent.category) {
        if (/audio|headphone|earbud/i.test(lastBotMessage.content)) intent.category = "Audio";
        else if (/wearable|watch/i.test(lastBotMessage.content)) intent.category = "Wearables";
        else if (/footwear|sneaker|shoe/i.test(lastBotMessage.content)) intent.category = "Footwear";
        else if (/gaming|keyboard|mouse/i.test(lastBotMessage.content)) intent.category = "Gaming";
        else if (/backpack|sunglasses/i.test(lastBotMessage.content)) intent.category = "Accessories";
      }
    }
  }

  return intent;
};

/**
 * @desc    Process shopping assistant chat message grounded in MongoDB products
 * @route   POST /api/ai/chat
 * @access  Public
 */
const handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    // 1. Input Validation
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message is required and cannot be empty"
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Message is too long. Please keep your query under 500 characters."
      });
    }

    // 2. Parse User Intent
    const intent = parseUserIntent(trimmedMessage, history);

    // 3. Query MongoDB Product Database dynamically
    const query = {};

    // Filter by Category if matched
    if (intent.category) {
      query.category = { $regex: new RegExp(`^${intent.category}$`, "i") };
    }

    // Filter by Budget if detected
    if (intent.budget !== null) {
      // Note: If budget is specified as >= 1000 (e.g. INR ₹1000), since prices in DB are numbers 79-249,
      // it matches items under that budget.
      query.price = { $lte: intent.budget };
    }

    // Check for explicit unsupported categories (e.g. "laptops", "phones", "dresses", "books")
    const unsupportedCategories = ["laptop", "phone", "smartphone", "dress", "book", "car", "television", "tv"];
    const isUnsupported = unsupportedCategories.some((cat) =>
      new RegExp(`\\b${cat}s?\\b`, "i").test(trimmedMessage)
    );

    if (isUnsupported) {
      return res.status(200).json({
        success: true,
        reply:
          "Sorry, I couldn't find any matching products. We currently specialize in premium Audio, Wearables, Footwear, Gaming, and Accessories. Would you like to try one of those categories or a specific budget?",
        products: []
      });
    }

    // Find products matching the query
    let productsQuery = Product.find(query);

    if (intent.isBestRated) {
      productsQuery = productsQuery.sort({ rating: -1, numReviews: -1 });
    } else if (intent.isLatest) {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    } else {
      productsQuery = productsQuery.sort({ featured: -1, rating: -1 });
    }

    let matchedProducts = await productsQuery.limit(10).lean();

    // If query was specific and nothing matched
    if (matchedProducts.length === 0) {
      // Fallback: check if general search query on name/description matches
      const searchTerms = trimmedMessage.split(/\s+/).filter((w) => w.length > 3);
      if (searchTerms.length > 0) {
        const regexOr = searchTerms.map((term) => ({
          $or: [
            { name: { $regex: term, $options: "i" } },
            { description: { $regex: term, $options: "i" } },
            { brand: { $regex: term, $options: "i" } }
          ]
        }));
        matchedProducts = await Product.find({ $or: regexOr.map((r) => r.$or).flat() })
          .limit(6)
          .lean();
      }
    }

    // If still no products match at all
    if (matchedProducts.length === 0) {
      return res.status(200).json({
        success: true,
        reply:
          "Sorry, I couldn't find any matching products. Would you like to try another category or budget?",
        products: []
      });
    }

    // 4. Pass Grounded Products & Context to Gemini Service
    const { reply, recommendedProductIds } = await generateShoppingResponse(
      trimmedMessage,
      history,
      matchedProducts
    );

    // 5. Retrieve Full Product Objects for Recommended Cards
    let recommendedProducts = [];
    if (recommendedProductIds.length > 0) {
      recommendedProducts = matchedProducts.filter((p) =>
        recommendedProductIds.includes(p._id.toString())
      );
      // In case some were from a previous turn and not in current matched subset
      if (recommendedProducts.length < recommendedProductIds.length) {
        const missingIds = recommendedProductIds.filter(
          (id) => !recommendedProducts.some((p) => p._id.toString() === id)
        );
        const additional = await Product.find({ _id: { $in: missingIds } }).lean();
        recommendedProducts.push(...additional);
      }
    } else {
      // If user asked to "show", "recommend", "best", "find", attach top matching products as cards
      const asksForProducts =
        /show|recommend|find|suggest|what do you have|latest|best|budget|under|compare/i.test(
          trimmedMessage
        );
      if (asksForProducts) {
        recommendedProducts = matchedProducts.slice(0, 3);
      }
    }

    // 6. Return response
    return res.status(200).json({
      success: true,
      reply,
      products: recommendedProducts
    });
  } catch (error) {
    console.error("AI Chatbot Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating a response. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

module.exports = {
  handleChat
};
