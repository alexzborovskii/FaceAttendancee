const express = require("express");
const { logger } = require("../middlewares/utils.js");

const {
  getAllProducts,
  searchProduct,
  getProduct,
  creatProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/products.controller.js");

const {verifyToken} = require('../middlewares/verify.token.js');


const p_router = express.Router();

// CRUD - Read - get all products
p_router.get("/", getAllProducts);
// p_router.get("/", verifyToken, getAllProducts);

// CRUD - Read - get all products
p_router.get("/search", searchProduct);

// CRUD - Read - get one products
p_router.get("/:id", getProduct);

// body - POST/PUT
p_router.post("/", creatProduct);

// CRUD - Update a product - PUT
p_router.put("/:id", updateProduct);

// CRUD - Delete a product - DELETE
p_router.delete("/:id", deleteProduct);

module.exports = { p_router };
