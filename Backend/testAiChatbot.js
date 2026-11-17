/**
 * Automated Test Suite for AI Shopping Assistant (Backend)
 * Verifies all 10 key functionalities:
 * 1. Product Search & Budget filtering
 * 2. Product Recommendations
 * 3. Product Details
 * 4. Product Comparison
 * 5. Budget-based shopping
 * 6. Conversation memory / follow-up queries
 * 7. Unsupported category / No matching products graceful response
 * 8. Empty message validation rejection
 * 9. Message length limit validation (> 500 chars)
 * 10. Catalog grounding (only real MongoDB products returned)
 */

const mongoose = require("mongoose");

// Mock sample MongoDB products
const mockProducts = [
  {
    _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000001"),
    name: "Apex Wireless Pro Noise-Cancelling Headphones",
    price: 249,
    category: "Audio",
    brand: "Apex Sound",
    rating: 4.9,
    numReviews: 184,
    countInStock: 25,
    featured: true,
    isNewArrival: false,
    description: "40mm custom drivers, active noise cancellation, transparency mode, 38-hour battery.",
    colors: ["Space Black", "Silver Mist"]
  },
  {
    _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000002"),
    name: "Horizon Ultra Retina Smartwatch",
    price: 199,
    category: "Wearables",
    brand: "Horizon",
    rating: 4.8,
    numReviews: 122,
    countInStock: 18,
    featured: true,
    isNewArrival: true,
    description: "Always-On AMOLED display, biometric cardiac and SpO2 tracking, dual-frequency GPS.",
    colors: ["Obsidian", "Starlight"]
  },
  {
    _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000003"),
    name: "CloudPulse Nitro Running Sneakers",
    price: 129,
    category: "Footwear",
    brand: "PulseLab",
    rating: 4.7,
    numReviews: 95,
    countInStock: 30,
    featured: true,
    isNewArrival: false,
    description: "Responsive foam cushioning, breathable knit mesh upper, high-traction rubber outsole.",
    colors: ["Crimson Red", "Triple Black"]
  },
  {
    _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000004"),
    name: "CyberGlow RGB Wireless Mechanical Keyboard",
    price: 149,
    category: "Gaming",
    brand: "CyberGrid",
    rating: 4.9,
    numReviews: 76,
    countInStock: 15,
    featured: true,
    isNewArrival: true,
    description: "Hot-swappable switches, aluminum top plate, per-key RGB backlighting, 200h battery.",
    colors: ["Stealth Black"]
  },
  {
    _id: new mongoose.Types.ObjectId("60c72b2f9b1d8b2bad000005"),
    name: "Vanguard True Spatial Earbuds",
    price: 119,
    category: "Audio",
    brand: "Apex Sound",
    rating: 4.8,
    numReviews: 142,
    countInStock: 40,
    featured: false,
    isNewArrival: false,
    description: "Spatial dynamic audio, quad-mic beamforming noise isolation, IPX7 sweat resistance.",
    colors: ["Matte Black"]
  }
];

// Helper to mock res
function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
}

// Mock Product model
const Product = require("./models/Product");
Product.find = (filter) => {
  let list = [...mockProducts];

  if (filter && filter.category) {
    const reg = filter.category.$regex;
    list = list.filter((p) => reg.test(p.category));
  }

  if (filter && filter.price && filter.price.$lte !== undefined) {
    list = list.filter((p) => p.price <= filter.price.$lte);
  }

  if (filter && filter._id && filter._id.$in) {
    const idStrings = filter._id.$in.map((id) => id.toString());
    list = list.filter((p) => idStrings.includes(p._id.toString()));
  }

  return {
    sort(sortObj) {
      return this;
    },
    limit(num) {
      return this;
    },
    lean() {
      return Promise.resolve(list);
    }
  };
};

const aiController = require("./controllers/aiController");

async function runTests() {
  console.log("=================================================");
  console.log("   RUNNING AI CHATBOT FUNCTIONALITY TEST SUITE");
  console.log("=================================================\n");

  let passed = 0;
  const total = 10;

  // Test 1: Product Search & Category / Budget filtering
  console.log("1. Testing: Product Search ('Show me shoes under ₹2000')...");
  {
    const req = { body: { message: "Show me shoes under ₹2000" } };
    const res = createMockRes();
    await aiController.handleChat(req, res);

    if (
      res.statusCode === 200 &&
      res.body.success &&
      res.body.products.some((p) => p.category === "Footwear")
    ) {
      console.log("   ✓ PASS: Footwear product found within budget.\n");
      passed++;
    } else {
      console.error("   ✗ FAIL:", res.body);
    }
  }

  // Test 2: Product Recommendations
  console.log("2. Testing: Product Recommendations ('Recommend the best products')...");
  {
    const req = { body: { message: "Recommend the best products" } };
    const res = createMockRes();
    await aiController.handleChat(req, res);

    if (res.statusCode === 200 && res.body.success && res.body.products.length > 0) {
      console.log("   ✓ PASS: Real MongoDB products recommended with descriptive reply.\n");
      passed++;
    } else {
      console.error("   ✗ FAIL:", res.body);
    }
  }

  // Test 3: Product Details
  console.log("3. Testing: Product Details ('Tell me more about Apex Wireless Pro')...");
  {
    const req = { body: { message: "Tell me more about Apex Wireless Pro Headphones" } };
    const res = createMockRes();
    await aiController.handleChat(req, res);

    if (
      res.statusCode === 200 &&
      res.body.products.some((p) => p.name.includes("Apex Wireless Pro"))
    ) {
      console.log("   ✓ PASS: Product details retrieved from database.\n");
      passed++;
    } else {
      console.error("   ✗ FAIL:", res.body);
    }
  }

  // Test 4: Product Comparison
  console.log("4. Testing: Product Comparison ('Compare Apex Wireless and Vanguard Earbuds')...");
  {
    const req = { body: { message: "Compare Apex Wireless and Vanguard Earbuds" } };
    const res = createMockRes();
    await aiController.handleChat(req, res);

    if (
      res.statusCode === 200 &&
      res.body.reply.includes("Comparison") &&
      res.body.products.length >= 2
    ) {
      console.log("   ✓ PASS: Comparison table formatted with both products.\n");
      passed++;
    } else {
      console.error("   ✗ FAIL:", res.body);
    }
  }

  // Test 5: Budget-Based Shopping
  console.log("5. Testing: Budget-Based Shopping ('Find products under ₹1000')...");
  {
    const req = { body: { message: "Find products under ₹1000" } };
    const res = createMockRes();
    await aiController.handleChat(req, res);

    if (
      res.statusCode === 200 &&
      res.body.products.every((p) => p.price <= 1000)
    ) {
      console.log("   ✓ PASS: Budget filter applied correctly.\n");
      passed++;
    } else {
      console.error("   ✗ FAIL:", res.body);
    }
  }

  // Test 6: Conversation Memory / Follow-up queries
  console.log("6. Testing: Conversation Memory ('Which one has the best battery?')...");
  {
    const req = {
      body: {
        message: "Which one has the best battery?",
        history: [
          { role: "user", content: "Show me audio headphones" },
          {
            role: "model",
            content:
              "Here are our top audio products: Apex Wireless Pro Noise-Cancelling Headphones and Vanguard True Spatial Earbuds."
          }
        ]
      }
    };
    const res = createMockRes();
    await aiController.handleChat(req, res);

    if (
      res.statusCode === 200 &&
      res.body.products.some((p) => p.category === "Audio")
    ) {
      console.log("   ✓ PASS: Follow-up correctly grounded in audio category from conversation memory.\n");
      passed++;
    } else {
      console.error("   ✗ FAIL:", res.body);
    }
  }

  // Test 7: Unsupported Category / No matching products
  console.log("7. Testing: Unsupported Category ('Suggest a good laptop for students')...");
  {
    const req = { body: { message: "Suggest a good laptop for students" } };
    const res = createMockRes();
    await aiController.handleChat(req, res);

    if (
      res.statusCode === 200 &&
      res.body.reply.includes("Sorry, I couldn't find any matching products") &&
      res.body.products.length === 0
    ) {
      console.log("   ✓ PASS: Correct polite decline without hallucinating fake laptops.\n");
      passed++;
    } else {
      console.error("   ✗ FAIL:", res.body);
    }
  }

  // Test 8: Empty Message Validation
  console.log("8. Testing: Empty message validation...");
  {
    const req = { body: { message: "   " } };
    const res = createMockRes();
    await aiController.handleChat(req, res);

    if (res.statusCode === 400 && res.body.success === false) {
      console.log("   ✓ PASS: Empty message rejected with HTTP 400.\n");
      passed++;
    } else {
      console.error("   ✗ FAIL:", res.body);
    }
  }

  // Test 9: Long Message Limit Validation (> 500 chars)
  console.log("9. Testing: Long message limit (> 500 chars)...");
  {
    const longMessage = "a".repeat(505);
    const req = { body: { message: longMessage } };
    const res = createMockRes();
    await aiController.handleChat(req, res);

    if (res.statusCode === 400 && res.body.message.includes("too long")) {
      console.log("   ✓ PASS: Excessive message length rejected with HTTP 400.\n");
      passed++;
    } else {
      console.error("   ✗ FAIL:", res.body);
    }
  }

  // Test 10: Grounding (All products originate strictly from MongoDB)
  console.log("10. Testing: Strict Catalog Grounding (zero fake products)...");
  {
    const req = { body: { message: "Show me the latest products" } };
    const res = createMockRes();
    await aiController.handleChat(req, res);

    const validIds = mockProducts.map((p) => p._id.toString());
    const allValid = res.body.products.every((p) => validIds.includes(p._id.toString()));

    if (res.statusCode === 200 && allValid) {
      console.log("   ✓ PASS: 100% of returned products strictly grounded in database.\n");
      passed++;
    } else {
      console.error("   ✗ FAIL:", res.body);
    }
  }

  console.log("=================================================");
  console.log(`AI CHATBOT TEST SUMMARY: ${passed} / ${total} TESTS PASSED`);
  console.log("=================================================");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
