import { Router } from "express";
const routerCompany = Router();
import {
    loginCompany,
    registerCompany,
    logoutCompany,
    verifyTokenCompany,
    addPublications,
    addPublicationsVideo,
    archivedStories,
    imageProfile,
    addStories,
    profileCompany,
    getAllPublicationsCompany,
    reactionLoveCompany,
    getPublicationsCompany,
    verifyProduct, 
    addPublicationsVerify
} from "../controllers/company.auth.controller.js";
import { validateSchemaCompany } from "../middlewares/validator.js";
import { CompanyShema, loginCompanyShema } from "../schemas/auth.schemas.js";
import { authRequiredCompany } from "../middlewares/validateToken.js";
import { addProduct } from "../controllers/products.auth.controller.js";

routerCompany.post("/addpublications",authRequiredCompany, addPublications);
routerCompany.post("/addproducts",authRequiredCompany, addProduct);
routerCompany.post("/addPublicationVideo", authRequiredCompany,  addPublicationsVideo)
routerCompany.post("/registerCompany", validateSchemaCompany(CompanyShema), registerCompany);
routerCompany.post("/loginCompany", validateSchemaCompany(loginCompanyShema), loginCompany);
routerCompany.post("/logoutCompany", logoutCompany);
routerCompany.get("/verifyCompany", authRequiredCompany, verifyTokenCompany);
routerCompany.get("/getPublicationsCompany", authRequiredCompany, getPublicationsCompany);
routerCompany.get("/getAllPublicationsCompany", getAllPublicationsCompany);
routerCompany.put("/archivedStory", authRequiredCompany, archivedStories);
routerCompany.put("/UpdateimageProfile", authRequiredCompany, imageProfile);
routerCompany.post("/addStories",authRequiredCompany, addStories);
routerCompany.get("/profileCompany", authRequiredCompany, profileCompany);
routerCompany.post("/reactionLikeCompany", reactionLoveCompany);
routerCompany.post('/verifyProduct',authRequiredCompany, addPublicationsVerify);
export default routerCompany;