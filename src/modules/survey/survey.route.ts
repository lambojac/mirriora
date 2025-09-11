import { Router } from "express";
import { getNext,answer,fetchAll,fetchAnswered,fetchUnanswered, } from "./survey.controller";


const router = Router();

router.get("/survey/:userId/next", getNext);
router.post("/survey/:userId/answer", answer);
router.get("/all", fetchAll);                
router.get("/answered/:userId", fetchAnswered);      
router.get("/unanswered/:userId", fetchUnanswered); 

/**
 * @swagger
 * tags:
 *   name: Survey
 *   description: Survey management and user answers
 */

/**
 * @swagger
 * /api/survey/survey/{userId}/next:
 *   get:
 *     summary: Get the next unanswered question for a user
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Next unanswered question
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SurveyQuestion'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/survey/survey/{userId}/answer:
 *   post:
 *     summary: Submit an answer for a question
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/survey/all:
 *   get:
 *     summary: Get all survey questions
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SurveyQuestion'
 */

/**
 * @swagger
 * /api/survey/answered/{userId}:
 *   get:
 *     summary: Get all answered questions for a user
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of answered questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SurveyAnswer'
 */

/**
 * @swagger
 * /api/survey/unanswered/{userId}:
 *   get:
 *     summary: Get all unanswered questions for a user
 *     tags: [Survey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of unanswered questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SurveyQuestion'
 */

export default router;

