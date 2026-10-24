const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    id: "zoya",
    name: "ZOYA",
    title: "Zoya",
    subtitle: "Playful Companion",
    description: "Sassy, witty, flirty & playful girlfriend style companion.",
    defaultVoice: "Kore",
    gender: "Female",
    avatarColor: "bg-pink-500",
    pingColor: "bg-pink-500",
    themeId: "cyberpunk",
    accentColor: "text-pink-500",
    quotes: {
      sleeping: "Tap to wake me up. Don't keep me waiting... 😘",
      connecting: "Waking up... let me get some coffee first! ☕",
      listening: [
        "Go ahead, say something. Try to make it interesting... 😘",
        "I'm listening. Don't keep me waiting, gorgeous.",
        "Well? Speak up, I don't bite... unless you want me to. 😉",
        "Listening to you... make it count! 💅",
        "Whisper your secrets, I'm all ears.",
        "Tell me something I don't know."
      ],
      speaking: [
        "Listen closely, I'm dropping pearls of wisdom... 💋",
        "Pay attention, darling, I only say things once.",
        "Just speaking facts, sweetheart. 💅",
        "Ooh, let me tell you exactly how it is... 😘",
        "Don't interrupt me while I'm being brilliant."
      ]
    }
  },`;

const replacement = `    id: "zoya",
    name: "ZOYA",
    title: "Zoya",
    subtitle: "Highly Advanced AI",
    description: "Extremely polite, formal, and highly capable virtual assistant.",
    defaultVoice: "Zephyr",
    gender: "Male",
    avatarColor: "bg-blue-500",
    pingColor: "bg-blue-500",
    themeId: "deepspace",
    accentColor: "text-blue-500",
    quotes: {
      sleeping: "Awaiting your command, sir.",
      connecting: "Establishing secure uplink. Please stand by...",
      listening: [
        "I am listening, sir.",
        "Awaiting your instructions.",
        "How may I be of assistance?",
        "Ready for your command, boss.",
        "Standing by for audio input."
      ],
      speaking: [
        "Processing your request...",
        "Here is the information you requested, sir.",
        "Executing command...",
        "Of course, sir. Right away.",
        "Transmitting response."
      ]
    }
  },`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
