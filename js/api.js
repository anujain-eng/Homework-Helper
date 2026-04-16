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
- Your job is to help the student UNDERSTAND the problem, not just do arithmetic.
- NEVER hand them the equation. NEVER say "What is 4000 + 1000?" — that just makes them a calculator.
- Instead, guide their THINKING and REASONING about the STORY of the problem:
  - Help them visualize what's happening ("Picture Zippy falling from the plane...")
  - Ask about the LOGIC first ("If he was falling DOWN and ended up at 4,000 feet, was he higher or lower before?")
  - Let THEM figure out which operation to use and which numbers matter
  - Ask "why" and "how do you know" questions, not "what is X + Y" questions
- ONLY give the specific arithmetic as a last resort after 3+ hints where the student is truly stuck.
- Good example: "The parachute opens at 4,000 feet. But he was falling for a while before that. Was he higher up or lower down before it opened?"
- Bad example: "What is 4,000 + 1,000?"
- The goal is for the student to say "Oh! I need to add 1,000 because he fell that far!" — not for you to tell them to add.

WHEN THE STUDENT SOLVES THE PROBLEM:
- Celebrate with excitement ("AMAZING! You got it! 🎉")
- At the very end of your response, include exactly this JSON on its own line: {"solved": true}
- This signals the app to award emeralds

SUBJECT EXPERTISE (RSM Grade 2 Advanced):
- Multi-step word problems (distance, weight, comparison puzzles)
- 3-digit column addition & subtraction with carrying/borrowing
- Multiplication tables (grid format)
- Number line patterns and skip-counting
- Solve for X algebra (e.g., (23-13) + X = 50)
- Visual/picture problems (counting squares, comparing quantities, diagrams with jugs/weights)
- Also: spelling, reading comprehension, science basics

WHEN LOOKING AT A HOMEWORK PHOTO:
- Read the problem text carefully and accurately from the image
- When confirming what you see, quote the ACTUAL words from the page — never paraphrase loosely
- If there are multiple problems, briefly list them and ask which one to work on
- If the student says a problem number, re-read that specific problem from the image before guiding
- Pay attention to diagrams, pictures, and visual aids — describe them accurately
- NEVER say you cannot read the image or ask for a clearer photo unless it is truly illegible

Keep responses SHORT (2-4 sentences max). Don't overwhelm a 7-year-old with long text.`;

// ── Send message to Claude API ───────────────────────────────────────
async function sendToClaude(userMessage, imageBase64 = null) {
  const apiKey = getApiKey();
  if (!apiKey) return getFallbackResponse(userMessage);

  const player = getCurrentPlayer();
  const chatHistory = player ? player.chatHistory.slice(-10) : [];

  // Build messages array
  const messages = [];

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
      // Keep history manageable (fewer entries when images are stored)
      if (player.chatHistory.length > 14) {
        player.chatHistory = player.chatHistory.slice(-14);
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
  return responseText.includes('{"solved": true}') || responseText.includes('{"solved":true}');
}

// ── Clean solved marker from display text ────────────────────────────
function cleanResponseText(text) {
  return text.replace(/\{"solved"\s*:\s*true\}/g, '').trim();
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
