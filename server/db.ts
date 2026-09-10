import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface Participant {
  participant_id: string;
  name: string;
  passcode: string;
  start_time: number | null;
  submission_time: number | null;
  status:
    | 'not_started'
    | 'in_progress'
    | 'completed'
    | 'time_expired';
  score: number;
  tab_switch_count: number;
  time_taken_seconds: number;
  time_taken_formatted: string;
  answered_count: number;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  question_id: string;
  question_number: number;
  title: string;
  question_text: string;
  image_path: string;
  options: QuestionOption[];
  correct_answer: string;
  marks: number;
}

export interface TabSwitchEvent {
  id: string;
  participant_id: string;
  attempt_id: string;
  event_type: string;
  timestamp: number;
}

const DURATION_SECONDS = 35 * 60;

// =============================================================
// QUESTIONS
// =============================================================

const INITIAL_QUESTIONS: Question[] = [
  {
    question_id: 'q1',
    question_number: 1,
    title: 'Puzzle Challenge: Scrambled Python Program',
    question_text:
      'The code below is scrambled into 9 pieces. What is the correct sequence of code pieces to assemble a valid, working Python program?',
    image_path: '/static/questions/question_01.png',
    options: [
      {
        id: 'A',
        text: '7 -> 6 -> 3 -> 1 -> 2 -> 4 -> 5 -> 8 -> 9',
      },
      {
        id: 'B',
        text: '7 -> 3 -> 6 -> 1 -> 2 -> 4 -> 5 -> 8 -> 9',
      },
      {
        id: 'C',
        text: '6 -> 3 -> 7 -> 1 -> 2 -> 4 -> 5 -> 8 -> 9',
      },
      {
        id: 'D',
        text: '7 -> 6 -> 3 -> 8 -> 9 -> 1 -> 2 -> 4 -> 5',
      },
    ],
    correct_answer: 'A',
    marks: 5,
  },

  {
    question_id: 'q2',
    question_number: 2,
    title: 'C Programming: Function Pointer Implementation',
    question_text:
      'Fill in lines 5–7 using function pointers to make the program print: Result: 15',
    image_path: '/static/questions/question_02.png',
    options: [
      {
        id: 'A',
        text:
          'int (*op)(int, int) = add;\nint total = op(nums[0], nums[1]);\ntotal = op(total, nums[2]);',
      },
      {
        id: 'B',
        text:
          'int *op(int, int) = &add;\nint total = (*op)(nums[0], nums[1]);\ntotal = *op(total, nums[2]);',
      },
      {
        id: 'C',
        text:
          'int (*op)(int, int) = *add;\nint total = (*op)(nums, *nums + 1);\ntotal += nums[3];',
      },
      {
        id: 'D',
        text:
          'void (*op)(int, int) = add;\nint total = nums[0] + nums[1];\ntotal = (int)op(total, nums[2]);',
      },
    ],
    correct_answer: 'A',
    marks: 5,
  },

  {
    question_id: 'q3',
    question_number: 3,
    title: 'Database Puzzle: ER Diagram & Cardinality Analysis',
    question_text:
      'Which relationship has a many-to-many cardinality, and what is the primary key of ENROLLMENT?',
    image_path: '/static/questions/question_03.png',
    options: [
      {
        id: 'A',
        text:
          'Relationship: STUDENT - COURSE (ENROLLS) [Many-to-Many] | Primary Key: (student_id, course_id)',
      },
      {
        id: 'B',
        text:
          'Relationship: INSTRUCTOR - COURSE (TEACHES) [One-to-Many] | Primary Key: enrollment_id',
      },
      {
        id: 'C',
        text:
          'Relationship: DEPARTMENT - INSTRUCTOR (HAS) [One-to-Many] | Primary Key: department_id',
      },
      {
        id: 'D',
        text:
          'Relationship: SEMESTER - COURSE (TAUGHT_IN) [Many-to-One] | Primary Key: semester_id',
      },
    ],
    correct_answer: 'A',
    marks: 5,
  },

  {
    question_id: 'q4',
    question_number: 4,
    title: 'Password Puzzle: Security Policy & Attack Log Analysis',
    question_text:
      'Which password is MOST likely to be valid under all known security specifications and attacker logs?',
    image_path: '/static/questions/question_04.png',
    options: [
      {
        id: 'A',
        text: 'karan@04',
      },
      {
        id: 'B',
        text: 'blue@204',
      },
      {
        id: 'C',
        text: 'mango#24',
      },
      {
        id: 'D',
        text: 'kblue$04',
      },
    ],
    correct_answer: 'D',
    marks: 5,
  },

  {
    question_id: 'q5',
    question_number: 5,
    title: 'Java Tricky Quiz: String Interning & Output Evaluation',
    question_text:
      'What is the exact console output of this Java program?',
    image_path: '/static/questions/question_05.png',
    options: [
      {
        id: 'A',
        text: 'Res: false,30',
      },
      {
        id: 'B',
        text: 'Res: true,1020',
      },
      {
        id: 'C',
        text: 'Res: false,10None',
      },
      {
        id: 'D',
        text: 'Compilation Error',
      },
    ],
    correct_answer: 'C',
    marks: 5,
  },

  {
    question_id: 'q6',
    question_number: 6,
    title: "Prim's Algorithm: Minimum Spanning Tree Edge Sequence",
    question_text:
      'Starting from node A: Which option correctly shows the exact order of edges added to form the MST, along with the total minimum weight?',
    image_path: '/static/questions/question_06.png',
    options: [
      {
        id: 'A',
        text:
          'A-C -> A-B -> B-D -> D-E -> E-G -> E-F  (Total = 25)',
      },
      {
        id: 'B',
        text:
          'A-C -> C-E -> E-D -> D-B -> B-F -> F-G -> G-D  (Total = 23)',
      },
      {
        id: 'C',
        text:
          'A-B -> B-D -> D-E -> E-C -> C-A -> A-F -> F-G  (Total = 24)',
      },
      {
        id: 'D',
        text:
          'A-C -> C-E -> E-D -> D-B -> B-A -> A-F -> F-G  (Total = 21)',
      },
    ],
    correct_answer: 'A',
    marks: 5,
  },

  {
    question_id: 'q7',
    question_number: 7,
    title: 'Puzzle Challenge: Prime Checking & String Reversal Sequence',
    question_text:
      'The code pieces define prime checking, string reversal, and execution. What is the correct sequence of code pieces to assemble the program?',
    image_path: '/static/questions/question_07.png',
    options: [
      {
        id: 'A',
        text: '1 -> 2 -> 3 -> 6 -> 9 -> 4 -> 5 -> 7 -> 8',
      },
      {
        id: 'B',
        text: '6 -> 9 -> 1 -> 2 -> 3 -> 4 -> 5 -> 7 -> 8',
      },
      {
        id: 'C',
        text: '1 -> 2 -> 3 -> 6 -> 4 -> 5 -> 7 -> 8 -> 9',
      },
      {
        id: 'D',
        text: '9 -> 4 -> 5 -> 7 -> 8 -> 1 -> 2 -> 3 -> 6',
      },
    ],
    correct_answer: 'A',
    marks: 5,
  },

  {
    question_id: 'q8',
    question_number: 8,
    title: 'Multistage Graph: Minimum-Cost Path Selection',
    question_text:
      'Starting from START and ending at T in the multistage graph, what is the minimum-cost path?',
    image_path: '/static/questions/question_08.png',
    options: [
      {
        id: 'A',
        text: 'START -> A -> D -> G -> T',
      },
      {
        id: 'B',
        text: 'START -> B -> E -> G -> T',
      },
      {
        id: 'C',
        text: 'START -> C -> F -> H -> T',
      },
      {
        id: 'D',
        text: 'START -> C -> E -> G -> T',
      },
    ],
    correct_answer: 'C',
    marks: 5,
  },

  {
    question_id: 'q9',
    question_number: 9,
    title: 'Puzzle Challenge: 4-Bit Binary Encoding & Decoding',
    question_text:
      'Given the encoded bitstream (0100 0011 0001 0101 0010 0110), what is the original decoded text message?',
    image_path: '/static/questions/question_09.png',
    options: [
      {
        id: 'A',
        text: 'D C A E B F',
      },
      {
        id: 'B',
        text: 'D C A D B F',
      },
      {
        id: 'C',
        text: 'E C A E B F',
      },
      {
        id: 'D',
        text: 'D C E B F A',
      },
    ],
    correct_answer: 'A',
    marks: 5,
  },

  {
    question_id: 'q10',
    question_number: 10,
    title: 'Data Structures: Stack Operations & Trap Element',
    question_text:
      'Execute the given stack operations in sequential order. Which element is directly above 4 at the end?',
    image_path: '/static/questions/question_10.png',
    options: [
      {
        id: 'A',
        text: '3',
      },
      {
        id: 'B',
        text: '5',
      },
      {
        id: 'C',
        text: '20',
      },
      {
        id: 'D',
        text: '10',
      },
    ],
    correct_answer: 'B',
    marks: 5,
  },
];

// =============================================================
// SESSION STORE + PERSISTENCE
// =============================================================

interface SessionData {
  participant: Participant;
  answers: Record<string, string>;
  attemptId: string;
  tabSwitches: TabSwitchEvent[];
}

/*
 * NO PRE-SEEDED PARTICIPANTS.
 *
 * A participant is created only when they actually log in.
 *
 * Participant sessions are saved to:
 *
 * data/participants.json
 *
 * This keeps participant results after a server restart.
 */
const sessions = new Map<string, SessionData>();

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'data')
  : path.join(process.cwd(), 'data');

const SESSIONS_FILE = path.join(
  DATA_DIR,
  'participants.json'
);

function loadSessions(): void {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) {
      return;
    }

    const raw = fs.readFileSync(
      SESSIONS_FILE,
      'utf-8'
    );

    if (!raw.trim()) {
      return;
    }

    const savedSessions =
      JSON.parse(raw);

    for (
      const [participantId, session]
      of Object.entries(savedSessions)
    ) {
      sessions.set(
        participantId,
        session as SessionData
      );
    }

    console.log(
      `Loaded ${sessions.size} participant session(s).`
    );
  } catch (error) {
    console.error(
      'Failed to load participant sessions:',
      error
    );
  }
}

function saveSessions(): void {
  try {
    const data =
      Object.fromEntries(sessions);

    fs.mkdirSync(
      path.dirname(SESSIONS_FILE),
      {
        recursive: true,
      }
    );

    fs.writeFileSync(
      SESSIONS_FILE,
      JSON.stringify(
        data,
        null,
        2
      ),
      'utf-8'
    );
  } catch (error) {
    console.error(
      'Failed to save participant sessions:',
      error
    );
  }
}

function deleteSessionsFile(): void {
  try {
    if (
      fs.existsSync(
        SESSIONS_FILE
      )
    ) {
      fs.unlinkSync(
        SESSIONS_FILE
      );
    }
  } catch (error) {
    console.error(
      'Failed to delete participant sessions file:',
      error
    );
  }
}

// =============================================================
// HELPERS
// =============================================================

function createEmptyParticipant(
  participantId: string,
  name: string
): Participant {
  return {
    participant_id:
      participantId,
    name,
    passcode: '',
    start_time: null,
    submission_time: null,
    status: 'not_started',
    score: 0,
    tab_switch_count: 0,
    time_taken_seconds: 0,
    time_taken_formatted: '',
    answered_count: 0,
  };
}

function findSession(
  participantId: string
): SessionData | null {
  const cleanId =
    participantId
      .trim()
      .toUpperCase();

  return (
    sessions.get(cleanId) ||
    null
  );
}

function formatTimeTaken(
  seconds: number
): string {
  const safeSeconds =
    Math.max(
      0,
      Math.floor(seconds)
    );

  const mins =
    Math.floor(
      safeSeconds / 60
    );

  const secs =
    safeSeconds % 60;

  return `${mins} min ${
    secs < 10 ? '0' : ''
  }${secs} sec`;
}

function calculateScore(
  session: SessionData
) {
  let score = 0;
  let correctCount = 0;
  let answeredCount = 0;

  for (
    const question
    of INITIAL_QUESTIONS
  ) {
    const chosen =
      session.answers[
        question.question_id
      ];

    if (!chosen) {
      continue;
    }

    answeredCount++;

    if (
      chosen
        .trim()
        .toUpperCase() ===
      question.correct_answer
        .trim()
        .toUpperCase()
    ) {
      score += question.marks;
      correctCount++;
    }
  }

  return {
    score,
    correctCount,
    answeredCount,
  };
}

// =============================================================
// PRE-SEEDED PARTICIPANTS
// =============================================================

export interface PreseededParticipant {
  sNo: number;
  participantId: string;
  passcode: string;
}

export const PRESEEDED_PARTICIPANTS: Record<string, PreseededParticipant> = {
  ZENTRIX001: { sNo: 1, participantId: 'ZENTRIX001', passcode: 'Nova#4821' },
  ZENTRIX002: { sNo: 2, participantId: 'ZENTRIX002', passcode: 'Byte@9362' },
  ZENTRIX003: { sNo: 3, participantId: 'ZENTRIX003', passcode: 'Apex#7154' },
  ZENTRIX004: { sNo: 4, participantId: 'ZENTRIX004', passcode: 'Volt@2849' },
  ZENTRIX005: { sNo: 5, participantId: 'ZENTRIX005', passcode: 'Pixel#6317' },
  ZENTRIX006: { sNo: 6, participantId: 'ZENTRIX006', passcode: 'Pulse@5193' },
  ZENTRIX007: { sNo: 7, participantId: 'ZENTRIX007', passcode: 'Cyber#8426' },
  ZENTRIX008: { sNo: 8, participantId: 'ZENTRIX008', passcode: 'Logic@3751' },
  ZENTRIX009: { sNo: 9, participantId: 'ZENTRIX009', passcode: 'Orbit#9264' },
  ZENTRIX010: { sNo: 10, participantId: 'ZENTRIX010', passcode: 'Spark@4185' },
  ZENTRIX011: { sNo: 11, participantId: 'ZENTRIX011', passcode: 'Vector#7392' },
  ZENTRIX012: { sNo: 12, participantId: 'ZENTRIX012', passcode: 'Quantum@8514' },
  ZENTRIX013: { sNo: 13, participantId: 'ZENTRIX013', passcode: 'Matrix#2679' },
  ZENTRIX014: { sNo: 14, participantId: 'ZENTRIX014', passcode: 'Flux@9431' },
  ZENTRIX015: { sNo: 15, participantId: 'ZENTRIX015', passcode: 'Nexus#3816' },
  ZENTRIX016: { sNo: 16, participantId: 'ZENTRIX016', passcode: 'Echo@6248' },
  ZENTRIX017: { sNo: 17, participantId: 'ZENTRIX017', passcode: 'Prism#5937' },
  ZENTRIX018: { sNo: 18, participantId: 'ZENTRIX018', passcode: 'Vortex@1863' },
  ZENTRIX019: { sNo: 19, participantId: 'ZENTRIX019', passcode: 'Zenith#7425' },
  ZENTRIX020: { sNo: 20, participantId: 'ZENTRIX020', passcode: 'Helix@3194' },
};

// =============================================================
// DATABASE INITIALIZER
// =============================================================

export async function initDatabase(): Promise<void> {
  loadSessions();

  for (const [id, item] of Object.entries(PRESEEDED_PARTICIPANTS)) {
    if (!sessions.has(id)) {
      const participant: Participant = {
        participant_id: id,
        name: `Participant ${item.sNo}`,
        passcode: item.passcode,
        start_time: null,
        submission_time: null,
        status: 'not_started',
        score: 0,
        tab_switch_count: 0,
        time_taken_seconds: 0,
        time_taken_formatted: '',
        answered_count: 0,
      };

      sessions.set(id, {
        participant,
        answers: {},
        attemptId: '',
        tabSwitches: [],
      });
    } else {
      const s = sessions.get(id)!;
      s.participant.passcode = item.passcode;
    }
  }

  saveSessions();

  console.log(
    'In-memory quiz session store initialized with 20 pre-seeded ZENTRIX participants.'
  );
  console.log(
    'Participant sessions are persisted to data/participants.json.'
  );
}

// =============================================================
// PARTICIPANT LOGIN
// =============================================================

export function authenticateParticipant(
  participantId: string,
  candidateName?: string,
  password?: string
): { success: boolean; participant?: Participant; error?: string } {
  const cleanId = participantId.trim().toUpperCase();
  const cleanName = candidateName?.trim() || '';
  const cleanPass = (password || '').trim();

  if (!cleanId) {
    return {
      success: false,
      error: 'Participant ID is required.',
    };
  }

  const preseeded = PRESEEDED_PARTICIPANTS[cleanId];
  if (!preseeded) {
    return {
      success: false,
      error: `Invalid Participant ID: "${cleanId}". Please enter an assigned ID (ZENTRIX001 to ZENTRIX020).`,
    };
  }

  if (cleanPass !== preseeded.passcode) {
    return {
      success: false,
      error: `Incorrect password for Participant ID "${cleanId}".`,
    };
  }

  const existing = findSession(cleanId);

  if (existing) {
    if (cleanName) {
      existing.participant.name = cleanName;
    }
    existing.participant.passcode = preseeded.passcode;
    saveSessions();

    return {
      success: true,
      participant: existing.participant,
    };
  }

  const participant = createEmptyParticipant(
    cleanId,
    cleanName || `Participant ${preseeded.sNo}`
  );
  participant.passcode = preseeded.passcode;

  const session: SessionData = {
    participant,
    answers: {},
    attemptId: '',
    tabSwitches: [],
  };

  sessions.set(cleanId, session);
  saveSessions();

  return {
    success: true,
    participant,
  };
}


// =============================================================
// GET PARTICIPANT
// =============================================================

export function getParticipantById(
  participantId: string
): Participant | null {
  const session =
    findSession(participantId);

  if (!session) {
    return null;
  }

  return session.participant;
}

// =============================================================
// PARTICIPANT STATE
// =============================================================

export function getParticipantState(
  participantId: string
) {
  const session =
    findSession(participantId);

  if (!session) {
    return null;
  }

  const participant =
    session.participant;

  let timeRemaining =
    DURATION_SECONDS;

  let isExpired = false;

  if (
    participant.status ===
      'in_progress' &&
    participant.start_time
  ) {
    const elapsed =
      Math.floor(
        (Date.now() -
          participant.start_time) /
          1000
      );

    timeRemaining =
      Math.max(
        0,
        DURATION_SECONDS -
          elapsed
      );

    if (
      timeRemaining <= 0
    ) {
      submitQuiz(
        participant.participant_id,
        true
      );

      return {
        ...session.participant,
        timeRemaining: 0,
        isExpired: true,
        durationSeconds:
          DURATION_SECONDS,
        currentTime:
          Date.now(),
        answers: {
          ...session.answers,
        },
      };
    }
  }

  if (
    participant.status ===
      'completed' ||
    participant.status ===
      'time_expired'
  ) {
    timeRemaining = 0;
    isExpired = true;
  }

  return {
    ...participant,
    timeRemaining,
    isExpired,
    durationSeconds:
      DURATION_SECONDS,
    currentTime:
      Date.now(),
    answers: {
      ...session.answers,
    },
  };
}

// =============================================================
// START QUIZ
// =============================================================

export function startQuiz(
  participantId: string
): {
  success: boolean;
  state: any;
  error?: string;
} {
  const session =
    findSession(participantId);

  if (!session) {
    return {
      success: false,
      state: null,
      error:
        'Participant is not logged in.',
    };
  }

  const participant =
    session.participant;

  if (
    participant.status ===
      'completed' ||
    participant.status ===
      'time_expired'
  ) {
    return {
      success: false,
      state:
        getParticipantState(
          participantId
        ),
      error:
        'Quiz has already been submitted.',
    };
  }

  if (
    participant.status ===
      'in_progress' &&
    participant.start_time
  ) {
    return {
      success: true,
      state:
        getParticipantState(
          participantId
        ),
    };
  }

  const now =
    Date.now();

  participant.status =
    'in_progress';

  participant.start_time =
    now;

  participant.submission_time =
    null;

  participant.score = 0;

  participant.time_taken_seconds =
    0;

  participant.time_taken_formatted =
    '';

  participant.answered_count =
    Object.keys(
      session.answers
    ).length;

  session.attemptId =
    crypto.randomUUID();

  saveSessions();

  return {
    success: true,
    state:
      getParticipantState(
        participantId
      ),
  };
}

// =============================================================
// SAVE ANSWER
// =============================================================

export function saveAnswer(
  participantId: string,
  questionId: string,
  selectedOption: string
): {
  success: boolean;
  answeredCount: number;
  error?: string;
} {
  const session =
    findSession(participantId);

  if (!session) {
    return {
      success: false,
      answeredCount: 0,
      error:
        'Participant is not logged in.',
    };
  }

  const participant =
    session.participant;

  if (
    participant.status !==
    'in_progress'
  ) {
    return {
      success: false,
      answeredCount:
        participant.answered_count,
      error:
        'Quiz is not active.',
    };
  }

  if (participant.start_time) {
    const elapsed =
      Date.now() -
      participant.start_time;

    if (
      elapsed >=
      DURATION_SECONDS * 1000
    ) {
      submitQuiz(
        participantId,
        true
      );

      return {
        success: false,
        answeredCount:
          participant.answered_count,
        error:
          'Time has expired.',
      };
    }
  }

  const question =
    INITIAL_QUESTIONS.find(
      (q) =>
        q.question_id ===
        questionId
    );

  if (!question) {
    return {
      success: false,
      answeredCount:
        participant.answered_count,
      error:
        'Question not found.',
    };
  }

  /*
   * Empty selectedOption clears the answer.
   */
  if (!selectedOption) {
    delete session.answers[
      questionId
    ];
  } else {
    session.answers[
      questionId
    ] = selectedOption;
  }

  participant.answered_count =
    Object.keys(
      session.answers
    ).length;

  saveSessions();

  return {
    success: true,
    answeredCount:
      participant.answered_count,
  };
}

// =============================================================
// TAB SWITCH
// =============================================================

export function recordTabSwitch(
  participantId: string,
  eventType: string =
    'visibilitychange'
): {
  tabSwitchCount: number;
} {
  const session =
    findSession(participantId);

  if (!session) {
    return {
      tabSwitchCount: 0,
    };
  }

  const participant =
    session.participant;

  /*
   * Prevent visibilitychange + window.blur
   * from counting as two separate tab switches.
   */
  const now =
    Date.now();

  const lastEvent =
    session.tabSwitches[
      session.tabSwitches.length - 1
    ];

  if (
    lastEvent &&
    now - lastEvent.timestamp <
      1500
  ) {
    return {
      tabSwitchCount:
        participant.tab_switch_count,
    };
  }

  const event: TabSwitchEvent = {
    id: crypto.randomUUID(),

    participant_id:
      participant.participant_id,

    attempt_id:
      session.attemptId,

    event_type:
      eventType,

    timestamp: now,
  };

  session.tabSwitches.push(
    event
  );

  participant.tab_switch_count =
    session.tabSwitches.length;

  saveSessions();

  return {
    tabSwitchCount:
      participant.tab_switch_count,
  };
}

// =============================================================
// SUBMIT QUIZ
// =============================================================

export function submitQuiz(
  participantId: string,
  isTimeExpired: boolean = false
): {
  success: boolean;
  message: string;
  status: string;
  timeTakenFormatted: string;
} {
  const session =
    findSession(participantId);

  if (!session) {
    return {
      success: false,
      message:
        'Participant is not logged in.',
      status: 'not_started',
      timeTakenFormatted: '',
    };
  }

  const participant =
    session.participant;

  if (
    participant.status ===
      'completed' ||
    participant.status ===
      'time_expired'
  ) {
    return {
      success: true,
      message:
        'Quiz already submitted.',
      status:
        participant.status,
      timeTakenFormatted:
        participant.time_taken_formatted,
    };
  }

  const now =
    Date.now();

  const startTime =
    participant.start_time ||
    now;

  const submissionTime =
    isTimeExpired
      ? startTime +
        DURATION_SECONDS *
          1000
      : now;

  const timeTakenSeconds =
    Math.min(
      DURATION_SECONDS,
      Math.max(
        1,
        Math.floor(
          (submissionTime -
            startTime) /
            1000
        )
      )
    );

  const result =
    calculateScore(session);

  participant.status =
    isTimeExpired
      ? 'time_expired'
      : 'completed';

  participant.submission_time =
    submissionTime;

  participant.score =
    result.score;

  participant.answered_count =
    result.answeredCount;

  participant.time_taken_seconds =
    timeTakenSeconds;

  participant.time_taken_formatted =
    formatTimeTaken(
      timeTakenSeconds
    );

  saveSessions();

  return {
    success: true,
    message:
      'Quiz submitted successfully.',
    status:
      participant.status,
    timeTakenFormatted:
      participant.time_taken_formatted,
  };
}

// =============================================================
// PARTICIPANT QUESTIONS
// =============================================================

export function getParticipantQuestions() {
  return INITIAL_QUESTIONS.map(
    (q) => ({
      id: q.question_id,

      questionNumber:
        q.question_number,

      title:
        q.title,

      questionText:
        q.question_text,

      imagePath:
        q.image_path,

      options:
        q.options,

      marks:
        q.marks,
    })
  );
}

// =============================================================
// ADMIN DASHBOARD
// =============================================================

export function getAdminDashboard() {
  const activeSessions =
    Array.from(
      sessions.values()
    );

  const totalQuestions =
    INITIAL_QUESTIONS.length;

  const maxMarks =
    INITIAL_QUESTIONS.reduce(
      (sum, q) =>
        sum + q.marks,
      0
    );

  let startedCount = 0;
  let completedCount = 0;
  let notStartedCount = 0;
  let timeExpiredCount = 0;

  const leaderboard =
    activeSessions.map(
      (session) => {
        const p =
          session.participant;

        if (
          p.status ===
          'not_started'
        ) {
          notStartedCount++;
        } else if (
          p.status ===
          'in_progress'
        ) {
          startedCount++;
        } else if (
          p.status ===
          'completed'
        ) {
          completedCount++;
        } else if (
          p.status ===
          'time_expired'
        ) {
          timeExpiredCount++;
        }

        return p;
      }
    );

  leaderboard.sort(
    (a, b) => {
      const aFinished =
        a.status ===
          'completed' ||
        a.status ===
          'time_expired';

      const bFinished =
        b.status ===
          'completed' ||
        b.status ===
          'time_expired';

      if (
        aFinished &&
        !bFinished
      ) {
        return -1;
      }

      if (
        !aFinished &&
        bFinished
      ) {
        return 1;
      }

      if (
        aFinished &&
        bFinished
      ) {
        if (
          b.score !==
          a.score
        ) {
          return (
            b.score -
            a.score
          );
        }

        return (
          a.time_taken_seconds -
          b.time_taken_seconds
        );
      }

      return a.participant_id.localeCompare(
        b.participant_id
      );
    }
  );

  const rankedParticipants =
    leaderboard.map(
      (p, index) => ({
        rank:
          index + 1,

        participantId:
          p.participant_id,

        name:
          p.name,

        answered:
          `${p.answered_count}/${totalQuestions}`,

        answeredCount:
          p.answered_count,

        totalQuestions,

        marks:
          `${p.score}/${maxMarks}`,

        marksObtained:
          p.score,

        maxMarks,

        timeTaken:
          p.time_taken_formatted ||
          (p.status ===
          'in_progress'
            ? 'Running'
            : '-'),

        timeTakenSeconds:
          p.time_taken_seconds,

        startTime:
          p.start_time
            ? new Date(
                p.start_time
              ).toLocaleTimeString(
                [],
                {
                  hour: '2-digit',
                  minute:
                    '2-digit',
                  second:
                    '2-digit',
                }
              )
            : '-',

        startTimeRaw:
          p.start_time,

        submissionTime:
          p.submission_time
            ? new Date(
                p.submission_time
              ).toLocaleTimeString(
                [],
                {
                  hour: '2-digit',
                  minute:
                    '2-digit',
                  second:
                    '2-digit',
                }
              )
            : p.status ===
              'in_progress'
            ? 'In Progress'
            : '-',

        submissionTimeRaw:
          p.submission_time,

        tabSwitches:
          p.tab_switch_count,

        status:
          p.status ===
          'completed'
            ? 'Completed'
            : p.status ===
              'time_expired'
            ? 'Time Expired'
            : p.status ===
              'in_progress'
            ? 'In Progress'
            : 'Not Started',

        statusCode:
          p.status,
      })
    );

  const answers: any[] =
    [];

  for (
    const session of activeSessions
  ) {
    for (
      const [
        questionId,
        selectedOption,
      ] of Object.entries(
        session.answers
      )
    ) {
      answers.push({
        participant_id:
          session.participant
            .participant_id,

        question_id:
          questionId,

        selected_option:
          selectedOption,

        updated_at:
          Date.now(),
      });
    }
  }

  const tabSwitches =
    activeSessions.flatMap(
      (session) =>
        session.tabSwitches
    );

  return {
    summary: {
      totalParticipants:
        activeSessions.length,

      started:
        startedCount,

      completed:
        completedCount,

      notStarted:
        notStartedCount,

      timeExpired:
        timeExpiredCount,

      totalQuestions,

      maxMarks,
    },

    leaderboard:
      rankedParticipants,

    allQuestions:
      INITIAL_QUESTIONS,

    tabSwitches,

    answers,
  };
}

// =============================================================
// RESET ONE PARTICIPANT
// =============================================================

export function resetParticipant(
  participantId: string
): boolean {
  const cleanId =
    participantId
      .trim()
      .toUpperCase();

  if (!cleanId) {
    return false;
  }

  const preseeded = PRESEEDED_PARTICIPANTS[cleanId];
  if (preseeded) {
    sessions.set(cleanId, {
      participant: {
        participant_id: cleanId,
        name: `Participant ${preseeded.sNo}`,
        passcode: preseeded.passcode,
        start_time: null,
        submission_time: null,
        status: 'not_started',
        score: 0,
        tab_switch_count: 0,
        time_taken_seconds: 0,
        time_taken_formatted: '',
        answered_count: 0,
      },
      answers: {},
      attemptId: '',
      tabSwitches: [],
    });
  } else {
    sessions.delete(cleanId);
  }

  saveSessions();

  console.log(`Participant ${cleanId} reset.`);
  return true;
}

// =============================================================
// RESET ALL PARTICIPANTS
// =============================================================

export function resetAll(): number {
  const count = Object.keys(PRESEEDED_PARTICIPANTS).length;

  sessions.clear();

  for (const [id, item] of Object.entries(PRESEEDED_PARTICIPANTS)) {
    sessions.set(id, {
      participant: {
        participant_id: id,
        name: `Participant ${item.sNo}`,
        passcode: item.passcode,
        start_time: null,
        submission_time: null,
        status: 'not_started',
        score: 0,
        tab_switch_count: 0,
        time_taken_seconds: 0,
        time_taken_formatted: '',
        answered_count: 0,
      },
      answers: {},
      attemptId: '',
      tabSwitches: [],
    });
  }

  saveSessions();

  console.log(
    `RESET ALL: ${count} participant session(s) reset to initial state.`
  );

  return count;
}

// =============================================================
// QUESTION EXPLANATIONS
// =============================================================

const QUESTION_EXPLANATIONS: Record<
  string,
  string
> = {
  q1:
    'Correct sequence: 7 -> 6 -> 3 -> 1 -> 2 -> 4 -> 5 -> 8 -> 9. The try block comes first, followed by the prompt, input, condition, output, else branch, and exception handling.',

  q2:
    'Option A correctly declares a function pointer to add and uses it to calculate 2 + 5 + 8 = 15.',

  q3:
    'STUDENT and COURSE have a many-to-many relationship. The ENROLLMENT primary key is (student_id, course_id).',

  q4:
    'kblue$04 is the intended valid password because it satisfies the stated length, digit, special-character, lowercase-character, and name restrictions.',

  q5:
    's1 and s2 reference different String objects, so b1 is false. s3 is the interned version of Java, so b2 is true. The conditional therefore prints 10.',

  q6:
    "Prim's algorithm produces the minimum spanning tree with total weight 25. Option A is correct.",

  q7:
    'Correct sequence: 1 -> 2 -> 3 -> 6 -> 9 -> 4 -> 5 -> 7 -> 8.',

  q8:
    'The minimum-cost path is START -> C -> F -> H -> T with total cost 12. Option C is correct.',

  q9:
    'The bit groups decode as D, C, A, E, B, F. Option A is correct.',

  q10:
    'After all stack operations, the final stack has 20 above 5 above 4. Therefore, the element directly above 4 is 5. Option B is correct.',
};

// =============================================================
// FINAL RESULT
// =============================================================

export function getParticipantQuizResult(
  participantId: string
) {
  const session =
    findSession(participantId);

  if (!session) {
    return null;
  }

  const participant =
    session.participant;

  const reviews =
    INITIAL_QUESTIONS.map(
      (q) => {
        const chosen =
          session.answers[
            q.question_id
          ] || null;

        const correctOpt =
          q.options.find(
            (o) =>
              o.id ===
              q.correct_answer
          );

        let selectedOptionText:
          | string
          | null = null;

        if (chosen) {
          const selectedOpt =
            q.options.find(
              (o) =>
                o.id ===
                chosen
            );

          selectedOptionText =
            selectedOpt?.text ||
            chosen;
        }

        const isCorrect =
          Boolean(
            chosen &&
              chosen
                .trim()
                .toUpperCase() ===
              q.correct_answer
                .trim()
                .toUpperCase()
          );

        return {
          questionId:
            q.question_id,

          questionNumber:
            q.question_number,

          title:
            q.title,

          questionText:
            q.question_text,

          imagePath:
            q.image_path,

          selectedOption:
            chosen,

          selectedOptionText:
            selectedOptionText ||
            'Not Answered / Skipped',

          correctAnswer:
            q.correct_answer,

          correctAnswerText:
            correctOpt?.text ||
            q.correct_answer,

          isCorrect,

          marksEarned:
            isCorrect
              ? q.marks
              : 0,

          maxMarks:
            q.marks,

          isDragDrop:
            q.question_id ===
              'q1' ||
            q.question_id ===
              'q7',

          explanation:
            QUESTION_EXPLANATIONS[
              q.question_id
            ] ||
            'Verified answer.',
        };
      }
    );

  const score =
    reviews.reduce(
      (sum, review) =>
        sum +
        review.marksEarned,
      0
    );

  const correctCount =
    reviews.filter(
      (review) =>
        review.isCorrect
    ).length;

  const answeredCount =
    reviews.filter(
      (review) =>
        Boolean(
          review.selectedOption
        )
    ).length;

  const totalMarks =
    INITIAL_QUESTIONS.reduce(
      (sum, q) =>
        sum + q.marks,
      0
    );

  return {
    participantId:
      participant.participant_id,

    name:
      participant.name,

    status:
      participant.status,

    score,

    totalMarks,

    percentage:
      totalMarks > 0
        ? Math.round(
            (score /
              totalMarks) *
              100
          )
        : 0,

    answeredCount,

    totalQuestions:
      INITIAL_QUESTIONS.length,

    correctCount,

    incorrectCount:
      INITIAL_QUESTIONS.length -
      correctCount,

    timeTakenSeconds:
      participant.time_taken_seconds,

    timeTakenFormatted:
      participant.time_taken_formatted ||
      '0 min 00 sec',

    tabSwitchCount:
      participant.tab_switch_count,

    submissionTime:
      participant.submission_time ||
      Date.now(),

    reviews,
  };
}