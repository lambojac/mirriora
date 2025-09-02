import { supabase } from "../../config/dbConn";
import { SurveyQuestion, SurveyAnswer } from "../types/survey";
import {SurveyAnsweredQuestion} from "../types/survey"


export const getNextQuestion = async (userId: string): Promise<SurveyQuestion | null> => {
  const { data: answered } = await supabase
    .from("survey_answers")
    .select("question_id")
    .eq("user_id", userId);

const answeredIds: string[] = (answered as SurveyAnsweredQuestion[] | null)?.map(a => a.question_id) || [];

  const { data: question, error } = await supabase
    .from("survey_questions")
    .select("*")
    .not("id", "in", `(${answeredIds.join(",") || "null"})`)
    .order("order_number")
    .limit(1)
    .single();

  if (error) throw new Error(error.message);

  return question || null;
};

export const submitAnswer = async (
  userId: string,
  questionId: string,
  answer: string
): Promise<SurveyAnswer> => {
  const { data: existing, error: fetchError } = await supabase
    .from("survey_answers")
    .select("*")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  if (existing) {
    throw new Error("This question has already been answered.");
  }

  // Insert if not answered
  const { data, error } = await supabase
    .from("survey_answers")
    .insert([{ user_id: userId, question_id: questionId, answer }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as SurveyAnswer;
};


export const getAllQuestions = async (): Promise<SurveyQuestion[]> => {
  const { data, error } = await supabase
    .from("survey_questions")
    .select("*")
    .order("order_number");

  if (error) throw new Error(error.message);
  return data as SurveyQuestion[];
};

export const getAnsweredQuestions = async (userId: string): Promise<SurveyAnswer[]> => {
  const { data, error } = await supabase
    .from("survey_answers")
    .select("*, survey_questions(question_text, options, order_number)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as SurveyAnswer[];
};


export const getUnansweredQuestions = async (userId: string): Promise<SurveyQuestion[]> => {
  const { data: answered } = await supabase
    .from("survey_answers")
    .select("question_id")
    .eq("user_id", userId);

const answeredIds: string[] = (answered as SurveyAnsweredQuestion[] | null)?.map(a => a.question_id) || [];

  const { data, error } = await supabase
    .from("survey_questions")
    .select("*")
    .not("id", "in", `(${answeredIds.join(",") || "null"})`)
    .order("order_number");

  if (error) throw new Error(error.message);
  return data as SurveyQuestion[];
};