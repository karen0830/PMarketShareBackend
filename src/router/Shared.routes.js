import { Router } from "express";
import { followPerson } from "../controllers/Shared.controller.js";

const routerShared = Router();

routerShared.post("/followPerson", followPerson);

export default routerShared;