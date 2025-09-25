import { supabase } from "../../config/dbConn";

export const ChallengeService = {
  async createChallenge(userId: string, title: string, description: string, tasks: any[], personal_note: string, scan_result: any[]) {
    return await supabase
      .from("challenges")
      .insert([
        {
          user_id: userId,
          title,
          description,
          tasks: tasks || [],
          personal_note: personal_note || "",
          scan_result: scan_result || [],
        },
      ])
      .select();
  },

  async getAllChallenges(userId: string) {
    return await supabase
      .from("challenges")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  },

  async getChallengeById(userId: string, id: string) {
    return await supabase
      .from("challenges")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
  },

  async updatePersonalNote(userId: string, id: string, personal_note: string) {
    return await supabase
      .from("challenges")
      .update({ personal_note })
      .eq("id", id)
      .eq("user_id", userId)
      .select();
  },

  async updateTask(userId: string, id: string, taskIndex: number) {
    const { data: challenge, error: fetchError } = await supabase
      .from("challenges")
      .select("tasks")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError) return { data: null, error: fetchError };

    const tasks = challenge.tasks;
    if (!tasks[taskIndex]) {
      return { data: null, error: { message: "Task not found" } };
    }

    tasks[taskIndex].complete = true;

    return await supabase
      .from("challenges")
      .update({ tasks })
      .eq("id", id)
      .eq("user_id", userId)
      .select();
  },

  async deleteTask(userId: string, id: string, taskIndex: number) {
    const { data: challenge, error: fetchError } = await supabase
      .from("challenges")
      .select("tasks")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError) return { data: null, error: fetchError };

    const tasks = challenge.tasks;
    if (!tasks[taskIndex]) {
      return { data: null, error: { message: "Task not found" } };
    }

    tasks.splice(taskIndex, 1);

    return await supabase
      .from("challenges")
      .update({ tasks })
      .eq("id", id)
      .eq("user_id", userId)
      .select();
  },

  async uploadScan(userId: string, challengeId: string, file: Express.Multer.File, scan_result: string) {
    const filePath = `challenges/${challengeId}/${Date.now()}-${file.originalname}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from("scan")
      .upload(filePath, file.buffer, { contentType: file.mimetype });

    if (storageError) return { data: null, error: storageError };

    const { data: publicUrl } = supabase.storage
      .from("scan")
      .getPublicUrl(storageData.path);

    // Append new scan result
    const newScan = {
      file_url: publicUrl.publicUrl,
      uploaded_at: new Date(),
      ...(scan_result ? JSON.parse(scan_result) : {}),
    };

    // Fetch current challenge scans
    const { data: challenge, error: fetchError } = await supabase
      .from("challenges")
      .select("scan_result")
      .eq("id", challengeId)
      .eq("user_id", userId)
      .single();

    if (fetchError) return { data: null, error: fetchError };

    const updatedScans = [...(challenge.scan_result || []), newScan];

    return await supabase
      .from("challenges")
      .update({ scan_result: updatedScans })
      .eq("id", challengeId)
      .eq("user_id", userId)
      .select();
  },
};
