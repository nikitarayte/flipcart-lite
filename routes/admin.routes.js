// const { getProduct, addProduct, updateProduct, deleteProduct } = require("../controller/admin.controller")

const { getProducts, addProduct, updateProducts, deleteProducts } = require("../controllers/admin.controller")

const router = require("express").Router()

router
    .get("/product", getProducts)
    .post("/product/add", addProduct)
    .put("/product/update/:productID", updateProducts)
    .delete("/product/delete/:productID", deleteProducts)

module.exports = router