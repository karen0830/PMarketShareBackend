import { Router } from "express";
import { authRequired, authRequiredCompany } from "../middlewares/validateToken.js";
import { deleteProduct, getAllCategory, getAllProductCompany, getIdProduct, updateProduct } from "../controllers/products.auth.controller.js";
import { getProductsId } from "../controllers/company.auth.controller.js";
const routerProduct = Router();

routerProduct.get("/getAllProductsCompany", getAllProductCompany)
routerProduct.get("/getProductsId", authRequiredCompany, getProductsId)
routerProduct.get("/getCategories",authRequiredCompany, getAllCategory)
routerProduct.put("/updateProduct", authRequiredCompany, updateProduct);
routerProduct.post("/deleteProduct", authRequiredCompany, deleteProduct)
routerProduct.post("/getIDP", authRequiredCompany, getIdProduct)
export default routerProduct;
