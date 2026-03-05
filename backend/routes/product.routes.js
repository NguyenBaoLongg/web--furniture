const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

router.get("/categories", productController.getCategories);
router.get("/new-arrivals", productController.getNewArrivals);
router.get("/", productController.getAllProducts);
module.exports = router;
