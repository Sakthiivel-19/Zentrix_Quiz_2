import express from 'express';
import path from 'path';
import crypto from 'crypto';

import {
  initDatabase,
  authenticateParticipant,
  getParticipantState,
  startQuiz,
  saveAnswer,
  recordTabSwitch,
  submitQuiz,
  getParticipantQuestions,
  getParticipantQuizResult,
  getAdminDashboard,
  resetParticipant,
  resetAll,
} from './db.ts';

export const app = express();

// Initialize database
initDatabase().catch((err) => {
  console.error('Failed to initialize database:', err);
});

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'QuizAdmin@2026';

const adminSessions = new Map<string, number>();
const ADMIN_SESSION_TTL = 8 * 60 * 60 * 1000;

function createAdminSession() {
  const token = crypto.randomBytes(32).toString('hex');

  adminSessions.set(
    token,
    Date.now() + ADMIN_SESSION_TTL
  );

  return token;
}

function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const auth = req.headers.authorization || '';

  const token = auth.startsWith('Bearer ')
    ? auth.slice(7)
    : '';

  const expiresAt = adminSessions.get(token);

  if (!expiresAt || expiresAt < Date.now()) {
    adminSessions.delete(token);

    return res.status(401).json({
      success: false,
      error: 'Administrator login required.',
    });
  }

  next();
}

app.use(express.json());
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && 'status' in err && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload format.' });
  }
  next(err);
});

// Support custom admin portal paths and rewrite to root SPA index
app.use((req, res, next) => {
  const pathname = req.path.toLowerCase();
  if (
    pathname.includes('portal-secret-x2026') ||
    pathname.startsWith('/admin')
  ) {
    if (!pathname.startsWith('/api') && !pathname.startsWith('/static')) {
      req.url = '/index.html';
    }
  }
  next();
});

// -------------------------------------------------------------
// STATIC QUESTION IMAGES
// -------------------------------------------------------------

const questionsDir = path.join(
  process.cwd(),
  'public',
  'static',
  'questions'
);

app.use(
  '/static/questions',
  express.static(questionsDir)
);

// -------------------------------------------------------------
// HEALTH
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    serverTime: Date.now(),
  });
});

// -------------------------------------------------------------
// PARTICIPANT LOGIN
// -------------------------------------------------------------

app.post('/api/login', (req, res) => {
  const participantId = String(
    req.body?.participantId || ''
  ).trim();

  const name = String(
    req.body?.name || ''
  ).trim();

  const password = String(
    req.body?.password || ''
  ).trim();

  if (!participantId) {
    return res.status(400).json({
      error: 'ID Number is required',
    });
  }

  if (!password) {
    return res.status(400).json({
      error: 'Password is required',
    });
  }

  const authResult = authenticateParticipant(
    participantId,
    name,
    password
  );

  if (!authResult.success || !authResult.participant) {
    return res.status(401).json({
      error: authResult.error || 'Failed to authenticate participant session.',
    });
  }

  const participant = authResult.participant;

  const state = getParticipantState(
    participant.participant_id
  );

  if (!state) {
    return res.status(500).json({
      error: 'Failed to create participant session.',
    });
  }

  return res.json({
    success: true,

    participant: {
      id: participant.participant_id,
      name: participant.name,
    },

    state,
  });
});

// -------------------------------------------------------------
// GET QUIZ STATE
// -------------------------------------------------------------

app.get('/api/quiz/state', (req, res) => {
  const participantId =
    (req.headers['x-participant-id'] as string) ||
    (req.query.participantId as string);

  if (!participantId) {
    return res.status(400).json({
      error: 'Participant ID is required',
    });
  }

  const state = getParticipantState(
    participantId
  );

  if (!state) {
    return res.status(404).json({
      error: 'Participant not found',
    });
  }

  return res.json({
    success: true,
    state,
  });
});

// -------------------------------------------------------------
// START QUIZ
// -------------------------------------------------------------

app.post('/api/quiz/start', (req, res) => {
  const participantId = String(
    req.body?.participantId || ''
  ).trim();

  if (!participantId) {
    return res.status(400).json({
      error: 'Participant ID is required',
    });
  }

  const result = startQuiz(participantId);

  if (!result.success) {
    return res.status(400).json({
      error: result.error,
      state: result.state,
    });
  }

  return res.json({
    success: true,
    state: result.state,
  });
});

// -------------------------------------------------------------
// GET QUESTIONS
// -------------------------------------------------------------

app.get('/api/quiz/questions', (req, res) => {
  const questions = getParticipantQuestions();

  return res.json({
    success: true,
    questions,
  });
});

// -------------------------------------------------------------
// SAVE ANSWER
// -------------------------------------------------------------

app.post('/api/quiz/answer', (req, res) => {
  const participantId = String(
    req.body?.participantId || ''
  ).trim();

  const questionId = String(
    req.body?.questionId || ''
  ).trim();

  // Empty string is allowed because participant can clear an answer
  const selectedOption =
    typeof req.body?.selectedOption === 'string'
      ? req.body.selectedOption
      : '';

  if (!participantId || !questionId) {
    return res.status(400).json({
      error: 'Missing required parameters',
    });
  }

  const result = saveAnswer(
    participantId,
    questionId,
    selectedOption
  );

  if (!result.success) {
    return res.status(400).json({
      error: result.error,
      answeredCount: result.answeredCount,
    });
  }

  return res.json({
    success: true,
    answeredCount: result.answeredCount,
  });
});

// -------------------------------------------------------------
// RECORD TAB SWITCH
// -------------------------------------------------------------

app.post('/api/quiz/tab-switch', (req, res) => {
  const participantId = String(
    req.body?.participantId || ''
  ).trim();

  const eventType = String(
    req.body?.eventType || 'visibilitychange'
  );

  if (!participantId) {
    return res.status(400).json({
      error: 'Participant ID is required',
    });
  }

  const result = recordTabSwitch(
    participantId,
    eventType
  );

  return res.json({
    success: true,
    tabSwitchCount: result.tabSwitchCount,
    warning:
      'Warning: Leaving the quiz page has been detected.',
  });
});

// -------------------------------------------------------------
// SUBMIT QUIZ
// -------------------------------------------------------------

app.post('/api/quiz/submit', (req, res) => {
  const participantId = String(
    req.body?.participantId || ''
  ).trim();

  const forceTimeExpired =
    Boolean(req.body?.forceTimeExpired);

  if (!participantId) {
    return res.status(400).json({
      error: 'Participant ID is required',
    });
  }

  const submitRes = submitQuiz(
    participantId,
    forceTimeExpired
  );

  const result = getParticipantQuizResult(
    participantId
  );

  return res.json({
    success: true,
    message: 'Quiz submitted successfully.',
    status: submitRes.status,
    timeTakenFormatted:
      submitRes.timeTakenFormatted,
    result,
  });
});

// -------------------------------------------------------------
// GET QUIZ RESULT
// -------------------------------------------------------------

app.get('/api/quiz/result', (req, res) => {
  const participantId =
    req.query.participantId as string;

  if (!participantId) {
    return res.status(400).json({
      error: 'Participant ID is required',
    });
  }

  const result = getParticipantQuizResult(
    participantId
  );

  if (!result) {
    return res.status(404).json({
      error: 'Participant result not found',
    });
  }

  return res.json({
    success: true,
    result,
  });
});

// -------------------------------------------------------------
// ADMIN LOGIN
// -------------------------------------------------------------

app.post('/api/admin/login', (req, res) => {
  const username = String(
    req.body?.username || ''
  ).trim();

  const password = String(
    req.body?.password || ''
  );

  if (
    username !== ADMIN_USERNAME ||
    password !== ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      success: false,
      error:
        'Invalid administrator username or password.',
    });
  }

  const token = createAdminSession();

  return res.json({
    success: true,
    token,

    admin: {
      username: ADMIN_USERNAME,
      role: 'Administrator',
    },
  });
});

// -------------------------------------------------------------
// ADMIN LOGOUT
// -------------------------------------------------------------

app.post(
  '/api/admin/logout',
  requireAdmin,
  (req, res) => {
    const auth =
      req.headers.authorization || '';

    const token =
      auth.startsWith('Bearer ')
        ? auth.slice(7)
        : '';

    adminSessions.delete(token);

    return res.json({
      success: true,
      message:
        'Administrator logged out successfully.',
    });
  }
);

// -------------------------------------------------------------
// ADMIN DASHBOARD
// -------------------------------------------------------------

app.get(
  '/api/admin/dashboard',
  requireAdmin,
  (req, res) => {
    const dashboard =
      getAdminDashboard();

    return res.json({
      success: true,
      ...dashboard,
    });
  }
);

// -------------------------------------------------------------
// ADMIN RESET
// -------------------------------------------------------------

app.post(
  '/api/admin/reset',
  requireAdmin,
  (req, res) => {
    const participantId =
      typeof req.body?.participantId === 'string'
        ? req.body.participantId.trim()
        : '';

    const doResetAll =
      req.body?.resetAll === true;

    // ---------------------------------------------------------
    // RESET ALL
    // ---------------------------------------------------------

    if (doResetAll) {
      try {
        const result = resetAll();

        return res.json({
          success: true,
          message:
            'All participant sessions have been reset.',
          resetCount:
            typeof result === 'number'
              ? result
              : undefined,
        });
      } catch (error) {
        console.error(
          'Reset all failed:',
          error
        );

        return res.status(500).json({
          success: false,
          error:
            'Failed to reset all participant sessions.',
        });
      }
    }

    // ---------------------------------------------------------
    // RESET ONE PARTICIPANT
    // ---------------------------------------------------------

    if (participantId) {
      try {
        const success =
          resetParticipant(participantId);

        if (!success) {
          return res.status(404).json({
            success: false,
            error:
              'Participant session not found.',
          });
        }

        return res.json({
          success: true,
          message:
            `Participant ${participantId} has been reset.`,
        });
      } catch (error) {
        console.error(
          `Reset participant ${participantId} failed:`,
          error
        );

        return res.status(500).json({
          success: false,
          error:
            'Failed to reset participant.',
        });
      }
    }

    // ---------------------------------------------------------
    // NOTHING SPECIFIED
    // ---------------------------------------------------------

    return res.status(400).json({
      success: false,
      error:
        'No participant specified.',
    });
  }
);

export default app;
