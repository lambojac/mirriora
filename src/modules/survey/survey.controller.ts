import { Request, Response } from "express";
import { getNextQuestion, submitAnswer,getAllQuestions,getAnsweredQuestions,getUnansweredQuestions, } from "./survey.service";

export const getNext = async (req: Request, res: Response) => {
  try {
     const { userId } = req.params;
    const question = await getNextQuestion(userId);

    if (!question) {
      return res.json({ done: true, message: "Survey completed" });
    }

    res.json({
      questionId: question.id,
      questionText: question.question_text,
      options: question.options,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const answer = async (req: Request, res: Response) => {
  try {
     const { userId } = req.params;
    const { questionId, answer } = req.body;

    const savedAnswer = await submitAnswer(userId, questionId, answer);

    res.json({ success: true, answer: savedAnswer });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


export const fetchAll = async (req: Request, res: Response) => {
  try {
    const questions = await getAllQuestions();
    res.json(questions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const fetchAnswered = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const answers = await getAnsweredQuestions(userId);
    res.json(answers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const fetchUnanswered = async (req: Request, res: Response) => {
  try {
   const { userId } = req.params;

    const questions = await getUnansweredQuestions(userId);
    res.json(questions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};