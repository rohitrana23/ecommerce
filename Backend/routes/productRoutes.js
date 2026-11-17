const express = require("express");
const {
  getProducts,
  getFeaturedProducts,
  getCategories,
  getProductById,
  seedProducts
} = require("../controllers/productController");

const router = express.Router();

router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);
router.post("/seed", seedProducts);
router.get("/:id", getProductById);
router.get("/", getProducts);

module.exports = router;
