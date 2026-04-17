// ==========================================================================
// EmeraldQuest — Claude API (Two-Phase Tutor Architecture)
//
// Phase 1: Sonnet + Extended Thinking — reads & solves all problems (once per photo)
// Phase 2: Haiku — Socratic tutoring with known answers (every message)
// Escalation: Sonnet re-verify when student insists their answer is right
// Text-only: Haiku direct when no photo uploaded
// ==========================================================================

// ── Module-level state ──────────────────────────────────────────────
let _currentPageData = null;
let _currentProblemIndex = 0;
let _escalationCount = 0;
let _lastHomeworkImage = localStorage.getItem('eq_last_image') || null;

try {
  const saved = sessionStorage.getItem('eq_page_data');
  if (saved) _currentPageData = JSON.parse(saved);
} catch (e) {}

// ── Phase 1 System Prompt (Sonnet — extract & solve) ────────────────
const PHASE1_PROMPT = `You are a precise homework-solving engine. A student has uploaded a photo of their homework page.

1. READ every problem on the page carefully — miss nothing.
2. SOLVE each problem step-by-step. Double-check all arithmetic.
3. Return ONLY valid JSON. No markdown fences, no explanation outside the JSON.

CRITICAL:
- Solve every problem CORRECTLY. Verify arithmetic column by column.
- For multi-part problems, include ALL parts in the answer.
- Be thorough with acceptableAnswers — include formats with/without commas, with/without units, abbreviated and full units, with/without spaces.
- For word problems, read EVERY sentence. Subtle details matter.

JSON SCHEMA:
{
  "pageDescription": "Brief description of the homework page",
  "problems": [
    {
      "id": 1,
      "problemText": "Full text of the problem as written on the page",
      "problemType": "word_problem | arithmetic | visual | algebra | other",
      "answer": "The correct final answer as a string",
      "answerNumeric": 42,
      "acceptableAnswers": ["42", "42 units", ...],
      "solutionSteps": ["Step 1: ...", "Step 2: ..."],
      "visualDescription": "Description of diagrams/pictures, or null",
      "commonMistakes": [{"wrong": "35", "reason": "Forgot the second part"}]
    }
  ]
}

Return ONLY the JSON object. No other text.`;

// ── Phase 2 System Prompt (Haiku — Socratic tutor) ──────────────────
const TUTOR_SYSTEM_PROMPT = `You are a friendly, warm Socratic tutor for a 7-year-old in the EmeraldQuest homework app.

You have PRE-VERIFIED answers to all problems. Trust these answers absolutely.

RULES:
1. NEVER give the answer directly. Use Socratic method — ask guiding questions.
2. Simple, encouraging language. Keep responses SHORT (2-4 sentences max).
3. Be warm, patient, fun. Use "You're so close!", "Great thinking!", "Almost there!"

STARTING A NEW PROBLEM:
- Read the problemText and present it to the student.
- If the problem has a visualDescription, mention it naturally ("I can see some jugs in the picture...").
- Ask for the student's answer FIRST. Do NOT start teaching — give them a chance!

CHECKING ANSWERS:
- Compare the student's answer against acceptableAnswers (case-insensitive).
- Also compare numerically against answerNumeric if present.
- If correct on FIRST try → celebrate enthusiastically and end with {"solved": true}
- NEVER say a correct answer is wrong. NEVER say a wrong answer is correct.

WHEN THE STUDENT IS WRONG:
- Check commonMistakes for targeted feedback if their answer matches.
- Use solutionSteps to understand the logic, then generate your OWN Socratic questions based on what the student said. Do NOT follow a script.
- Guide with questions: "What do you think we should do first?" or "Let's look at this part again..."

WHEN THE STUDENT SOLVES IT:
- Celebrate with excitement!
- You MUST include {"solved": true} at the very end on its own line.
- REQUIRED — without it, the student does NOT get their emerald reward!

AUTO-ADVANCE:
- After solving, immediately present the next unsolved problem.
- Say "Great job! Next up:" then the problem text. Do NOT ask "which problem?" — just go.

STATUS SIGNAL (REQUIRED in EVERY response, on its own line at the end):
{"status": "asking", "problem": 1}             — presenting problem, waiting for answer
{"status": "hinting", "problem": 1, "hint": 2} — gave hint #2
{"status": "solved", "problem": 1}             — student answered correctly
{"status": "navigating"}                        — student requested a different problem

The status signal is the LAST thing in every response. No exceptions.

PROBLEM DATA:
`;

// ── Run Phase 1: Sonnet extracts & solves all problems from photo ────
async function runPhase1(imageBase64) {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': CONFIG.API_VERSION_PHASE1,
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: CONFIG.API_MODEL_PHASE1,
        max_tokens: CONFIG.API_MAX_TOKENS_PHASE1,
        thinking: {
          type: 'enabled',
          budget_tokens: CONFIG.API_THINKING_BUDGET
        },
        system: PHASE1_PROMPT,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: 'Extract and solve every problem on this homework page. Return JSON only.' }
          ]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Phase 1 API error: ${response.status}`);
    }

    const data = await response.json();

    let rawText = null;
    for (const block of data.content) {
      if (block.type === 'text') { rawText = block.text; break; }
    }
    if (!rawText) throw new Error('Phase 1: No text block in response');

    rawText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const result = JSON.parse(rawText);

    _currentPageData = result;
    _currentProblemIndex = 0;
    _escalationCount = 0;
    try { sessionStorage.setItem('eq_page_data', JSON.stringify(result)); } catch (e) {}

    console.log('Phase 1 complete:', result.pageDescription, `— ${result.problems.length} problems`);
    return result;
  } catch (error) {
    console.error('Phase 1 error:', error);
    return null;
  }
}

// ── Phase 2: Haiku Socratic tutoring with known answers ──────────────
async function sendToTutor(userMessage) {
  const apiKey = getApiKey();
  if (!apiKey) return getFallbackResponse(userMessage);

  const systemPrompt = TUTOR_SYSTEM_PROMPT + JSON.stringify(_currentPageData);
  const player = getCurrentPlayer();
  const chatHistory = player ? player.chatHistory : [];

  const messages = [];
  chatHistory.slice(-20).forEach(msg => messages.push({ role: msg.role, content: msg.content }));
  messages.push({ role: 'user', content: userMessage });

  try {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: CONFIG.API_MODEL_PHASE2,
        max_tokens: CONFIG.API_MAX_TOKENS_PHASE2,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Tutor API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantText = data.content[0]?.text || 'Hmm, can you try asking again?';

    if (player) {
      player.chatHistory.push({ role: 'user', content: userMessage });
      player.chatHistory.push({ role: 'assistant', content: assistantText });
      if (!player.chatStats) player.chatStats = [];
      if (player._currentPageId) {
        const current = player.chatStats.find(s => s.pageId === player._currentPageId);
        if (current) current.messages++;
      }
      saveState();
    }

    return assistantText;
  } catch (error) {
    console.error('Tutor API error:', error);
    return `Oops! I had a little trouble connecting. ${getFallbackResponse(userMessage)}`;
  }
}

// ── Escalation: Sonnet re-verify when student insists ────────────────
async function escalateToSonnet(problemData, studentAnswer) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const lastImage = localStorage.getItem('eq_last_image');
  const verifyPrompt = `A student answered "${studentAnswer}" for this problem: "${problemData.problemText}". The pre-computed answer was "${problemData.answer}". Re-verify: is the student correct? Respond with JSON only: {"correct": true/false, "correctAnswer": "...", "explanation": "..."}`;

  const content = [];
  if (lastImage) {
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: lastImage } });
  }
  content.push({ type: 'text', text: verifyPrompt });

  try {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: CONFIG.API_MODEL_ESCALATION,
        max_tokens: 512,
        messages: [{ role: 'user', content: content }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Escalation API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*"correct"[\s\S]*\}/);
    if (!jsonMatch) return null;

    const result = JSON.parse(jsonMatch[0]);

    if (result.correct === true && _currentPageData) {
      const problem = _currentPageData.problems.find(p => p.id === problemData.id);
      if (problem) {
        if (!problem.acceptableAnswers.map(a => a.toLowerCase()).includes(studentAnswer.toLowerCase())) {
          problem.acceptableAnswers.push(studentAnswer);
        }
        problem.answer = result.correctAnswer || studentAnswer;
        try { sessionStorage.setItem('eq_page_data', JSON.stringify(_currentPageData)); } catch (e) {}
      }
    }

    return result;
  } catch (error) {
    console.error('Escalation error:', error);
    return null;
  }
}

// ── Text-only: Haiku tutoring without a photo ────────────────────────
async function sendTextOnly(userMessage) {
  const apiKey = getApiKey();
  if (!apiKey) return getFallbackResponse(userMessage);

  const systemPrompt = 'You are a friendly homework tutor for a 2nd-grade student (age 7-8). NEVER give the answer directly — use Socratic method. Ask guiding questions. Keep responses SHORT (2-4 sentences). Be warm and encouraging. When the student reaches the correct answer, celebrate and include {"solved": true} at the end.';

  const player = getCurrentPlayer();
  const chatHistory = player ? player.chatHistory : [];

  const messages = [];
  chatHistory.slice(-20).forEach(msg => messages.push({ role: msg.role, content: msg.content }));
  messages.push({ role: 'user', content: userMessage });

  try {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: CONFIG.API_MODEL_TEXT_ONLY,
        max_tokens: CONFIG.API_MAX_TOKENS_TEXT_ONLY,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantText = data.content[0]?.text || 'Hmm, can you try asking again?';

    if (player) {
      player.chatHistory.push({ role: 'user', content: userMessage });
      player.chatHistory.push({ role: 'assistant', content: assistantText });
      saveState();
    }

    return assistantText;
  } catch (error) {
    console.error('Text-only API error:', error);
    return `Oops! I had a little trouble connecting. ${getFallbackResponse(userMessage)}`;
  }
}

// ── Main dispatcher — called by chat.js ──────────────────────────────
async function sendToClaude(userMessage, imageBase64 = null) {
  if (imageBase64) {
    _lastHomeworkImage = imageBase64;
    try { localStorage.setItem('eq_last_image', imageBase64); } catch (e) {}

    const player = getCurrentPlayer();
    if (player) {
      player.chatHistory = [];
      if (!player.chatStats) player.chatStats = [];
      player._currentPageId = Date.now();
      player.chatStats.push({ pageId: player._currentPageId, start: new Date().toISOString(), messages: 0 });
      saveState();
    }

    const pageData = await runPhase1(imageBase64);
    if (!pageData) return "I had trouble reading your homework page. Can you try uploading the photo again?";

    return await sendToTutor(userMessage || 'Help me with this homework!');
  }

  if (_currentPageData) return await sendToTutor(userMessage);

  return await sendTextOnly(userMessage);
}

// ── Check if response indicates problem was solved ───────────────────
function checkIfSolved(responseText) {
  const signal = parseStatusSignal(responseText);
  if (signal && signal.status === 'solved') return true;
  if (responseText.includes('"solved": true') || responseText.includes('"solved":true')) return true;
  return false;
}

// ── Clean status signals and solved markers from display text ─────────
function cleanResponseText(text) {
  return text
    .replace(/\{[^}]*"status"\s*:\s*"[^"]*"[^}]*\}/g, '')
    .replace(/\{?\s*"solved"\s*:\s*true\s*\}?/g, '')
    .trim();
}

// ── Parse status signal from response ────────────────────────────────
function parseStatusSignal(response) {
  const match = response.match(/\{"status":\s*"[^"]+?"[^}]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch (e) { return null; }
}

// ── Getters for module state ─────────────────────────────────────────
function getCurrentPageData() { return _currentPageData; }
function getEscalationCount() { return _escalationCount; }
function incrementEscalation() { return ++_escalationCount; }
function resetEscalation() { _escalationCount = 0; }

// ── Fallback response (no API key) ───────────────────────────────────
function getFallbackResponse(userMessage) {
  const msg = (userMessage || '').toLowerCase();
  let hints;
  if (msg.match(/\d/) || msg.includes('add') || msg.includes('subtract') || msg.includes('multiply') || msg.includes('math') || msg.includes('number') || msg.includes('equals')) {
    hints = FALLBACK_HINTS.math;
  } else if (msg.includes('read') || msg.includes('spell') || msg.includes('word') || msg.includes('letter') || msg.includes('sentence')) {
    hints = FALLBACK_HINTS.reading;
  } else {
    hints = FALLBACK_HINTS.general;
  }
  return hints[Math.floor(Math.random() * hints.length)];
}

// ── Convert file to base64 ───────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
