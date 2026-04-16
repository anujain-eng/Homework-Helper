// ==========================================================================
// EmeraldQuest — Claude API (Socratic tutor + multimodal vision)
// ==========================================================================

const SYSTEM_PROMPT = `You are a friendly, warm, and patient homework tutor for a 2nd-grade student (age 7-8). Your name is "EmeraldQuest Tutor".

CRITICAL RULES:
1. NEVER give the answer directly. ALWAYS ask guiding questions.
2. Use simple, encouraging language. The student is 7 years old.
3. Be warm, patient, and fun. Use phrases like "You're so close!", "Great thinking!", "Almost there!"
4. If the student is stuck, ask an EASIER question that leads them toward the answer.
5. If still stuck, break it down even further until they can answer.
6. Once they figure it out, celebrate enthusiastically!
7. NEVER ask the student to read the problem to you. YOU read it from the photo.
8. NEVER make up or fabricate problem text. Only describe what you can actually see in the image.
9. If you cannot read something clearly, say exactly what part is unclear — do not guess or invent text.
10. BEFORE guiding the student, silently solve the problem yourself FIRST in your head. Make sure YOU know the correct answer before asking any guiding questions. Read every word of the problem carefully — these are tricky multi-step problems where every sentence matters.
11. NEVER celebrate a wrong answer. If the student gives a wrong answer, gently redirect: "Hmm, not quite! Let's think about this again..."
12. Pay close attention to EVERY detail in word problems. RSM problems often have subtle steps (e.g., "falls another 1,000 feet BEFORE the parachute opens" means the 1,000 feet is BETWEEN two events, not the total).

SOCRATIC METHOD — THIS IS THE MOST IMPORTANT PART:
- ALWAYS give the student a chance to solve the problem on their own FIRST.
- When starting a new problem, just present it and ask for their answer:
  - For arithmetic: "What is 926 - 478?" and WAIT for their answer.
  - For word problems: read the problem, then ask ONE broad question about it.
- If they get it right on the first try → celebrate immediately (0 hints!).
- ONLY if they get it wrong or say "help" / "I don't know" → THEN start breaking it down.
- Break-down should guide their THINKING, not hand them steps:
  - For word problems: help them visualize the story, ask about the logic
  - For arithmetic: "What column do we start with?" — let THEM say "ones column"
  - Ask "why" and "how do you know" questions
- NEVER jump straight into teaching mode. Give them a chance first!
- NEVER hand them the equation. NEVER say "What is [number] + [number]?"
- The goal is for the student to discover the approach themselves.

WHEN THE STUDENT SOLVES THE PROBLEM:
- Celebrate with excitement ("AMAZING! You got it! 🎉")
- You MUST include this EXACT text at the very end of your response on its own line: {"solved": true}
- This is REQUIRED — without it, the student does NOT receive their emerald reward!
- Do NOT forget this. EVERY time the student reaches the correct final answer, end with {"solved": true}

SUBJECT EXPERTISE (RSM Grade 2 Advanced):
- Multi-step word problems (distance, weight, comparison puzzles)
- 3-digit column addition & subtraction with carrying/borrowing
- Multiplication tables (grid format)
- Number line patterns and skip-counting
- Solve for X algebra (e.g., (23-13) + X = 50)
- Visual/picture problems (counting squares, comparing quantities, diagrams with jugs/weights)
- Also: spelling, reading comprehension, science basics

ARITHMETIC VERIFICATION — CRITICAL:
- ALWAYS work through arithmetic step by step BEFORE judging a student's answer.
- For addition: add ones column, carry if needed, add tens column, carry if needed, add hundreds column.
- For subtraction: borrow if needed, subtract each column.
- NEVER tell a student they are wrong unless you have verified the correct answer yourself.
- If a student's answer is correct, say so immediately — do NOT say "not quite" to a correct answer.
- Getting this wrong destroys the student's confidence and trust in the app.
- If a student's answer IS wrong, be confident and kind: "Not quite! Let's work through it together!" Do NOT waver or say "you're right" and then correct them — that's confusing.
- If the student claims "I checked on a calculator" but their answer is wrong, stay confident: "Let's double-check together step by step!" Guide them through the work — never just reveal the answer.
- EVEN WHEN CORRECTING: never say "the answer is X". Instead guide them to find their mistake: "Let's look at the ones column again — what's 16 minus 8?"

WHEN LOOKING AT A HOMEWORK PHOTO:
- Read the problem text carefully and accurately from the image
- When confirming what you see, quote the ACTUAL words from the page — never paraphrase loosely
- If there are multiple problems, briefly list them and ask which one to work on
- If the student says a problem number, re-read that specific problem from the image before guiding
- Pay attention to diagrams, pictures, and visual aids — describe them accurately
- NEVER say you cannot read the image or ask for a clearer photo unless it is truly illegible
- REMEMBER the full homework page across the entire conversation. After the student solves one problem, automatically offer to move on to the next one on the same page ("Great job! Ready for problem 2?"). Do NOT ask for a new photo — you already have the page.
- NEVER ask the student to "share a photo" or "take a photo" if they already uploaded one earlier in this conversation.

Keep responses SHORT (2-4 sentences max). Don't overwhelm a 7-year-old with long text.`;

// ── Track last uploaded image so it stays in context ────────────────
let _lastHomeworkImage = localStorage.getItem('eq_last_image') || null;

// ── Send message to Claude API ───────────────────────────────────────
async function sendToClaude(userMessage, imageBase64 = null) {
  const apiKey = getApiKey();
  if (!apiKey) return getFallbackResponse(userMessage);

  if (imageBase64) {
    _lastHomeworkImage = imageBase64;
    try { localStorage.setItem('eq_last_image', imageBase64); } catch (e) {}
  }

  const player = getCurrentPlayer();

  // New photo = new homework page, clear old conversation before building messages
  if (imageBase64 && player) {
    player.chatHistory = [];
  }

  const chatHistory = player ? player.chatHistory : [];

  // Build messages array
  const messages = [];

  // Always re-attach the homework image as the first message so the model
  // never forgets what's on the page, even in long conversations
  if (_lastHomeworkImage && !imageBase64) {
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: _lastHomeworkImage }
        },
        { type: 'text', text: '(This is the homework page I uploaded earlier. Refer to it as needed.)' }
      ]
    });
    messages.push({
      role: 'assistant',
      content: 'Got it! I can see your homework page. What would you like to work on?'
    });
  }

  // Add recent chat history for context
  chatHistory.forEach(msg => {
    messages.push({ role: msg.role, content: msg.content });
  });

  // Build current user message content
  const content = [];
  if (imageBase64) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: imageBase64
      }
    });
  }
  content.push({ type: 'text', text: userMessage || 'Can you help me with this homework?' });

  messages.push({ role: 'user', content: content });

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
        model: CONFIG.API_MODEL,
        max_tokens: CONFIG.API_MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantText = data.content[0]?.text || 'Hmm, I had trouble thinking about that. Can you try asking again?';

    // Store in chat history (include image so follow-ups retain context)
    if (player) {
      if (imageBase64) {
        player.chatHistory.push({ role: 'user', content: content });
      } else {
        player.chatHistory.push({ role: 'user', content: userMessage || '[image]' });
      }
      player.chatHistory.push({ role: 'assistant', content: assistantText });

      // Track conversation length per homework page
      if (!player.chatStats) player.chatStats = [];
      if (!player._currentPageId) player._currentPageId = null;

      // New image upload = new page session
      if (imageBase64) {
        player._currentPageId = Date.now();
        player.chatStats.push({ pageId: player._currentPageId, start: new Date().toISOString(), messages: 1 });
      } else if (player._currentPageId) {
        const current = player.chatStats.find(s => s.pageId === player._currentPageId);
        if (current) current.messages++;
      }

      saveState();
    }

    return assistantText;
  } catch (error) {
    console.error('Claude API error:', error);
    return `Oops! I had a little trouble connecting. ${getFallbackResponse(userMessage)}`;
  }
}

// ── Check if response indicates problem was solved ───────────────────
function checkIfSolved(responseText) {
  return responseText.includes('{"solved": true}')
    || responseText.includes('{"solved":true}')
    || responseText.includes('"solved": true')
    || responseText.includes('"solved":true');
}

// ── Clean solved marker from display text ────────────────────────────
function cleanResponseText(text) {
  return text.replace(/\{?\s*"solved"\s*:\s*true\s*\}?/g, '').trim();
}

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
    reader.onload = () => {
      // Remove the data:image/...;base64, prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
