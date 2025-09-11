import { Request, Response } from "express";
import { JournalService } from "./journals.service";

export const JournalController = {
  async create(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { title, description } = req.body;

    const { data, error } = await JournalService.createJournal(userId, title, description);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  },

  async update(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { title, description } = req.body;

    const { data, error } = await JournalService.updateJournal(userId, id, title, description);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  },

  async remove(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const { error } = await JournalService.deleteJournal(userId, id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Journal deleted" });
  },

  async getAll(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { data, error } = await JournalService.getAllJournals(userId);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  },

  async getOne(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const { data, error } = await JournalService.getJournalById(userId, id);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  },
};
