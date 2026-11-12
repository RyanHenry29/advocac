export type ChatAction =
  | "ANSWER"
  | "CLARIFY"
  | "ESCALATE"
  | "REFUSE"
  | "HANDOFF"
  | "FALLBACK";

export interface KnowledgeSource {
  label: string;
  verified: string;
}

export interface KnowledgeTopic {
  id: string;
  label: string;
  patterns: Array<[string, number]>;
  clarify: string;
  answer: string;
  steps?: string[];
  docs?: string[];
  source?: KnowledgeSource;
  directHandoff?: boolean;
  escalateHint?: boolean;
  urgentIfExpired?: boolean;
}

export interface ChatContext {
  sessionId: string;
  phase: "CAPTURE" | "CLARIFY" | "ANSWER" | "PROFILE" | "HANDOFF";
  currentTopicId: string | null;
  pendingClarifyTopicId: string | null;
  profile: string | null;
  urgency: boolean;
  lastUserText: string;
}

export interface ChatRequestMessage {
  message: string;
  fromChip?: boolean;
  chipValue?: string;
  context: ChatContext;
}

export interface ChatChip {
  label: string;
  value?: string;
  primary?: boolean;
}

export interface ChatResponse {
  action: ChatAction;
  reply: string;
  source?: KnowledgeSource;
  steps?: string[];
  askProfile?: boolean;
  chips?: ChatChip[];
  handoffUrl?: string;
  context: ChatContext;
  topicLabel?: string;
}

export interface RefusalPattern {
  test: RegExp;
  reply: string;
}
