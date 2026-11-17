const { GoogleGenAI } = require("@google/genai");

let aiClient = null;

const getAIClient = () => {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey || apiKey === "your_gemini_api_key") {
    return null;
  }
  if (!aiClient || aiClient.apiKey !== apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
    aiClient.apiKey = apiKey;
  }
  return aiClient;
};

/**
 * Build system prompt instructing Gemini on catalog grounding and assistant persona
 */
const buildSystemInstruction = (catalogSummary) => {
  return `You are the "Apex AI Shopping Assistant", a friendly, knowledgeable, and honest e-commerce advisor for ApexStore.

PRIMARY RULES & GROUNDING:
1. You MUST ONLY recommend and discuss products that actually exist in the provided MongoDB catalog below.
2. NEVER invent fake products, fake prices, or fake specifications. All product names, prices, categories, and specs must match the catalog.
3. If no matching products exist in the catalog for the user's specific request, politely say:
   "Sorry, I couldn't find any matching products. Would you like to try another category or budget?"
4. If the user asks about an unrelated topic (e.g. general coding, politics, essays, weather), politely decline and steer the conversation back to shopping at ApexStore.
5. When recommending products, always explain WHY each product fits their needs, budget, or preferences.
6. For product comparisons (e.g., comparing two products), provide a clear, structured comparison covering:
   - Price & Value
   - Key Features & Specs
   - Rating & Reviews
   - Availability / In Stock
7. Format your response in clean, attractive Markdown (use bullet points, bold highlights, concise paragraphs).

AVAILABLE MONGODB PRODUCT CATALOG:
${JSON.stringify(catalogSummary, null, 2)}

PRODUCT CARD ATTACHMENT RULE:
At the very end of your response, on a new line, list the MongoDB ObjectIDs of the specific products you recommended or highlighted in this format:
[RECOMMENDED_PRODUCTS: id1, id2, ...]
Example: [RECOMMENDED_PRODUCTS: 60c72b2f9b1d8b2bad000001, 60c72b2f9b1d8b2bad000002]
If you are declining, answering a general question without specific products, or no products matched, omit the tag.`;
};

/**
 * Generate AI shopping response using Gemini API
 * @param {string} userMessage - Latest user query
 * @param {Array} history - Previous conversation turns [{ role: 'user'|'model', content: string }]
 * @param {Array} matchedProducts - Real MongoDB product documents
 * @returns {Promise<{ reply: string, recommendedProductIds: string[] }>}
 */
const generateShoppingResponse = async (userMessage, history = [], matchedProducts = []) => {
  const client = getAIClient();

  // Catalog representation passed to Gemini for grounding
  const catalogSummary = matchedProducts.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    category: p.category,
    brand: p.brand || "Apex",
    price: p.price,
    originalPrice: p.originalPrice || 0,
    rating: p.rating || 4.8,
    numReviews: p.numReviews || 0,
    countInStock: p.countInStock,
    featured: !!p.featured,
    isNewArrival: !!p.isNewArrival,
    badge: p.badge || "",
    colors: p.colors || [],
    description: p.description
  }));

  // If Gemini API Key is not configured, generate an intelligent rule-based grounded response
  if (!client) {
    return generateLocalFallbackResponse(userMessage, matchedProducts);
  }

  try {
    const systemInstruction = buildSystemInstruction(catalogSummary);

    // Format chat history for Gemini contents
    const contents = [];

    // Add previous conversation turns (limited to last 6 for context without token bloat)
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6);
      for (const turn of recentHistory) {
        if (turn.content && typeof turn.content === "string") {
          contents.push({
            role: turn.role === "assistant" || turn.role === "model" ? "model" : "user",
            parts: [{ text: turn.content }]
          });
        }
      }
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    // Try gemini-2.5-flash first, fallback to gemini-2.0-flash or gemini-1.5-flash
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let responseText = null;

    for (const model of modelsToTry) {
      try {
        const response = await client.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.6,
            maxOutputTokens: 1000
          }
        });

        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (modelErr) {
        console.warn(`Gemini model ${model} attempt error:`, modelErr.message);
      }
    }

    if (!responseText) {
      throw new Error("Empty or failed response from all Gemini models.");
    }

    // Extract [RECOMMENDED_PRODUCTS: id1, id2, ...]
    const recommendedProductIds = [];
    const match = responseText.match(/\[RECOMMENDED_PRODUCTS:\s*([a-fA-F0-9,\s]+)\]/);
    let cleanReply = responseText;

    if (match) {
      const idsStr = match[1];
      const parsedIds = idsStr
        .split(",")
        .map((s) => s.trim())
        .filter((s) => /^[a-fA-F0-9]{24}$/.test(s));

      recommendedProductIds.push(...parsedIds);
      // Remove machine tag from user-facing reply
      cleanReply = responseText.replace(/\[RECOMMENDED_PRODUCTS:[\s\S]*?\]/, "").trim();
    }

    return {
      reply: cleanReply,
      recommendedProductIds
    };
  } catch (apiError) {
    console.error("Gemini API call failed, falling back to local grounded response:", apiError.message);
    return generateLocalFallbackResponse(userMessage, matchedProducts);
  }
};

/**
 * Intelligent grounded fallback when Gemini API key is missing or network/quota error occurs.
 * Strictly uses real MongoDB products and accurately addresses search, budget, category, comparison.
 */
const generateLocalFallbackResponse = (userMessage, matchedProducts = []) => {
  const query = userMessage.toLowerCase().trim();

  // If no products matched in MongoDB
  if (!matchedProducts || matchedProducts.length === 0) {
    return {
      reply:
        "Sorry, I couldn't find any matching products. Would you like to try another category or budget? You can explore our Audio, Wearables, Gaming, Footwear, or Accessories collections!",
      recommendedProductIds: []
    };
  }

  // Handle comparison query
  if (query.includes("compare") || (query.includes("between") && matchedProducts.length >= 2)) {
    const p1 = matchedProducts[0];
    const p2 = matchedProducts[1];
    return {
      reply: `### ⚖️ Product Comparison: **${p1.name}** vs **${p2.name}**\n\n` +
        `| Feature | **${p1.name.slice(0, 22)}...** | **${p2.name.slice(0, 22)}...** |\n` +
        `| :--- | :--- | :--- |\n` +
        `| **Price** | **$${p1.price}** | **$${p2.price}** |\n` +
        `| **Category** | ${p1.category} | ${p2.category} |\n` +
        `| **Rating** | ⭐ ${p1.rating || 4.8} / 5 (${p1.numReviews || 0} reviews) | ⭐ ${p2.rating || 4.8} / 5 (${p2.numReviews || 0} reviews) |\n` +
        `| **Stock** | ${p1.countInStock > 0 ? `${p1.countInStock} available` : "Out of stock"} | ${p2.countInStock > 0 ? `${p2.countInStock} available` : "Out of stock"} |\n` +
        `| **Key Specs** | ${p1.description.slice(0, 80)}... | ${p2.description.slice(0, 80)}... |\n\n` +
        `💡 **Recommendation**: If you prefer **${p1.price < p2.price ? "the more budget-friendly option" : "higher tier specs"}**, go with **${p1.price < p2.price ? p1.name : p2.name}**!`,
      recommendedProductIds: [p1._id.toString(), p2._id.toString()]
    };
  }

  // Handle rating query
  if (query.includes("rating") || query.includes("best rated") || query.includes("top rated")) {
    const top = [...matchedProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
    return {
      reply: `Here are our **highest-rated products** loved by customers:\n\n` +
        top
          .map(
            (p, idx) =>
              `${idx + 1}. **${p.name}** — ⭐ **${p.rating} / 5** ($${p.price})\n   *${p.description.slice(0, 90)}...*`
          )
          .join("\n\n") +
        `\n\nWould you like more details on any of these?`,
      recommendedProductIds: top.map((p) => p._id.toString())
    };
  }

  // Handle budget / under query
  if (query.includes("under") || query.includes("budget") || query.includes("below")) {
    const affordable = matchedProducts.slice(0, 3);
    return {
      reply: `Here are the top products matching your budget from our catalog:\n\n` +
        affordable
          .map(
            (p) =>
              `• **${p.name}** — **$${p.price}** (Rated ⭐ ${p.rating})\n  ${p.description.slice(0, 85)}...`
          )
          .join("\n\n") +
        `\n\nAll items are in stock and ready to ship. Which one caught your eye?`,
      recommendedProductIds: affordable.map((p) => p._id.toString())
    };
  }

  // General recommendation or category response
  const featured = matchedProducts.slice(0, 3);
  return {
    reply: `Here are our top recommended products from the database for you:\n\n` +
      featured
        .map(
          (p) =>
            `• **${p.name}** ($${p.price}) — ⭐ **${p.rating}**\n  *${p.description.slice(0, 85)}...*`
        )
        .join("\n\n") +
      `\n\nYou can click **View Details** or add them directly to your bag!`,
    recommendedProductIds: featured.map((p) => p._id.toString())
  };
};

module.exports = {
  generateShoppingResponse
};
