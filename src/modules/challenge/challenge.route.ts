import { Router } from "express";
import { ChallengeController } from "./challenge.controller";
import protect from "../../middlewares/auth";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Challenge:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         user_id:
 *           type: string
 *         title:
 *           type: string
 *           example: "Learn SOLID principles"
 *         description:
 *           type: string
 *           example: "A coding challenge about software design"
 *         tasks:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Implement SRP"
 *               complete:
 *                 type: boolean
 *                 example: false
 *         personal_note:
 *           type: string
 *           example: "Remember to explain with examples"
 *         scan_result:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               file_url:
 *                 type: string
 *                 example: "https://storage.example.com/challenges/scan1.png"
 *               uploaded_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-09-25T12:34:56Z"
 */

/**
 * @swagger
 * /api/challenge:
 *   post:
 *     summary: Create a new challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *               personal_note:
 *                 type: string
 *               scan_result:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Challenge created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Challenge'
 */
router.post("/", protect, ChallengeController.create);

/**
 * @swagger
 * /api/challenge/:
 *   get:
 *     summary: Get all challenges for the user
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of challenges
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Challenge'
 */
router.get("/", protect, ChallengeController.getAll);

/**
 * @swagger
 * /api/challenge/{id}:
 *   get:
 *     summary: Get a challenge by ID
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Challenge ID
 *     responses:
 *       200:
 *         description: Challenge object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Challenge'
 */
router.get("/:id", protect, ChallengeController.getOne);

/**
 * @swagger
 * /api/challenge/{id}/note:
 *   put:
 *     summary: Update personal note in a challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personal_note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated challenge
 */
router.put("/:id/note", protect, ChallengeController.updateNote);

/**
 * @swagger
 * /api/challenge/{id}/tasks/{taskIndex}:
 *   put:
 *     summary: Mark a task as complete
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskIndex
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated challenge with completed task
 */
router.put("/:id/tasks/:taskIndex", protect, ChallengeController.updateTask);

/**
 * @swagger
 * /api/challenge/{id}/tasks/{taskIndex}:
 *   delete:
 *     summary: Delete a task from a challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskIndex
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Challenge with updated tasks
 */
router.delete("/:id/tasks/:taskIndex", protect, ChallengeController.deleteTask);

/**
 * @swagger
 * /api/challenge/{id}/scan:
 *   post:
 *     summary: Upload a scan for a challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               challenge:
 *                 type: string
 *                 format: binary
 *               scan_result:
 *                 type: string
 *                 example: '{"score": 95}'
 *     responses:
 *       200:
 *         description: Updated challenge with scan
 */
router.post("/:id/scan", protect, upload.single("challenge"), ChallengeController.uploadScan);

export default router;
