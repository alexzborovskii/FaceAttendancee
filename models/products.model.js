const { db } = require("../config/db.js");

const _getAllProducts = () => {
    return db("products").select("id", "name", "price").orderBy("name");
};

const _getProductById = (id) => {
    // const id = req.params.id;
    return db("products").select("id", "name", "price").where({ id });
};

const _searchProduct = (name) => {
    return db("products")
    .select('id', 'name', 'price')
    .whereILike('name', `%${name}%`);
}

const _insertProduct = ({name, price}) => {
    return db('products')
    .insert({name, price}, ['id', 'name', 'price'])
}

const _updateProduct = ({name, price}, id) => {
    return db("products")
    .update({name, price})
    .where({id})
    .returning(['id', 'name', 'price'])
}

const _deleteProduct = (id) => {
    return db('products')
    .where({id})
    .del()
    .returning()
}

module.exports = { _getAllProducts, _getProductById, _searchProduct, _insertProduct, _updateProduct, _deleteProduct };
