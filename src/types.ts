export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  questionNumber: number;
  title: string;
  questionText: string;
  imagePath: string;
  options: QuestionOption[];
  marks: number;
}

export interface ParticipantSession {
  id: string;
  name: string;
}

export interface QuizState {
  participant_id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'time_expired';
  start_time: number | null;
  submission_time: number | null;
  score: number;
  tab_switch_count: number;
  time_taken_seconds: number;
  time_taken_formatted: string;
  answered_count: number;
  timeRemaining: number;
  isExpired: boolean;
  durationSeconds: number;
  currentTime: number;
  answers?: Record<string, string>;
}

export interface QuestionReviewItem {
  questionId: string;
  questionNumber: number;
  title: string;
  questionText: string;
  imagePath: string;
  selectedOption: string | null;
  selectedOptionText: string | null;
  correctAnswer: string;
  correctAnswerText: string;
  isCorrect: boolean;
  marksEarned: number;
  maxMarks: number;
  isDragDrop: boolean;
  explanation: string;
}

export interface QuizSubmissionResult {
  participantId: string;
  name: string;
  status: 'completed' | 'time_expired';
  score: number;
  totalMarks: number;
  percentage: number;
  answeredCount: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  timeTakenSeconds: number;
  timeTakenFormatted: string;
  tabSwitchCount: number;
  submissionTime: number;
  reviews: QuestionReviewItem[];
}

export interface AdminParticipantRow {
  rank: number;
  participantId: string;
  name: string;
  answered: string;
  answeredCount: number;
  totalQuestions: number;
  marks: string;
  marksObtained: number;
  maxMarks: number;
  timeTaken: string;
  timeTakenSeconds: number;
  startTime: string;
  startTimeRaw: number | null;
  submissionTime: string;
  submissionTimeRaw: number | null;
  tabSwitches: number;
  status: string;
  statusCode: 'not_started' | 'in_progress' | 'completed' | 'time_expired';
}

export interface TabSwitchLog {
  id: string;
  participant_id: string;
  attempt_id: string;
  event_type: string;
  timestamp: number;
}

export interface AdminDashboardData {
  summary: {
    totalParticipants: number;
    started: number;
    completed: number;
    notStarted: number;
    timeExpired: number;
    totalQuestions: number;
    maxMarks: number;
  };
  leaderboard: AdminParticipantRow[];
  allQuestions: Array<{
    question_id: string;
    question_number: number;
    title: string;
    image_path: string;
    options: QuestionOption[];
    correct_answer: string;
    marks: number;
  }>;
  tabSwitches: TabSwitchLog[];
  answers: Array<{
    id: string;
    participant_id: string;
    question_id: string;
    selected_option: string;
    updated_at: number;
  }>;
}
