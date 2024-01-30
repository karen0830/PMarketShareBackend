import { Router } from "express";
const router = Router();
import {
    loginUser,
    registerUser,
    logoutUser,
    profileUser,
    registerCompany,
    loginCompany,
    profileCompany,
    logoutCompany,
    imageProfile,
    verifyToken,
    addStories,
    archivedStories,
    addPublications,
    reactionLove,
    deleteStories,
    comments,
    deleteComment,
    refreshToken,
    getPublications,
    getProfileImage,
    getAllPublications,
    pubicationsVisit
} from "../controllers/auth.controller.js";
import {
    authRequired,
    authRequiredCompany,
} from "../middlewares/validateToken.js";
import { validateSchema } from "../middlewares/validator.js";
import {
    registerSchema,
    loginSchema,
    CompanyShema,
    loginCompanyShema,
} from "../schemas/auth.schemas.js";

router.post("/registerCompany", validateSchema(CompanyShema), registerCompany);
router.post("/registerUser", validateSchema(registerSchema), registerUser);
router.post("/loginCompany", validateSchema(loginCompanyShema), loginCompany);
router.post("/loginUser", validateSchema(loginSchema), loginUser);
router.post("/logoutUser", logoutUser);
router.post("/logoutCompany", logoutCompany);
router.post("/publications", addPublications);
router.post("/reactionLike", reactionLove);
router.post("/imageProfile", imageProfile);
router.post("/addStories", addStories);
router.post("/comment", comments);
router.post("/refreshToken", refreshToken);
router.post("/publicationsVisit", pubicationsVisit);
router.get("/profileUser", authRequired, profileUser);
router.get("/profileCompany", authRequiredCompany, profileCompany);
router.get("/verify", verifyToken);
router.get("/getPublications", getPublications);
router.get("/getProfileImage", getProfileImage);
router.get("/getAllPublications", getAllPublications);
router.put("/archivedStory", archivedStories);
router.put("/deleteStories", deleteStories);
router.delete("/deleteComment", deleteComment);
export default router;
