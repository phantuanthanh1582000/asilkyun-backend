const express = require('express');
const routes = express.Router();
const {authenticateToken, checkAdmin} = require('../middlewares/checkJWT')
const {createCategory, editCategory, deleteCategory, createProduct, allProducts, editProduct, createWarehouse, editWarehouse, allSizeOfProduct, register, login, editUser, allUsers, addToCart, allProductInCart, editCart, deleteCart, createOrder, allOrder, deleteOrder, editOrder}= require('../controllers/apiControllers')

routes.post("/createCategory", checkAdmin, createCategory)
routes.put("/editCategory/:categoryId", checkAdmin, editCategory)
routes.delete("/deleteCategory/:categoryId", checkAdmin, deleteCategory)

routes.post("/createProduct", checkAdmin, createProduct)
routes.get("/allProducts",authenticateToken, allProducts)
routes.put("/editProduct/:productId", checkAdmin, editProduct)
// routes.delete("/deleteProduct/:productId", deleteProduct)

routes.post("/createWarehouse/:productId", checkAdmin, createWarehouse)
routes.put("/editWarehouse/:warehouseId", checkAdmin, editWarehouse)
// routes.delete("/deleteSize/:warehouseId", deleteSize)
routes.get("/allSizeOfProduct/:productId", checkAdmin, allSizeOfProduct)

routes.post("/register", register)
routes.post("/login", login)
routes.put("/editUser", authenticateToken, editUser)
routes.get("/allUsers", checkAdmin, allUsers)

routes.post("/addToCart", authenticateToken, addToCart)
routes.get("/allProductInCart", authenticateToken, allProductInCart)
routes.put("/editCart", authenticateToken, editCart)
routes.delete("/deleteCart", authenticateToken, deleteCart)

routes.post("/createOrder", authenticateToken, createOrder)
routes.get("/allOrder", authenticateToken, allOrder)
routes.delete("/deleteOrder", authenticateToken, deleteOrder)
routes.put("/editOrder", checkAdmin, editOrder)

module.exports = routes