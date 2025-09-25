import { Request, Response } from "express";
import { ChallengeService } from "./challenge.service";

export const ChallengeController = {
  async create(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { title, description, tasks, personal_note, scan_result } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required" });

    const { data, error } = await ChallengeService.createChallenge(
      userId, title, description, tasks, personal_note, scan_result
    );

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data[0]);
  },

  async getAll(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { data, error } = await ChallengeService.getAllChallenges(userId);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  },

  async getOne(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { data, error } = await ChallengeService.getChallengeById(userId, id);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  },

  async updateNote(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { personal_note } = req.body;

    const { data, error } = await ChallengeService.updatePersonalNote(userId, id, personal_note);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  },

  async updateTask(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id, taskIndex } = req.params;

    const { data, error } = await ChallengeService.updateTask(userId, id, Number(taskIndex));

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  },

  async deleteTask(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id, taskIndex } = req.params;

    const { data, error } = await ChallengeService.deleteTask(userId, id, Number(taskIndex));

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  },

  async uploadScan(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const file = req.file;
    const { scan_result } = req.body;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const { data, error } = await ChallengeService.uploadScan(userId, id, file, scan_result);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  },
};
