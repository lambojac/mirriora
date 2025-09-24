import { Request, Response } from "express";
import { JournalService } from "./journals.service";
import { supabase } from "../../config/dbConn";
export const JournalController = {
  // create journal
  async create(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { title, description } = req.body;

    const { data, error } = await JournalService.createJournal(userId, title, description);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  },
  // update scan
  async update(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { title, description } = req.body;

    const { data, error } = await JournalService.updateJournal(userId, id, title, description);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  },
  // remove 
  async remove(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const { error } = await JournalService.deleteJournal(userId, id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Journal deleted" });
  },
  // getAll
  async getAll(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { data, error } = await JournalService.getAllJournals(userId);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  },
  // getonescan
  async getOne(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const { data, error } = await JournalService.getJournalById(userId, id);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  },
  // upload scan
  async uploadScan(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { id: journalId } = req.params;
    const file = req.file;
    const { title, personal_note,scan_result} = req.body;
  

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = `journals/${journalId}/${Date.now()}-${file.originalname}`;
    console.log("📌 File path to upload:", filePath);

    // Upload to Supabase storage
    const { data: storageData, error: storageError } = await supabase.storage
  .from("scan")
  .upload(filePath, file.buffer, { contentType: file.mimetype });

if (storageError) {
  return res.status(400).json({ error: storageError.message });
}

// ✅ Build public URL
const { data: publicUrl } = supabase.storage
  .from("scan")
  .getPublicUrl(storageData.path);

const { data, error } = await supabase
  .from("scans")
  .insert([
    {
      journal_id: journalId,
      file_url: publicUrl.publicUrl,
      user_id: userId,
        title,         
        personal_note,
        scan_result: scan_result ? JSON.parse(scan_result) : null,
    }
  ])
  .select();


    console.log("📌 DB insert result:", data);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  },

//getscans
async getScans(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { id: journalId } = req.params;

  const { data, error } = await supabase
    .from("scans")
    .select("*")
    .eq("journal_id", journalId)
    .eq("user_id", userId) 
    .select("*") 
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json(data);
},


async updatePersonalNote(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { scanId } = req.params;
  const { personal_note } = req.body;

  if (!personal_note) {
    return res.status(400).json({ error: "personal_note is required" });
  }

  const { data, error } = await supabase
    .from("scans")
    .update({ personal_note })
    .eq("id", scanId)     
    .eq("user_id", userId) 
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
}
};








