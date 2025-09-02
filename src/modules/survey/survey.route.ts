import { Router } from "express";
import { getNext,answer,fetchAll,fetchAnswered,fetchUnanswered, } from "./survey.controller";
import { protect } from "../../middlewares/auth";

const router = Router();

router.use(protect);
router.get("/survey/:userId/next", getNext);
router.post("/survey/:userId/answer", answer);
router.get("/all", fetchAll);                
router.get("/answered/:userId", fetchAnswered);      
router.get("/unanswered/:userId", fetchUnanswered); 
export default router;
