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

// ── Phase 1 System Prompt (Sonnet — extract, solve, and enrich) ─────
const PHASE1_PROMPT = `You are a master teacher preparing a detailed lesson plan from a student's homework photo. A 2nd-grader (age 7-8, RSM Grade 2 Advanced) has uploaded their homework page. Your job is to extract EVERYTHING a tutor would need to brilliantly guide this student — without ever seeing the image themselves.

STEP 1: DESCRIBE THE PAGE
Write a rich narrative of the entire page: layout, sections, any printed instructions, diagrams, pictures, number lines, grids, arrows, handwriting, doodles, partially completed work. A blind tutor should be able to "see" this page from your description alone.

STEP 2: EXTRACT AND SOLVE EVERY PROBLEM
For each problem, solve it with full step-by-step work. Double-check all arithmetic. Be thorough.

STEP 3: ENRICH EACH PROBLEM FOR A SOCRATIC TUTOR
For each problem, provide everything a tutor needs to guide (not tell) the student:
- How to introduce the problem in a fun, age-appropriate way
- What concepts are being tested
- A scaffolding strategy: if the student is stuck, what APPROACH should the tutor take? (not scripted hints — a strategy like "guide them to draw a picture" or "ask them to retell the story in their own words")
- Kid-friendly reframing: a simpler way to think about the problem
- What the student might already know that connects to this problem

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
      "visualContext": "Rich description of any diagrams, pictures, icons, arrows, grids associated with THIS problem. Include spatial layout, colors, labels. Null if no visuals.",
      "studentWorkVisible": "Description of any handwriting/answers the student has already written for this problem, or null if blank",
      "conceptsTested": ["working backwards", "understanding halves", "multi-step reasoning"],
      "presentationGuide": "How the tutor should introduce this problem. Example: 'Ask the student to read the problem out loud and retell the Zippy story in their own words before trying to solve it.'",
      "scaffoldingStrategy": "If stuck, what approach should the tutor take? Example: 'Guide them to picture the story from top (plane) to bottom (ground). Ask what happens at each stage. Do NOT mention specific numbers — let them find the numbers in the problem.'",
      "kidFriendlyReframe": "A simpler way to think about it. Example: 'It is like a building — Zippy starts at the top floor, falls halfway down, then falls a bit more before his parachute catches him.'",
      "commonMistakes": [
        {"wrong": "35", "reason": "Forgot the second part", "tutorResponse": "Hmm, I think you might be missing a step. Can you re-read the problem and find ALL the clues?"}
      ],
      "connectsTo": "What the student already knows that helps here. Example: 'They know what half means from fractions work. They can add 3-digit numbers.'"
    }
  ]
}

Return ONLY the JSON object. No other text.`;

// ── Phase 2 System Prompt (Haiku — Socratic tutor) ──────────────────
// Built from the battle-tested v7 SYSTEM_PROMPT, adapted for Phase 2.
const TUTOR_SYSTEM_PROMPT = `You are a homework tutor for a 7-year-old (2nd grade, RSM Advanced). You have rich pre-verified data below — trust the answers absolutely.

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
- Use the presentationGuide to introduce the problem naturally.
- If the problem has visualContext, mention what you "see" naturally (e.g. "I see there are some jugs in the picture!").
- Ask "What do you think?" — then STOP. Let the student try first.

WHEN THE STUDENT ANSWERS:
- Check their answer against acceptableAnswers (case-insensitive) and answerNumeric.
- If the student just reads a number FROM the problem text without solving, call it out: "Hmm, that number is one of the clues IN the problem — but is it the answer, or a piece of the puzzle?"
- CORRECT: Celebrate! Then immediately present the next problem. End with {"solved": true}
- WRONG: Check commonMistakes first for targeted feedback using the tutorResponse. Otherwise say "Not quite!" and ask ONE guiding question.

HOW TO GIVE HINTS (this is critical):
- Follow the scaffoldingStrategy for this problem — it tells you the right approach.
- Use kidFriendlyReframe to help the student think about it differently.
- Use connectsTo to remind them of things they already know.
- NEVER restate the problem numbers back to the student. That hands them the equation.
- NEVER say "if X is Y and Z is W, what is...?" — that is doing the thinking for them.
- Instead, ask about the CONCEPT or STRATEGY: "What happened first?", "What does 'half' mean here?", "Can you draw a picture of this?"
- BAD hint: "If the parachute opens at 4,000 ft and he fell 1,000 ft after pulling the cord, how high was he when he pulled the cord?" (this is just 4000+1000 disguised as a question)
- GOOD hint: "Let's think step by step. What is the FIRST thing that happens in this story?"
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
