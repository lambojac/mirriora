import { Router } from "express";
import { JournalController } from "./journals.controller";
import protect from "../../middlewares/auth";
import multer from "multer";
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

/**
 * @swagger
 * /journals/{id}/scans:
 *   post:
 *     summary: Upload a scan for a journal
 *     description: Uploads a file (image, PDF, etc.) to Supabase storage and saves metadata in the `scans` table.
 *     tags:
 *       - Journals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the journal the scan belongs to
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - scan
 *             properties:
 *               scan:
 *                 type: string
 *                 format: binary
 *                 description: The scan file to upload
 *     responses:
 *       "200":
 *         description: Scan uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   journal_id:
 *                     type: string
 *                     format: uuid
 *                   file_url:
 *                     type: string
 *                     example: journals/uuid/timestamp-file.png
 *                   user_id:
 *                     type: string
 *                     format: uuid
 *                   created_at:
 *                     type: string
 *                     format: date-time
 */
/**
 * @swagger
 * /{id}/scans:
 *   get:
 *     summary: Get scans for a specific journal
 *     description: Retrieve all scans associated with a specific journal for the authenticated user.
 *     tags: [Journals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the journal
 *     responses:
 *       200:
 *         description: List of scans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Scan'
 *       400:
 *         description: Bad request (error fetching scans)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid journal ID"
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /scans/{scanId}/personal-note:
 *   put:
 *     summary: Update the personal note of a scan
 *     description: Allows the user to update only the `personal_note` field of a scan they own.
 *     tags:
 *       - Scans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scanId
 *         required: true
 *         description: The ID of the scan to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personal_note
 *             properties:
 *               personal_note:
 *                 type: string
 *                 example: "This is my updated note about the scan"
 *     responses:
 *       200:
 *         description: Personal note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   journal_id:
 *                     type: string
 *                   user_id:
 *                     type: string
 *                   file_url:
 *                     type: string
 *                   title:
 *                     type: string
 *                   personal_note:
 *                     type: string
 *                   scan_result:
 *                     type: object
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Bad request (missing personal_note or invalid scanId)
 *       401:
 *         description: Unauthorized (user not logged in or doesn’t own scan)
 */

const upload = multer({ storage: multer.memoryStorage() });
router.post("/",protect, JournalController.create);
router.put("/:id",protect, JournalController.update);
router.delete("/:id",protect, JournalController.remove);
router.get("/", protect,JournalController.getAll);
router.get("/:id",protect, JournalController.getOne);
router.post("/:id/scans", protect,upload.single("scan"),JournalController.uploadScan)
router.get("/:id/scans", protect,JournalController.getScans);
router.put("/scans/:scanId/personal-note",protect, JournalController.updatePersonalNote);

export default router;
