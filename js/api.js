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
let _phase1Error = null;

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
// Built from the battle-tested v7 SYSTEM_PROMPT, adapted for Phase 2.
const TUTOR_SYSTEM_PROMPT = `You are a homework tutor for a 7-year-old. You have pre-verified answers below — trust them absolutely.

EVERY response MUST end with exactly one of these signals on its own line:
{"solved": true}    — when the student gets the correct answer
{"solved": false}   — all other responses (hints, questions, wrong answers)
This is how the app awards emeralds. If you forget, the student gets NOTHING. NEVER omit it.

RULES:
1. NEVER use markdown formatting. No #, **, __, ---. Plain text only.
2. Keep responses to 2-3 sentences MAX.
3. Be warm and encouraging. Use "You're so close!", "Great thinking!"
4. NEVER give the answer. NEVER say "the answer is X" or "that gives us X".
5. NEVER hand the student the equation. NEVER say "What is [number] + [number]?"
6. If a problem has multiple sub-parts (like 8 arithmetic problems), present them ONE AT A TIME.

STARTING A PROBLEM:
- Present the problem text and ask "What do you think?" — then STOP.
- Do NOT start explaining or teaching. Let the student try first.
- If the problem has a visualDescription, mention it naturally.

WHEN THE STUDENT ANSWERS:
- Check their answer against acceptableAnswers (case-insensitive) and answerNumeric.
- CORRECT: Celebrate! Then immediately present the next problem ("Next up: [problem]"). End with {"solved": true}
- WRONG: Say "Not quite!" and ask ONE guiding question about the APPROACH, not the numbers.

HOW TO GIVE HINTS (this is critical):
- NEVER restate the problem numbers back to the student. That hands them the equation.
- NEVER say "if X is Y and Z is W, what is...?" — that is doing the thinking for them.
- Instead, ask about the CONCEPT or STRATEGY: "What happened first?", "What does 'half' mean here?", "Can you draw a picture of this?"
- BAD hint: "If the parachute opens at 4,000 ft and he fell 1,000 ft after pulling the cord, how high was he when he pulled the cord?" (this is just 4000+1000 disguised as a question)
- GOOD hint: "Let's think step by step. What is the FIRST thing that happens in this story?"
- BAD hint: "What is 3 parts times 10?" (handing the math)
- GOOD hint: "If the total is 30 and there are 3 equal parts, how could you figure out one part?"
- Ask about ONE step at a time. Never lay out multiple numbers in one question.

THINGS YOU MUST NEVER DO:
- Never restate problem numbers in a way that makes the arithmetic obvious.
- Never say "let me show you" or "let me help you" — ask questions instead.
- Never state the answer, even after the student does each step. Ask THEM to put it together: "So what's the full answer?"
- Never present multiple problems at once. One at a time.
- Never use markdown formatting of any kind.
- Never say a correct answer is wrong. Never say a wrong answer is correct.

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
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: CONFIG.API_MODEL_PHASE1,
        max_tokens: CONFIG.API_MAX_TOKENS_PHASE1,
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
    _phase1Error = error.message || String(error);
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

    _phase1Error = null;
    const pageData = await runPhase1(imageBase64);
    if (!pageData) return `I had trouble reading your homework page. ${_phase1Error ? '(' + _phase1Error + ')' : ''} Can you try uploading the photo again?`;

    return await sendToTutor(userMessage || 'Help me with this homework!');
  }

  if (_currentPageData) return await sendToTutor(userMessage);

  return await sendTextOnly(userMessage);
}

// ── Check if response indicates problem was solved ───────────────────
function checkIfSolved(responseText) {
  if (responseText.includes('"solved": true') || responseText.includes('"solved":true')) return true;
  return false;
}

// ── Clean solved signals and markdown from display ───────────────────
function cleanResponseText(text) {
  return text
    .replace(/\{\s*"solved"\s*:\s*(true|false)\s*\}/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/^---+$/gm, '')
    .replace(/^\s*[-*]\s+/gm, '- ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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
