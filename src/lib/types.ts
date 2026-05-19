export type Perspective = "male-to-female" | "female-to-male";
export type RelationshipStage = "flirting" | "dating" | "committed" | "rough-patch";

export interface CoachInput {
  perspective: Perspective;
  stage?: RelationshipStage;
  message: string;
  context?: string;
}

export interface Reply {
  style: string;
  text: string;
  why: string;
}

export interface RedLine {
  phrase: string;
  reason: string;
}

export interface CoachResult {
  emotion: string;
  emotionDetail: string;
  subtext: string;
  realNeed: string;
  replies: Reply[];
  redLines: RedLine[];
  /** Trigger words/phrases from the original message worth highlighting. */
  emotionKeywords?: string[];
}

export interface CoachResponse {
  result?: CoachResult;
  error?: string;
  remaining?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
