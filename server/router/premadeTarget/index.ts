import { Router } from "express";
import authMiddleware from "../../middleware/auth";
import addSet from "./addSet";
import getAllSet from "./getAllSet";
import addTarget from "./addTarget";
import getTargetInSet from "./getTargetInSet";
const premadeTargetRouter = Router();

premadeTargetRouter.post("/addSet", authMiddleware, addSet);
premadeTargetRouter.get("/getAllSet", authMiddleware, getAllSet);
premadeTargetRouter.post("/addTarget", authMiddleware, addTarget);
premadeTargetRouter.post("/getTargetInSet", authMiddleware, getTargetInSet);

export default premadeTargetRouter;
