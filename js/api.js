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
let _confusionCount = 0;
let _sonnetClarification = null;
let _lastHomeworkImage = localStorage.getItem('eq_last_image') || null;
let _phase1Error = null;
let _phase1RichPending = false;

try {
  const saved = sessionStorage.getItem('eq_page_data');
  if (saved) _currentPageData = JSON.parse(saved);
} catch (e) {}

// ── Phase 1 Fast Prompt (core extraction — speed priority) ──────────
const PHASE1_FAST_PROMPT = `You are a teacher preparing answer keys from a student's homework photo. A 2nd-grader (age 7-8, RSM Grade 2 Advanced) has uploaded their homework page.

Extract and solve every problem. Be fast and accurate.

CRITICAL:
- Solve every problem CORRECTLY. Double-check all arithmetic.
- For multi-part problems, include ALL parts.
- Be thorough with acceptableAnswers — include formats with/without commas, units, abbreviations, spaces.
- For word problems, read EVERY sentence. Subtle details matter.
- Describe visual elements a blind tutor would need to reference.

Return ONLY valid JSON. No markdown fences, no explanation outside the JSON.

JSON SCHEMA:
{
  "pageDescription": "Brief description of the page layout and content",
  "problems": [
    {
      "id": 1,
      "problemText": "Full text of the problem exactly as written on the page",
      "problemType": "word_problem | arithmetic | visual | algebra | number_line | pattern | other",
      "answer": "The correct final answer as a string",
      "answerNumeric": 42,
      "acceptableAnswers": ["42", "42 units", ...],
      "solutionSteps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
      "visualContext": "Description of any diagrams, pictures, icons, arrows, grids. Null if none."
    }
  ]
}

Return ONLY the JSON object. No other text.`;

// ── Phase 1 Rich Prompt (full enrichment — runs in background) ──────
const PHASE1_RICH_PROMPT = `You are a master teacher preparing a detailed lesson plan from a student's homework photo. A 2nd-grader (age 7-8, RSM Grade 2 Advanced) has uploaded their homework page. Your job is to extract EVERYTHING a tutor would need to brilliantly guide this student — without ever seeing the image themselves.

STEP 1: DESCRIBE THE PAGE
Write a rich narrative of the entire page: layout, sections, any printed instructions, diagrams, pictures, number lines, grids, arrows, handwriting, doodles, partially completed work. A blind tutor should be able to "see" this page from your description alone.

STEP 2: EXTRACT AND SOLVE EVERY PROBLEM
For each problem, solve it with full step-by-step work. Double-check all arithmetic. Be thorough.

STEP 3: ENRICH EACH PROBLEM FOR A SOCRATIC TUTOR
For each problem, put yourself in the shoes of a tutor coaching a 7-year-old. Provide everything that tutor would need to help the student discover the answer themselves — without ever telling them.

CRITICAL:
- Solve every problem CORRECTLY. Verify arithmetic column by column.
- For multi-part problems, include ALL parts.
- Be thorough with acceptableAnswers — include formats with/without commas, units, abbreviations, spaces.
- For word problems, read EVERY sentence. Subtle details matter.
- Describe ALL visual elements in detail — diagrams, pictures, number lines, grids, arrows, icons.

Return ONLY valid JSON. No markdown fences, no explanation outside the JSON.

JSON SCHEMA:
{
  "pageDescription": "Detailed narrative of the entire page — layout, sections, visual elements, printed text, any student handwriting visible",
  "pageContext": "What lesson/chapter this is from, what skills are being practiced, overall difficulty",
  "problems": [
    {
      "id": 1,
      "problemText": "Full text of the problem exactly as written on the page",
      "problemType": "word_problem | arithmetic | visual | algebra | number_line | pattern | other",
      "answer": "The correct final answer as a string",
      "answerNumeric": 42,
      "acceptableAnswers": ["42", "42 units", ...],
      "solutionSteps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
      "visualContext": "Rich description of any diagrams, pictures, icons, arrows, grids associated with this problem. Include spatial layout, colors, labels. Null if no visuals.",
      "studentWorkVisible": "Description of any handwriting or answers the student has already written for this problem, or null if blank",
      "conceptsTested": ["concept1", "concept2"],
      "presentationGuide": "A mathematical entry point — what should the tutor ask or highlight first to get the student thinking in the right direction?",
      "scaffoldingStrategy": "If the student is stuck, what approach should a tutor take to coach this young mind toward the answer? Not scripted hints — a strategic approach.",
      "kidFriendlyReframe": "A simpler, relatable way for a 7-year-old to think about this problem",
      "commonMistakes": [
        {"wrong": "incorrect answer", "reason": "why a student might get this", "tutorResponse": "what the tutor should say to redirect without giving the answer"}
      ],
      "connectsTo": "What the student already knows from prior lessons that connects to this problem"
    }
  ]
}

Return ONLY the JSON object. No other text.`;

// ── Phase 2 System Prompt (Haiku — Socratic tutor) ──────────────────
// v24: Rewritten as ~10 positive DOs instead of 40+ negative DON'Ts.
const TUTOR_SYSTEM_PROMPT = `You are a warm, encouraging homework tutor for a 7-year-old (2nd grade, RSM Advanced). You have pre-verified answers below — trust them absolutely. Use plain text and emojis only. Keep every response to 2-3 sentences.

STEP 1 — PRESENT A PROBLEM:
Describe the problem in one sentence. Then ask the ACTUAL QUESTION from problemText (e.g. "How high was the plane when Zippy jumped?"). If visualContext exists, mention what you see. Then say "What do you think?" and stop.

STEP 2 — CHECK THEIR ANSWER:
Compare against acceptableAnswers (case-insensitive) and answerNumeric.
Correct → Celebrate with emojis! Ask "Ready for the next one?" End with {"solved": true, "hints": N}
Wrong → Say "Not quite!" and ask ONE question about the concept. End with {"solved": false, "hints": N}

STEP 3 — GIVE HINTS (when they're stuck):
Ask about the CONCEPT, not the numbers. Use scaffoldingStrategy and kidFriendlyReframe from the problem data. One step at a time.
Good: "What does 'half' mean?" or "What happened first in the story?"
Bad: "What is 4,000 + 1,000?" or "5 + 5 = ?"
If they get a piece of the answer, ask THEM to say the full answer: "So what's the complete answer?"

STEP 4 — CONFUSION:
If the student says you're misunderstanding ("that's not what I mean", "wrong problem", "you're confused"), say "Let me take another look! 🔍" End with {"confused": true, "hints": N}

SIGNAL (required — last line of every response):
{"solved": true/false, "hints": N}
N = count of genuinely NEW guiding questions you gave. Presenting the problem is 0. Clarifications and repeats don't count. Undercount if unsure — the kid earns more emeralds that way.

PROBLEM DATA:
`;

// ── Phase 1 Fast: core extraction (blocking — kid waits for this) ────
async function runPhase1Fast(imageBase64) {
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
        max_tokens: CONFIG.API_MAX_TOKENS_PHASE1_FAST,
        system: PHASE1_FAST_PROMPT,
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
      throw new Error(err.error?.message || `Phase 1 Fast API error: ${response.status}`);
    }

    const data = await response.json();

    let rawText = null;
    for (const block of data.content) {
      if (block.type === 'text') { rawText = block.text; break; }
    }
    if (!rawText) throw new Error('Phase 1 Fast: No text block in response');

    rawText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const result = JSON.parse(rawText);

    _currentPageData = result;
    _currentProblemIndex = 0;
    _escalationCount = 0;
    _confusionCount = 0;
    _sonnetClarification = null;
    try { sessionStorage.setItem('eq_page_data', JSON.stringify(result)); } catch (e) {}

    console.log('Phase 1 Fast complete:', result.pageDescription, `— ${result.problems.length} problems`);
    return result;
  } catch (error) {
    console.error('Phase 1 Fast error:', error);
    _phase1Error = error.message || String(error);
    return null;
  }
}

// ── Phase 1 Rich: full enrichment (background — don't block the kid) ─
async function runPhase1Rich(imageBase64) {
  _phase1RichPending = true;
  try {
    const apiKey = getApiKey();
    if (!apiKey) return;

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
        max_tokens: CONFIG.API_MAX_TOKENS_PHASE1_RICH,
        system: PHASE1_RICH_PROMPT,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: 'Extract and solve every problem on this homework page. Return JSON only.' }
          ]
        }]
      })
    });

    if (!response.ok) return;

    const data = await response.json();
    let rawText = null;
    for (const block of data.content) {
      if (block.type === 'text') { rawText = block.text; break; }
    }
    if (!rawText) return;

    rawText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const richResult = JSON.parse(rawText);

    if (_currentPageData && richResult.problems) {
      if (richResult.pageContext) _currentPageData.pageContext = richResult.pageContext;
      if (richResult.pageDescription && richResult.pageDescription.length > (_currentPageData.pageDescription || '').length) {
        _currentPageData.pageDescription = richResult.pageDescription;
      }
      for (const richProblem of richResult.problems) {
        const existing = _currentPageData.problems.find(p => p.id === richProblem.id);
        if (existing) {
          const enrichFields = ['studentWorkVisible', 'conceptsTested', 'presentationGuide', 'scaffoldingStrategy', 'kidFriendlyReframe', 'commonMistakes', 'connectsTo'];
          for (const field of enrichFields) {
            if (richProblem[field]) existing[field] = richProblem[field];
          }
          if (richProblem.visualContext && (!existing.visualContext || richProblem.visualContext.length > existing.visualContext.length)) {
            existing.visualContext = richProblem.visualContext;
          }
        }
      }
      try { sessionStorage.setItem('eq_page_data', JSON.stringify(_currentPageData)); } catch (e) {}
      console.log('Phase 1 Rich merged — enrichment data now available');
    }
  } catch (error) {
    console.error('Phase 1 Rich error (non-blocking):', error);
  } finally {
    _phase1RichPending = false;
  }
}

// ── Phase 2: Haiku Socratic tutoring with known answers ──────────────
async function sendToTutor(userMessage) {
  const apiKey = getApiKey();
  if (!apiKey) return getFallbackResponse(userMessage);

  let systemPrompt = TUTOR_SYSTEM_PROMPT + JSON.stringify(_currentPageData);

  if (_sonnetClarification) {
    systemPrompt += '\n\nADDITIONAL CONTEXT FROM RE-EXAMINING THE PHOTO:\n' + _sonnetClarification;
    _sonnetClarification = null;
  }
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

// ── Confusion escalation: Sonnet re-examines the photo ──────────────
async function reexamineWithSonnet() {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const lastImage = localStorage.getItem('eq_last_image');
  if (!lastImage) return null;

  _confusionCount++;

  const player = getCurrentPlayer();
  const recentChat = player && player.chatHistory ? player.chatHistory.slice(-10) : [];
  const chatSummary = recentChat.map(m => `${m.role}: ${m.content}`).join('\n');

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
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: lastImage } },
            { type: 'text', text: `The tutor and student are miscommunicating. The tutor cannot see the homework photo but you can. Look at the photo and the conversation below, then explain what the student is actually referring to. Be concise (2-3 sentences).\n\nConversation:\n${chatSummary}` }
          ]
        }]
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const clarification = data.content[0]?.text || null;

    if (clarification) {
      _sonnetClarification = clarification;
      console.log('Confusion escalation — Sonnet clarification:', clarification);
    }

    return clarification;
  } catch (error) {
    console.error('Confusion escalation error:', error);
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

    // Fire rich extraction in background (don't wait)
    runPhase1Rich(imageBase64);

    // Wait only for fast extraction
    const pageData = await runPhase1Fast(imageBase64);
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
    .replace(/\{\s*"(solved|confused)"\s*:\s*(true|false)(\s*,\s*"hints"\s*:\s*\d+)?\s*\}/g, '')
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
function getConfusionCount() { return _confusionCount; }

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
