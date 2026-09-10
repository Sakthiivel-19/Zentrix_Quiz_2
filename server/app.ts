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
} from './db';

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
// API ROUTER (Handles both /api/* and /* paths)
// -------------------------------------------------------------

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    serverTime: Date.now(),
  });
});

router.post('/login', (req, res) => {
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

router.get('/quiz/state', (req, res) => {
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

router.post('/quiz/start', (req, res) => {
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

router.get('/quiz/questions', (req, res) => {
  const questions = getParticipantQuestions();

  return res.json({
    success: true,
    questions,
  });
});

router.post('/quiz/answer', (req, res) => {
  const participantId = String(
    req.body?.participantId || ''
  ).trim();

  const questionId = String(
    req.body?.questionId || ''
  ).trim();

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

router.post('/quiz/tab-switch', (req, res) => {
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

router.post('/quiz/submit', (req, res) => {
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

router.get('/quiz/result', (req, res) => {
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

router.post('/admin/login', (req, res) => {
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

router.post(
  '/admin/logout',
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

router.get(
  '/admin/dashboard',
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

router.post(
  '/admin/reset',
  requireAdmin,
  (req, res) => {
    const participantId =
      typeof req.body?.participantId === 'string'
        ? req.body.participantId.trim()
        : '';

    const doResetAll =
      req.body?.resetAll === true;

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

    return res.status(400).json({
      success: false,
      error:
        'No participant specified.',
    });
  }
);

// Mount router under /api AND / for universal compatibility
app.use('/api', router);
app.use('/', router);

// Catch-all error handler returning valid JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err?.message || 'An internal server error occurred.',
  });
});

export default app;
