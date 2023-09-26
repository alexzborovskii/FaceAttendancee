const { products } = require("../config/db.js");
const {
  _getAllProducts,
  _getProductById,
  _searchProduct,
  _insertProduct,
  _updateProduct,
  _deleteProduct,
} = require("../models/products.model.js");

const getAllProducts = (req, res) => {
  _getAllProducts()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ msg: "not found" });
    });
};

const searchProduct = async (req, res) => {
  try {
    const data = await _searchProduct(req.query.name);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await _getProductById(id);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: "no product match this id" });
  }
};

const creatProduct = async (req, res) => {
  // const { name, price } = req.body;
  try {
    const data = await _insertProduct(req.body);
    // res.json(data);
    getAllProducts(req,res);
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  try {
    const data = await _updateProduct(req.body, id);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await _deleteProduct(id);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(404).json({ msg: error.message });
  }
};

module.exports = {
  getAllProducts,
  searchProduct,
  getProduct,
  creatProduct,
  updateProduct,
  deleteProduct,
};
