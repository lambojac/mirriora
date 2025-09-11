import { Router } from "express";
import { JournalController } from "./journals.controller";
import protect from "../../middlewares/auth";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Journals
 *   description: Journal management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Journal:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           example: "My Daily Journal"
 *         description:
 *           type: string
 *           example: "This is my personal journal"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/journals:
 *   get:
 *     summary: Get all journals
 *     tags: [Journals]
 *     responses:
 *       200:
 *         description: List of journals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Journal'
 *
 *   post:
 *     summary: Create a new journal
 *     tags: [Journals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Work Notes"
 *               description:
 *                 type: string
 *                 example: "Journal for work-related notes"
 *     responses:
 *       201:
 *         description: Journal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Journal'
 *
 * /api/journals/{id}:
 *   get:
 *     summary: Get a journal by ID
 *     tags: [Journals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Journal ID
 *     responses:
 *       200:
 *         description: Journal details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Journal'
 *       404:
 *         description: Journal not found
 *
 *   put:
 *     summary: Update a journal by ID
 *     tags: [Journals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Journal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Journal Title"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Journal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Journal'
 *       404:
 *         description: Journal not found
 *
 *   delete:
 *     summary: Delete a journal by ID
 *     tags: [Journals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Journal ID
 *     responses:
 *       200:
 *         description: Journal deleted successfully
 *       404:
 *         description: Journal not found
 */

router.post("/",protect, JournalController.create);
router.put("/:id",protect, JournalController.update);
router.delete("/:id",protect, JournalController.remove);
router.get("/", protect,JournalController.getAll);
router.get("/:id",protect, JournalController.getOne);

export default router;
