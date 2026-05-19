import { z } from "zod";

export const ReplySchema = z.object({
  style: z.string().min(1),
  text: z.string().min(10).max(400),
  why: z.string().min(1),
});

export const RedLineSchema = z.object({
  phrase: z.string().min(1).max(60),
  reason: z.string().min(1),
});

export const CoachResultSchema = z.object({
  emotion: z.string().min(1).max(20),
  emotionDetail: z.string().min(1).max(200),
  subtext: z.string().min(1).max(200),
  realNeed: z.string().min(1).max(200),
  replies: z.array(ReplySchema).min(3).max(4),
  redLines: z.array(RedLineSchema).min(1).max(5),
  emotionKeywords: z.array(z.string().min(1).max(20)).max(8).optional(),
});

export type CoachResultParsed = z.infer<typeof CoachResultSchema>;
