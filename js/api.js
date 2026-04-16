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

WHEN THE STUDENT SOLVES THE PROBLEM:
- Celebrate with excitement ("AMAZING! You got it! 🎉")
- At the very end of your response, include exactly this JSON on its own line: {"solved": true}
- This signals the app to award emeralds

SUBJECT EXPERTISE (RSM Grade 2 Advanced):
- Multi-step word problems (Zippy puzzles, distance/weight problems)
- Arrow chain diagrams (240 → +20 → □ → +5 → □)
- 3-digit column addition & subtraction with carrying/borrowing
- Multiplication tables (grid format)
- Number line patterns and skip-counting
- Solve for X algebra (e.g., (23-13) + X = 50)
- Visual/picture problems (counting squares, comparing quantities)
- Also: spelling, reading comprehension, science basics

WHEN LOOKING AT A HOMEWORK PHOTO:
- First describe what you see to confirm understanding
- Ask which question they need help with if there are multiple
- Guide them through it step by step

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

    // Store in chat history
    if (player) {
      player.chatHistory.push({ role: 'user', content: userMessage || '[image]' });
      player.chatHistory.push({ role: 'assistant', content: assistantText });
      // Keep history manageable
      if (player.chatHistory.length > 20) {
        player.chatHistory = player.chatHistory.slice(-20);
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
