import { Router } from "express";
const router = Router();
import {
    loginUser,
    registerUser,
    logoutUser,
    profileUser,
    imageProfile,
    verifyToken,
    reactionLove,
    deleteStories,
    comments,
    deleteComment,
    refreshToken,
    getProfileImage,
    getProfile,
    getAllPublications,
    postMessage,
    getMessage,
    getPublications,
    sharePublications,
    getSharePublications,
    addShopCart,
    deleteCart,
    getAllShoppingCarts,
    decrementQuantityCart,
    getTokenSocialNetwork,
    commentsProducts,
    getReviews,
    DeleteReview
} from "../controllers/auth.controller.js";
import {
    authRequired
} from "../middlewares/validateToken.js";
import { validateSchema } from "../middlewares/validator.js";
import {
    registerSchema,
    loginSchema
} from "../schemas/auth.schemas.js";

router.post("/msg", postMessage);
router.post("/registerUser", validateSchema(registerSchema), registerUser);
router.post("/loginUser", validateSchema(loginSchema), loginUser);
router.post("/logoutUser", authRequired, logoutUser);
router.post("/reactionLike", reactionLove);
router.post("/imageProfile", imageProfile);
router.post("/comment",authRequired, comments);
router.post("/refreshToken", refreshToken);
router.post("/sharePublication", authRequired, sharePublications);
router.post("/addShoppingCart", authRequired, addShopCart)
router.post("/getTokenSocialNetwork", getTokenSocialNetwork);
router.post("/commentProduct", authRequired, commentsProducts);
router.post("/getReviews", authRequired, getReviews);
router.post("/deleteReview", authRequired, DeleteReview);
router.get("/profileUser", authRequired, profileUser);
router.get("/verify", authRequired, verifyToken);
router.get("/getSharePublications", authRequired, getSharePublications);
router.get("/getProfileImage", getProfileImage);
router.get("/getAllPublications", getAllPublications);
router.get("/getPublications", authRequired, getPublications)
router.get("/getMessages", getMessage)
router.get("/getAllShoppingCarts", authRequired, getAllShoppingCarts)
router.post("/getProfile", getProfile);
router.put("/deleteStories", deleteStories);
router.put("/decrementQuantityCart", authRequired, decrementQuantityCart)
router.post("/deleteComment",authRequired, deleteComment);
router.post("/deleteShoppingCart", authRequired, deleteCart);
export default router;
