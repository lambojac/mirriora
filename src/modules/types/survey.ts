export interface SurveyQuestion {
  id: string;
  question_text: string;
  options: string[];
  order_number: number;
}

export interface SurveyAnswer {
  id: string;
  user_id: string;
  question_id: string;
  answer: string;
  created_at: string;
}

export interface SurveyAnsweredQuestion {
    question_id: string;
}