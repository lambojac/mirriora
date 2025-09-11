import { supabase } from "../../config/dbConn";


export const JournalService = {
  async createJournal(userId: string, title: string, description?: string) {
    return supabase
      .from("journals")
      .insert([{ user_id: userId, title, description }])
      .select();
  },

  async updateJournal(userId: string, id: string, title: string, description?: string) {
    return supabase
      .from("journals")
      .update({ title, description, updated_at: new Date() })
      .eq("id", id)
      .eq("user_id", userId) 
      .select();
  },

  async deleteJournal(userId: string, id: string) {
    return supabase.from("journals").delete().eq("id", id).eq("user_id", userId);
  },

  async getAllJournals(userId: string) {
    return supabase.from("journals").select("*").eq("user_id", userId);
  },

  async getJournalById(userId: string, id: string) {
    return supabase.from("journals").select("*").eq("id", id).eq("user_id", userId).single();
  },
};
