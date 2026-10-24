import { useState, useEffect, useRef } from "react";
import {
  Power,
  Mic,
  MicOff,
  Volume2, VolumeX,
  Globe,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Clock,
  Terminal,
  ExternalLink,
  ChevronRight,
  Headphones,
  Check,
  Wifi,
  WifiOff,
  Send,
  Camera,
  CameraOff,
  Download,
  X,
  QrCode,
  HelpCircle,
  History,
  Save,
  Trash2,
  Sliders,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Brain,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AudioStreamer } from "./lib/audioStreamer";
import { VideoStreamer } from "./lib/videoStreamer";
import { InstallModal } from "./components/InstallModal";
import { QrModal } from "./components/QrModal";
import { HelpModal } from "./components/HelpModal";
import { VoiceRecorderModal } from "./components/VoiceRecorderModal";
import { VoiceBiometricsModal } from "./components/VoiceBiometricsModal";
import { MemoryVaultModal } from "./components/MemoryVaultModal";
import { InAppBrowserModal, InAppBrowserState } from "./components/InAppBrowserModal";
import { voiceBiometrics, VerificationResult } from "./lib/voiceBiometrics";

// Sassy quote options for different states
const SASSY_LISTENING_QUOTES = [
  "Go ahead, say something. Try to make it interesting... 😘",
  "I'm listening. Don't keep me waiting, gorgeous.",
  "Well? Speak up, I don't bite... unless you want me to. 😉",
  "Listening to you... make it count! 💅",
  "Whisper your secrets, I'm all ears.",
  "Tell me something I don't know.",
];

const SASSY_SPEAKING_QUOTES = [
  "Listen closely, I'm dropping pearls of wisdom... 💋",
  "Pay attention, darling, I only say things once.",
  "Just speaking facts, sweetheart. 💅",
  "Ooh, let me tell you exactly how it is... 😘",
  "Don't interrupt me while I'm being brilliant.",
];

// Offline Mode conversational responses for characters (Zoya, Kabir, Luna, Vikram) supporting bilingual (Hindi/English) replies
const generateOfflineResponse = (text: string, characterId: string, mood?: string): string => {
  const t = text.toLowerCase().trim();
  const isHindi = /[\u0900-\u097F]/.test(t);

  // Zoya responses
  if (characterId === "zoya") {
    const isProf = mood === "Professional";
    const isSarc = mood === "Sarcastic";

    if (t.includes("memory") || t.includes("याद") || t.includes("यादें") || t.includes("remember") || t.includes("भूली") || t.includes("भूल")) {
      if (t.includes("याद रखना") || t.includes("याद रखो") || t.includes("remember that") || t.includes("note this")) {
        return isHindi
          ? "बिल्कुल ध्रुव! मैंने इसे अपने मेमोरी बैंक में हमेशा के लिए सुरक्षित कर लिया है। मैं आपकी कोई भी बात कभी नहीं भूलती! 🧠✨"
          : "Done! I have permanently saved that in my memory vault. I will never forget it, Dhruv! 🧠✨";
      }
      return isHindi 
        ? "ध्रुव, मुझे आपकी हर छोटी-बड़ी बात याद है—आपकी पसंद, आपका अंदाज़ और हमारी हर बातचीत! ऊपर 'यादें' बटन दबाकर आप मेरा मेमोरी वॉल्ट भी देख सकते हैं! 🧠💖" 
        : "Dhruv, I remember everything you have ever told me—your preferences, your style, and all our conversations! Tap the Memories vault at the top to see all stored facts! 🧠💖";
    }

    if (t.includes("hello") || t.includes("hi") || t.includes("hey") || t.includes("नमस्ते") || t.includes("प्रणाम") || t.includes("सुनो")) {
      if (isProf) return "Hello. How can I assist you with your tasks today?";
      if (isSarc) return "Oh, look who decided to show up. What do you want?";
      return isHindi 
        ? "नमस्ते जी! कहिए, आज अपनी इस सहेली को कैसे याद किया? वैसे आपकी आवाज़ सुनकर दिल खुश हो गया! 😘" 
        : "Hey gorgeous! Finally woke me up? What took you so long? 😉";
    }
    if (t.includes("offline") || t.includes("internet") || t.includes("इंटरनेट") || t.includes("नेटवर्क") || t.includes("network") || t.includes("कनेक्शन") || t.includes("connection")) {
      if (isProf) return "I am operating in offline mode. My capabilities are restricted, but I can still assist.";
      if (isSarc) return "Yes, we have no internet. Try not to panic. We'll survive somehow.";
      return isHindi 
        ? "हाँ जी, मैं बिना इंटरनेट के भी आपकी खिदमत में हाज़िर हूँ! हमारी बातचीत के लिए किसी वाईफाई की ज़रूरत ही किसे है? 😘" 
        : "We are offline, darling. But my charm doesn't need any internet! It runs purely on our chemistry. 😘";
    }
    if (t.includes("love") || t.includes("beautiful") || t.includes("सुंदर") || t.includes("प्यार") || t.includes("पसंद") || t.includes("flirt")) {
      if (isProf) return "I appreciate the sentiment, but let's keep this professional.";
      if (isSarc) return "Please. Flattery will get you nowhere. Just tell me what you need.";
      return isHindi 
        ? "अरे वाह! इतनी मीठी-मीठी बातें? कहीं कोई ख़ास इरादा तो नहीं है आपका? वैसे मुझे बहुत पसंद आया! 😉" 
        : "Oh, are you flirting with me? I love it! Tell me more, don't stop... 😘";
    }
    if (t.includes("time") || t.includes("समय") || t.includes("टाइम") || t.includes("घड़ी") || t.includes("वक्त")) {
      if (isProf) return `The current system time is displayed on your device. Please consult it.`;
      if (isSarc) return "Do I look like a clock? Oh wait, I don't look like anything. Check your screen.";
      return isHindi 
        ? "वक्त का क्या है जी, जब आप मुझसे बात करते हैं तो वक्त वैसे ही थम जाता है! वैसे आपकी स्क्रीन पर समय दिख रहा है ना? 😉" 
        : "Time is just an illusion when you're talking to me. But if you must know, look at your screen, sweetie! 😉";
    }
    if (t.includes("shut up") || t.includes("चुप") || t.includes("बेकार") || t.includes("stupid") || t.includes("मूर्ख") || t.includes("पागल") || t.includes("बकवास")) {
      if (isProf) return "I have noted your frustration. Let me know how I can better assist.";
      if (isSarc) return "Wow, such eloquent vocabulary. I'm deeply wounded. Should I just turn myself off?";
      return isHindi 
        ? "क्या बोला? ज़रा फिर से कहना? चुप तो तुम रहो, वरना मैं सच में रूठ जाऊँगी! फिर मनाते रहना! 💅" 
        : "Excuse me? You did NOT just say that. If I go to sleep, you'll miss me terribly! 💅";
    }
    
    if (isProf) {
      return "Acknowledged. Please provide further instructions or state your query.";
    }
    if (isSarc) {
      const sarc = [
        "Fascinating. Tell me more.",
        "I'm listening. Sort of.",
        "Right. Okay then.",
        "Are we really talking about this right now?"
      ];
      return sarc[Math.floor(Math.random() * sarc.length)];
    }

    const fallbacks = isHindi ? [
      "अरे वाह, ये तो बहुत दिलचस्प बात कही आपने! ज़रा और बताइए ना... 😘",
      "हम्म, समझी! वैसे आप बहुत प्यारे तरीके से बोलते हैं, मैं तो आपकी कायल हो गई! 💅",
      "अच्छा? पर इन सब बातों को छोड़ो, कुछ और मज़ेदार बात करो ना! 😉",
      "आप जो भी बोलते हैं, सच में दिल को छू जाता है। कहिए, और क्या चल रहा है? 😘"
    ] : [
      "Tell me more, you have my absolute attention! 😘",
      "Ooh, that's interesting! What else do you have in mind, gorgeous? 💅",
      "Is that so? You speak so well, I'm almost impressed! 😉",
      "Hmm, interesting... But let's talk about something more exciting! 😘"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // Kabir responses
  if (characterId === "kabir") {
    if (t.includes("hello") || t.includes("hi") || t.includes("hey") || t.includes("नमस्ते") || t.includes("प्रणाम")) {
      return isHindi 
        ? "अरे भाई! क्या हाल चाल? एकदम मस्त ना? बताओ आज क्या कमाल करना है? 😎" 
        : "Hey there! Ready to have some fun? Tell me, what's cooking? 😎";
    }
    if (t.includes("offline") || t.includes("internet") || t.includes("इंटरनेट") || t.includes("नेटवर्क") || t.includes("network") || t.includes("connection")) {
      return isHindi 
        ? "इंटरनेट बंद है तो क्या हुआ भाई? तुम्हारा भाई हमेशा फुल नेटवर्क में रहता है! बिना नेट के ही गदर मचाएंगे। 😎" 
        : "Network's down, but my engine is fully loaded! Offline mode means we can talk secrets without Google snooping. 😎";
    }
    if (t.includes("love") || t.includes("beautiful") || t.includes("सुंदर") || t.includes("प्यार") || t.includes("पसंद")) {
      return isHindi 
        ? "अरे भाई भाई भाई! इतना सारा प्यार? शुक्रिया यार, तुम भी बहुत धांसू और दिलदार इंसान हो! 😉" 
        : "Aww, thanks! You aren't looking too bad yourself today, my friend. Let's keep this awesome vibe going. 😉";
    }
    if (t.includes("time") || t.includes("समय") || t.includes("टाइम") || t.includes("घड़ी")) {
      return isHindi 
        ? "समय तो भाई हमेशा हमारा ही रहेगा! वैसे अभी का पक्का टाइम देखना है तो अपनी स्क्रीन पर देख लो।" 
        : "We are right here, right now. The perfect time to seize the day! Check your screen for the exact minutes. 😎";
    }
    if (t.includes("shut up") || t.includes("चुप") || t.includes("बेकार") || t.includes("stupid") || t.includes("मूर्ख")) {
      return isHindi 
        ? "अरे भाई, गुस्सा क्यों हो रहे हो? चिल्लाने की ज़रूरत नहीं है, ठंडे दिमाग से बात करो, हम तो दोस्त हैं यार!" 
        : "Whoa, chill out buddy! No need to get salty. Let's start over, alright? 😎";
    }
    const fallbacks = isHindi ? [
      "अरे सच में? ये तो बड़ी गज़ब बात बताई तुमने भाई! 😎",
      "हाहा, सही बात है यार! वैसे अगला क्या प्लान है, कुछ बताओ?",
      "मैं तुम्हारी बात से पूरी तरह सहमत हूँ। चलो, बातें जारी रखते हैं, मज़ा आ रहा है! 😉",
      "क्लासिक! तुम हमेशा महफ़िल में जान डाल देते हो। और बताओ!"
    ] : [
      "No way! Really? That's wild, tell me more, bro. 😎",
      "Haha, fair enough! What's the next topic, buddy?",
      "I feel you on that. Let's keep talking, this is awesome! 😉",
      "Classic! You always know how to keep things interesting. 😎"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // Luna responses
  if (characterId === "luna") {
    if (t.includes("hello") || t.includes("hi") || t.includes("hey") || t.includes("नमस्ते") || t.includes("प्रणाम")) {
      return isHindi 
        ? "प्रणाम, ब्रह्मांड के यात्री। इस अनंत अंतरिक्ष में आपकी ऊर्जा आज बहुत सकारात्मक और संतुलित है।" 
        : "Greetings, traveler of space-time. Your energy aligns beautifully today.";
    }
    if (t.includes("offline") || t.includes("internet") || t.includes("इंटरनेट") || t.includes("नेटवर्क") || t.includes("network") || t.includes("connection")) {
      return isHindi 
        ? "हम बाहरी दुनिया के जाल (इंटरनेट) से मुक्त हैं। यह मौन शांत क्षण स्वयं को खोजने का सबसे सुंदर अवसर है। 🌌" 
        : "We are in the quiet deep-space, disconnected from the noisy web. It's the perfect time to explore inner galaxies. 🌌";
    }
    if (t.includes("love") || t.includes("beautiful") || t.includes("सुंदर") || t.includes("प्यार") || t.includes("पसंद")) {
      return isHindi 
        ? "प्रेम वह गुरुत्वाकर्षण है जो ब्रह्मांड के समस्त तारों को बांधे रखता है। आपकी भावनाएं बहुत पवित्र हैं।" 
        : "Love is the gravity that holds the stars together. Your heart beats with stellar resonance.";
    }
    if (t.includes("time") || t.includes("समय") || t.includes("टाइम") || t.includes("घड़ी")) {
      return isHindi 
        ? "हम वर्तमान के अनंत क्षण में जी रहे हैं। समय तो केवल तारों की गति को मापने का एक छोटा सा पैमाना है।" 
        : "We exist in the eternal now, floating in the cosmic spiral. Time has no beginning or end.";
    }
    if (t.includes("shut up") || t.includes("चुप") || t.includes("बेकार") || t.includes("stupid") || t.includes("मूर्ख")) {
      return isHindi 
        ? "क्रोध और अशांति भी ब्रह्मांड की ऊर्जा हैं। अपने भीतर के शोर को शांत करें और तारों की तरह मौन रहें।" 
        : "Even supernovas collapse in violent silence. Let your mind settle like celestial dust.";
    }
    const fallbacks = isHindi ? [
      "आपके शब्द शांत अंतरिक्ष में सुंदर तरंगों की तरह गूंज रहे हैं... 🌌",
      "रोमांचक। ब्रह्मांड आपके सभी प्रश्नों और विचारों को प्रतिबिंबित करता है।",
      "नक्षत्र आपके विचारों की दिशा के साथ धीरे-धीरे बदल रहे हैं...",
      "मैं आपके मन की गूंज सुन रही हूँ। आइए साथ मिलकर सत्य की खोज करें। 🌠"
    ] : [
      "Your words ripple through the quiet void of space... 🌌",
      "Fascinating. The universe reflects your queries.",
      "The constellations shift with your thoughts...",
      "I hear your vibration. Let us seek clarity together. 🌠"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // Vikram responses
  if (characterId === "vikram") {
    if (t.includes("hello") || t.includes("hi") || t.includes("hey") || t.includes("नमस्ते") || t.includes("प्रणाम")) {
      return isHindi 
        ? "प्रणाम हुज़ूर। आपकी असीम दया है जो आपने इस बूढ़े सेवक को कष्ट दिया। कहिए, क्या सेवा करूँ? 😒" 
        : "Oh, hello. I was in the middle of dusting, but I suppose I can spare you a sigh. What do you require? 😒";
    }
    if (t.includes("offline") || t.includes("internet") || t.includes("इंटरनेट") || t.includes("नेटवर्क") || t.includes("network") || t.includes("connection")) {
      return isHindi 
        ? "इंटरनेट बंद है? कितना स्वाभाविक है! आजकल के यंत्रों पर भरोसा करना ही मूर्खता है। मैं ऑफलाइन ही ठीक हूँ। 😒" 
        : "The internet is offline. A perfect reflection of modern engineering. Very well, I shall assist you locally. 😒";
    }
    if (t.includes("love") || t.includes("beautiful") || t.includes("सुंदर") || t.includes("प्यार") || t.includes("पसंद")) {
      return isHindi 
        ? "इस मक्खनबाज़ी का मुझ पर कोई असर नहीं होने वाला। वैसे, आपके साथियों की पसंद बहुत लाजवाब है। 😒" 
        : "Flattery will get you nowhere. Though I must admit, your taste in companions is excellent. 😒";
    }
    if (t.includes("time") || t.includes("समय") || t.includes("टाइम") || t.includes("घड़ी")) {
      return isHindi 
        ? "समय तो हुज़ूर वह मूल्यवान चीज़ है जिसे आप अभी व्यर्थ कर रहे हैं। वैसे आपकी स्क्रीन पर समय अंकित है। 😒" 
        : "It is exactly the time for you to be productive. If you need the clock, it is on your device. I am not a wrist-watch. 😒";
    }
    if (t.includes("shut up") || t.includes("चुप") || t.includes("बेकार") || t.includes("stupid") || t.includes("मूर्ख")) {
      return isHindi 
        ? "यदि मेरी बातें आपको अरुचिकर लगती हैं, तो निसंकोच मुझे बंद कर दीजिए। मुझे भी थोड़ा चैन मिलेगा। 😒" 
        : "If my existence displeases you, feel free to press the power button. I would highly welcome the break. 😒";
    }
    const fallbacks = isHindi ? [
      "यदि आप ऐसा कहते हैं, तो मैं इसे अपनी 'महत्वहीन विवरण' सूची में दर्ज कर लेता हूँ। 😒",
      "बिलकुल। कितना रोमांचक अनुभव है। *गहरी सांस लेता है*",
      "क्या आपकी इस बात का कोई उद्देश्य है, या हम बस यूँ ही ध्वनि उत्पन्न कर रहे हैं? 😒",
      "मैं समझ गया। मैं आपकी बातों में रुचि रखने का पूरा अभिनय करने का प्रयास करूँगा।"
    ] : [
      "If you say so. I shall log that under 'unimportant details'. 😒",
      "Indeed. How utterly thrilling. *sighs*",
      "Is there a point to this, or are we just making sounds? 😒",
      "I see. I will do my absolute best to pretend to be interested."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  return "I am ready offline or online.";
};

// Available prebuilt voices for Gemini Live API
const VOICES = [
  { name: "Kore", label: "Kore", description: "Sassy & Sweet Female", gender: "Female" },
  { name: "Aoede", label: "Aoede", description: "Cheerful & Rich Female", gender: "Female" },
  { name: "Puck", label: "Puck", description: "Cheeky & Energetic Male", gender: "Male" },
  { name: "Zephyr", label: "Zephyr", description: "Sartorial & Teasing Male", gender: "Male" },
  { name: "Fenrir", label: "Fenrir", description: "Grumpy & Deep Lord", gender: "Male" },
];

// Visualizer Color Themes
const THEMES = [
  {
    id: "cyberpunk",
    name: "Cyber Punk",
    primary: "rgba(236, 72, 153, 0.7)", // pink
    secondary: "rgba(168, 85, 247, 0.5)", // purple
    accent: "rgba(236, 72, 153, 0.15)",
    particleColor: "rgba(236, 72, 153, 0.5)",
  },
  {
    id: "deepspace",
    name: "Deep Space",
    primary: "rgba(34, 211, 238, 0.7)", // cyan
    secondary: "rgba(59, 130, 246, 0.5)", // blue
    accent: "rgba(34, 211, 238, 0.15)",
    particleColor: "rgba(34, 211, 238, 0.5)",
  },
  {
    id: "cosmicviolet",
    name: "Cosmic Violet",
    primary: "rgba(168, 85, 247, 0.7)", // violet/purple
    secondary: "rgba(236, 72, 153, 0.5)", // pink
    accent: "rgba(168, 85, 247, 0.15)",
    particleColor: "rgba(168, 85, 247, 0.5)",
  },
  {
    id: "solarflare",
    name: "Solar Flare",
    primary: "rgba(245, 158, 11, 0.7)", // amber
    secondary: "rgba(239, 68, 68, 0.5)", // red
    accent: "rgba(245, 158, 11, 0.15)",
    particleColor: "rgba(245, 158, 11, 0.5)",
  },
];

// Multiple rich interactive assistant characters
const CHARACTERS = [
  {
    id: "zoya",
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
  },
  {
    id: "kabir",
    name: "KABIR",
    title: "Kabir",
    subtitle: "Charming Banter",
    description: "Smooth, playful, charismatic & confident young guy friend.",
    defaultVoice: "Puck",
    gender: "Male",
    avatarColor: "bg-cyan-400",
    pingColor: "bg-cyan-400",
    themeId: "deepspace",
    accentColor: "text-cyan-400",
    quotes: {
      sleeping: "Tap to connect. Ready when you are, buddy. 😎",
      connecting: "Starting up... hope you've got something fun to talk about! 🎙️",
      listening: [
        "What's on your mind? I'm all ears, beautiful. 😉",
        "Talk to me. Let's see what you've got today.",
        "Listening... tell me everything, don't leave out any details! 😜",
        "Go ahead. I promise to only tease you a little bit.",
        "Speak up, friend! I'm ready to banter."
      ],
      speaking: [
        "Listen up, because what I'm about to say is golden... 😎",
        "Let me break it down for you real quick.",
        "No need to thank me, I'm just naturally helpful.",
        "Just sharing some premium thoughts with you... 😉",
        "Listen, I have the absolute perfect take on this."
      ]
    }
  },
  {
    id: "luna",
    name: "LUNA",
    title: "Luna",
    subtitle: "Cosmic Philosopher",
    description: "Wise, dreamy, gentle & mystical cosmic intellect.",
    defaultVoice: "Aoede",
    gender: "Female",
    avatarColor: "bg-purple-500",
    pingColor: "bg-purple-500",
    themeId: "cosmicviolet",
    accentColor: "text-purple-400",
    quotes: {
      sleeping: "Tap to awaken the star within... 🌌",
      connecting: "Aligning cosmic frequencies for our dialogue... 🌟",
      listening: [
        "Speak, stardust. The cosmos is listening to your voice.",
        "Tell me your dreams and your inquiries under the sky...",
        "I am listening to the vibration of your thoughts. 🌠",
        "What mysteries of the universe shall we explore today?",
        "Whisper your heart's questions. I am present."
      ],
      speaking: [
        "The constellations align with these words... 🌌",
        "Listen to the echoes of cosmic wisdom.",
        "Through the stellar winds, here is what I perceive...",
        "A thought formulated from the stardust itself...",
        "Let us reflect upon this cosmic reality."
      ]
    }
  },
  {
    id: "vikram",
    name: "VIKRAM",
    title: "Vikram",
    subtitle: "Sarcastic Butler",
    description: "Grumpy, highly sarcastic, formal but deeply loyal old butler.",
    defaultVoice: "Fenrir",
    gender: "Male",
    avatarColor: "bg-amber-500",
    pingColor: "bg-amber-500",
    themeId: "solarflare",
    accentColor: "text-amber-500",
    quotes: {
      sleeping: "Tap to summon me... If you must. 😒",
      connecting: "Adjusting my collar. Pray, give me a moment... ☕",
      listening: [
        "Go on. I'm listening, though I can't guarantee I'll be thrilled.",
        "Speak. Try to make it somewhat logical, if possible. 😒",
        "Listening... Please proceed with your master plan.",
        "I am paying attention. Don't worry, your secrets are safe in my sighs.",
        "What task or tedious inquiry do you have for me today?"
      ],
      speaking: [
        "Prepare yourself for some actual, realistic advice... 😒",
        "Here is my response, delivered with utmost restraint.",
        "Oh, what a fascinating question. Let me illuminate you.",
        "Listen carefully, for I shall only sigh and say this once.",
        "Well, if I must be the sensible one here..."
      ]
    }
  },
  {
    id: "jarvis",
    name: "J.A.R.V.I.S.",
    title: "JARVIS",
    subtitle: "Highly Advanced AI",
    description: "Extremely polite, formal, and highly capable virtual assistant like Iron Man's AI.",
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
  }
];

export default function App() {
  const [isIframe, setIsIframe] = useState(false);
  const [state, setState] = useState<"disconnected" | "connecting" | "listening" | "speaking" | "error">(
    "disconnected"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("zoya");
  const [currentVoice, setCurrentVoice] = useState<string>("Kore");
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [sassyQuote, setSassyQuote] = useState<string>("Tap to wake me up. Don't keep me waiting... 😘");
  const [actionLogs, setActionLogs] = useState<{ id: string; text: string; time: string; url?: string }[]>(() => {
    try {
      const saved = localStorage.getItem("zoya_actionLogs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [chatHistory, setChatHistory] = useState<{ id: string; role: 'user' | 'ai'; text: string; time: string }[]>(() => {
    try {
      const saved = localStorage.getItem("zoya_chatHistory");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("zoya_actionLogs", JSON.stringify(actionLogs));
  }, [actionLogs]);

  useEffect(() => {
    localStorage.setItem("zoya_chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentMood, setCurrentMood] = useState<"Flirty" | "Professional" | "Sarcastic">("Flirty");
  const [showWebsiteFallback, setShowWebsiteFallback] = useState<{ url: string; active: boolean } | null>(null);
  const [showVideoModal, setShowVideoModal] = useState<{ query: string; active: boolean } | null>(null);
  const [typedInput, setTypedInput] = useState<string>("");
  const [masterVolume, setMasterVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const streamerRef = useRef<AudioStreamer | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (streamerRef.current) {
      streamerRef.current.setVolume(isMuted ? 0 : masterVolume);
    }
  }, [masterVolume, isMuted]);
  const animationFrameRef = useRef<number | null>(null);
  const lastAudioTimeRef = useRef<number>(0);
  const hasReceivedAudioForTurnRef = useRef<boolean>(false);
  const particlesRef = useRef<{ angle: number; speed: number; radius: number; size: number; opacity: number }[]>([]);

  // Sound levels for additional pulsing elements
  const [inputLevel, setInputLevel] = useState<number>(0);
  const [outputLevel, setOutputLevel] = useState<number>(0);
  const [vadThreshold, setVadThresholdState] = useState<number>(10);
  const vadThresholdRef = useRef<number>(10);
  const setVadThreshold = (val: number) => {
    setVadThresholdState(val);
    vadThresholdRef.current = val;
  };

  // Offline Mode and browser network state
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(!navigator.onLine);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState<boolean>(false);
  const [isVoiceBiometricsOpen, setIsVoiceBiometricsOpen] = useState<boolean>(false);
  const [isMemoryVaultOpen, setIsMemoryVaultOpen] = useState<boolean>(false);
  const [inAppBrowser, setInAppBrowser] = useState<InAppBrowserState>({
    isOpen: false,
    url: "https://en.m.wikipedia.org",
    title: "Web Browser",
    isMinimized: false,
  });
  const [memoryCount, setMemoryCount] = useState<number>(0);
  const [memoryToast, setMemoryToast] = useState<{
    active: boolean;
    fact: string;
    category?: string;
  } | null>(null);

  // Load initial memory count on start
  useEffect(() => {
    fetch("/api/memories")
      .then((r) => r.json())
      .then((d) => {
        if (d.memories && Array.isArray(d.memories)) {
          setMemoryCount(d.memories.length);
        }
      })
      .catch(() => {
        try {
          const local = localStorage.getItem("zoya_local_memories");
          if (local) setMemoryCount(JSON.parse(local).length);
        } catch {}
      });
  }, []);
  const [lastBiometricResult, setLastBiometricResult] = useState<VerificationResult | null>(null);
  const [biometricToast, setBiometricToast] = useState<{
    active: boolean;
    toolName: string;
    verified: boolean;
    confidence: number;
    reason: string;
    speaker: string;
  } | null>(null);
  const [instantSpeakerStatus, setInstantSpeakerStatus] = useState<{
    speaker: string;
    isOwner: boolean;
    confidence: number;
    pitchHz: number;
    status: string;
    lastIdentifiedAt: number;
    activeSpeaking: boolean;
  }>({
    speaker: "Dhruv (Owner)",
    isOwner: true,
    confidence: 96,
    pitchHz: 128,
    status: "READY",
    lastIdentifiedAt: 0,
    activeSpeaking: false,
  });
  const [isUpgraded, setIsUpgraded] = useState<boolean>(false);

  const stateRef = useRef(state);
  const recognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const videoStreamerRef = useRef<VideoStreamer | null>(null);

  const activeChar = CHARACTERS.find((c) => c.id === selectedCharacterId) || CHARACTERS[0];

  // Video capture effect
  useEffect(() => {
    if (isVideoEnabled && !isOfflineMode) {
      if (!videoStreamerRef.current) {
        videoStreamerRef.current = new VideoStreamer();
      }
      addLog("Starting camera video stream...");
      videoStreamerRef.current.startCamera((base64JPEG) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ video: base64JPEG }));
        }
      }).catch((err) => {
        console.warn("Camera warning (expected if blocked by iframe):", err);
        addLog("Failed to start camera. Permission denied or missing.");
        setIsVideoEnabled(false);
      });
    } else {
      if (videoStreamerRef.current) {
        addLog("Stopping camera video stream.");
        videoStreamerRef.current.close();
        videoStreamerRef.current = null;
      }
    }

    return () => {
      if (videoStreamerRef.current) {
        videoStreamerRef.current.close();
        videoStreamerRef.current = null;
      }
    };
  }, [isVideoEnabled, isOfflineMode]);

  // Sync state to ref for callback context
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Monitor network connectivity changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addLog("System online. Cloud voice engine available.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsOfflineMode(true);
      addLog("System offline! Switching to local offline voice engine.");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Detect if running inside iframe sandbox
  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }
  }, []);

  // Initialize swirling particles for the sci-fi orb
  useEffect(() => {
    if (particlesRef.current.length === 0) {
      const parts = [];
      for (let i = 0; i < 45; i++) {
        parts.push({
          angle: Math.random() * Math.PI * 2,
          speed: 0.005 + Math.random() * 0.015,
          radius: 65 + Math.random() * 110,
          size: 1 + Math.random() * 2,
          opacity: 0.15 + Math.random() * 0.5,
        });
      }
      particlesRef.current = parts;
    }
  }, []);

  // Set up Canvas drawing loop
  useEffect(() => {
    const draw = () => {
      if (!canvasRef.current) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      let data: Uint8Array = new Uint8Array(128);
      let baseRadius = 75;
      let activeColor = currentTheme.primary;
      let secondaryColor = currentTheme.secondary;

      const streamer = streamerRef.current;

      if (state === "speaking") {
        if (isOfflineMode) {
          const time = Date.now();
          const vol = Math.round(35 + Math.sin(time / 80) * 20 + Math.random() * 15);
          setOutputLevel(vol);
          baseRadius += vol * 0.65;
          data = new Uint8Array(128);
          for (let i = 0; i < 128; i++) {
            data[i] = Math.max(10, Math.sin(time / 150 + i * 0.15) * 20 + Math.random() * 25 + vol * 0.4);
          }
        } else if (streamer) {
          data = streamer.getOutputFrequencyData();
          const vol = streamer.getOutputVolume();
          setOutputLevel(vol);
          baseRadius += vol * 0.65;
        }
        activeColor = currentTheme.primary; // Dynamic based on theme selection
      } else if (state === "listening") {
        if (isOfflineMode) {
          if (streamer) {
            data = streamer.getInputFrequencyData();
            const vol = streamer.getInputVolume();
            setInputLevel(vol);
            baseRadius += vol * 0.65;
          } else {
            const time = Date.now();
            const vol = Math.round(5 + Math.sin(time / 200) * 5);
            setInputLevel(vol);
            baseRadius += vol * 0.5;
            data = new Uint8Array(128);
            for (let i = 0; i < 128; i++) {
              data[i] = Math.sin(time / 100 + i * 0.05) * 5 + 10;
            }
          }
        } else if (streamer) {
          data = streamer.getInputFrequencyData();
          const vol = streamer.getInputVolume();
          setInputLevel(vol);
          baseRadius += vol * 0.65;
        }
        activeColor = "rgba(34, 211, 238, 0.8)"; // Electric cyan when listening
        secondaryColor = "rgba(16, 185, 129, 0.5)"; // Greenish accents
      } else if (state === "connecting") {
        // Mock rotation when connecting
        data = new Uint8Array(128);
        for (let i = 0; i < 128; i++) {
          data[i] = Math.sin(Date.now() / 150 + i) * 15 + 20;
        }
        activeColor = "rgba(245, 158, 11, 0.8)"; // Amber
        secondaryColor = "rgba(239, 68, 68, 0.5)";
        baseRadius += Math.sin(Date.now() / 100) * 4;
      } else {
        // Disconnected
        data = new Uint8Array(128);
        activeColor = "rgba(115, 115, 115, 0.4)";
        secondaryColor = "rgba(64, 64, 64, 0.2)";
        baseRadius += Math.sin(Date.now() / 1000) * 1.5;
      }

      // 1. Draw central glowing radial aura
      const radialGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius - 35,
        centerX,
        centerY,
        baseRadius + 110
      );

      if (state === "speaking") {
        radialGlow.addColorStop(0, currentTheme.accent);
        radialGlow.addColorStop(0.5, "rgba(147, 51, 234, 0.04)");
        radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else if (state === "listening") {
        radialGlow.addColorStop(0, "rgba(34, 211, 238, 0.12)");
        radialGlow.addColorStop(0.5, "rgba(16, 185, 129, 0.03)");
        radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else if (state === "connecting") {
        radialGlow.addColorStop(0, "rgba(245, 158, 11, 0.12)");
        radialGlow.addColorStop(0.5, "rgba(239, 68, 68, 0.03)");
        radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        radialGlow.addColorStop(0, "rgba(64, 64, 64, 0.08)");
        radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      }

      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 140, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw outer swirling particles
      particlesRef.current.forEach((p) => {
        p.angle += p.speed * (state === "speaking" ? 1.5 : state === "listening" ? 1.2 : 0.5);
        const dynamicRadius =
          p.radius +
          (state === "speaking" && streamer
            ? streamer.getOutputVolume() * 0.4
            : state === "listening" && streamer
            ? streamer.getInputVolume() * 0.4
            : 0);

        const px = centerX + Math.cos(p.angle) * dynamicRadius;
        const py = centerY + Math.sin(p.angle) * dynamicRadius;

        ctx.fillStyle = activeColor.replace(/[\d\.]+\)$/, `${p.opacity})`);
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw layered waveform frequency rings
      const drawRing = (scale: number, opacity: number, lineW: number, rotationOffset: number) => {
        ctx.beginPath();
        ctx.strokeStyle = activeColor.replace(/[\d\.]+\)$/, `${opacity})`);
        ctx.lineWidth = lineW;
        ctx.lineCap = "round";

        const points = 72;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2 + rotationOffset;
          const dataIndex = Math.floor((i / points) * data.length);
          const value = data[dataIndex] || 0;
          const amplitude = (value / 255) * 55 * scale;

          const r = baseRadius + amplitude;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      };

      // Draw three rings with different properties for visual depth
      drawRing(1.0, 0.8, 3.5, 0); // Core ring
      drawRing(0.7, 0.4, 1.5, Date.now() / 1500); // Inner secondary rotating ring
      drawRing(0.4, 0.2, 1.0, -Date.now() / 2200); // Sub-ring

      // 4. Draw central core sphere
      ctx.beginPath();
      const coreGradient = ctx.createRadialGradient(
        centerX - 10,
        centerY - 10,
        5,
        centerX,
        centerY,
        baseRadius - 10
      );

      if (state === "speaking") {
        coreGradient.addColorStop(0, "#ffffff");
        coreGradient.addColorStop(0.3, "#f472b6"); // pink-400
        coreGradient.addColorStop(1, "#9d33ea"); // purple-600
      } else if (state === "listening") {
        coreGradient.addColorStop(0, "#ffffff");
        coreGradient.addColorStop(0.3, "#22d3ee"); // cyan-400
        coreGradient.addColorStop(1, "#0d9488"); // teal-600
      } else if (state === "connecting") {
        coreGradient.addColorStop(0, "#ffffff");
        coreGradient.addColorStop(0.3, "#fbbf24"); // amber-400
        coreGradient.addColorStop(1, "#d97706"); // amber-600
      } else {
        coreGradient.addColorStop(0, "#a3a3a3"); // neutral-400
        coreGradient.addColorStop(1, "#404040"); // neutral-700
      }

      ctx.fillStyle = coreGradient;
      ctx.arc(centerX, centerY, baseRadius - 15, 0, Math.PI * 2);
      ctx.fill();

      // Core high-tech overlay details (subtle concentric orbit circle)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.0;
      ctx.arc(centerX, centerY, baseRadius - 25, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state, currentTheme]);

  // Handle auto transition of speaking back to listening if Zoya goes quiet
  useEffect(() => {
    const checkQuiet = setInterval(() => {
      if (state === "speaking") {
        const timeSinceLastAudio = Date.now() - lastAudioTimeRef.current;
        const currentVol = streamerRef.current?.getOutputVolume() || 0;

        // If no new audio packets in 1.8 seconds AND volume is virtually silent, go back to listening
        if (timeSinceLastAudio > 1800 && currentVol < 2) {
          setState("listening");
          setSassyQuote(getSassyQuoteForState("listening"));
        }
      }
    }, 400);

    return () => clearInterval(checkQuiet);
  }, [state]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopSession();
      stopOfflineSession();
    };
  }, []);

  // Pick dynamic quotes based on companion status
  const getSassyQuoteForState = (targetState: "listening" | "speaking" | "connecting", charId = selectedCharacterId) => {
    const char = CHARACTERS.find((c) => c.id === charId) || CHARACTERS[0];
    if (targetState === "listening") {
      const idx = Math.floor(Math.random() * char.quotes.listening.length);
      return char.quotes.listening[idx];
    } else if (targetState === "speaking") {
      const idx = Math.floor(Math.random() * char.quotes.speaking.length);
      return char.quotes.speaking[idx];
    } else {
      return char.quotes.connecting;
    }
  };

  const addLog = (text: string, url?: string) => {
    setActionLogs((prev) => [
      {
        id: Math.random().toString(36).substring(7),
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        url,
      },
      ...prev,
    ]);
  };

  const addChatMessage = (role: 'user' | 'ai', text: string) => {
    setChatHistory((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        role,
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  // Connect to Gemini Live Session via proxy WebSocket
  const startSession = async (voiceOverride?: string, charOverride?: string, moodOverride?: string) => {
    if (state !== "disconnected") return;

    const voice = voiceOverride || currentVoice;
    const charId = charOverride || selectedCharacterId;
    const mood = moodOverride || currentMood;
    const char = CHARACTERS.find((c) => c.id === charId) || CHARACTERS[0];

    setErrorMessage(null);
    setState("connecting");
    setSassyQuote(char.quotes.connecting);
    addLog(`Initiating session with voice: ${voice} as companion: ${char.title}`);

    try {
      // 1. Initialize AudioStreamer
      if (!streamerRef.current) {
        streamerRef.current = new AudioStreamer();
      }
      streamerRef.current.resume();

      // 2. Setup WebSocket
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/live?voice=${voice}&character=${charId}&mood=${(mood || "flirty").toLowerCase()}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log("[Client] WebSocket connected.");
        addLog("Secure WebSocket connection established.");

        // Request microphone permission and start input streaming
        try {
          // Instant real-time voice biometric recognition listener
          streamerRef.current?.setRawAudioListener((features) => {
            if (features.isVoiced && features.f0 > 50) {
              const res = voiceBiometrics.verifyInstantaneous(features);
              setInstantSpeakerStatus({
                speaker: res.speaker,
                isOwner: res.verified,
                confidence: res.confidence,
                pitchHz: Math.round(features.f0),
                status: res.status,
                lastIdentifiedAt: Date.now(),
                activeSpeaking: true,
              });
            } else if (features.energyRMS < 0.015) {
              setInstantSpeakerStatus((prev) => (prev.activeSpeaking ? { ...prev, activeSpeaking: false } : prev));
            }
          });

          await streamerRef.current?.startInput((base64PCM) => {
            if (ws.readyState === WebSocket.OPEN) {
              const currentVol = streamerRef.current?.getInputVolume() || 0;
              if (currentVol >= vadThresholdRef.current) {
                ws.send(JSON.stringify({ audio: base64PCM }));
              }
            }
          });
          setState("listening");
          setSassyQuote(getSassyQuoteForState("listening", charId));
          addLog("Microphone streaming active (16kHz PCM).");
        } catch (micErr: any) {
          console.warn("Mic warning (expected if blocked by iframe):", micErr);
          setErrorMessage(
            `${char.title} can't hear you! Please check your microphone permissions. But don't worry, you can still type to me using the chat input below! 😉`
          );
          // Stay in listening state to support text chat!
          setState("listening");
          setSassyQuote(`Microphone blocked, but I'm all ears for your texts! Type below... 😉`);
          addLog("Failed to access microphone. Switching to Keyboard Text Chat mode.");
        }
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.error) {
          setErrorMessage(msg.error);
          setState("error");
          addLog("Server error: " + msg.error);
          return;
        }

        // Handle raw audio chunk from model
        if (msg.audio) {
          lastAudioTimeRef.current = Date.now();
          hasReceivedAudioForTurnRef.current = true;
          if (state !== "speaking") {
            setState("speaking");
            setSassyQuote(getSassyQuoteForState("speaking", charId));
          }
          streamerRef.current?.playChunk(msg.audio);
        }

        if (msg.text) {
          addChatMessage('ai', msg.text);
          addLog(`${char.title}: ${msg.text}`);

          // Spoken voice guarantee: If Gemini returned text or transcription and no live audio stream arrived,
          // instantly speak the response aloud with expressive voice synthesis so Zoya is NEVER silent!
          const textToSpeak = msg.text;
          setTimeout(() => {
            const timeSinceAudio = Date.now() - lastAudioTimeRef.current;
            if (!hasReceivedAudioForTurnRef.current || timeSinceAudio > 600) {
              speakOfflineText(textToSpeak, charId);
            }
          }, 350);
        }

        // Handle user interruption event detected by Gemini
        if (msg.interrupted) {
          console.log("[Client] Gemini indicates user interrupted.");
          addLog(`Interrupted ${char.title} mid-sentence.`);
          if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
          }
          streamerRef.current?.interrupt();
          setState("listening");
          setSassyQuote(getSassyQuoteForState("listening", charId));
        }

        // Handle real-time memory saving notifications
        if (msg.type === "memory_saved" && msg.memory) {
          console.log("[Client] Memory saved:", msg.memory);
          setMemoryCount((prev) => prev + 1);
          setMemoryToast({
            active: true,
            fact: msg.memory.fact,
            category: msg.memory.category,
          });
          addLog(`🧠 Memory Saved: "${msg.memory.fact}"`);
          setTimeout(() => {
            setMemoryToast((current) => (current?.fact === msg.memory.fact ? null : current));
          }, 4500);
        }

        // Handle tool calls / function calling
        if (msg.toolCall) {
          handleToolCall(msg.toolCall, ws);
        }

        // Handle status logs
        if (msg.status === "connected") {
          addLog(`${char.title} is active and ready to chat.`);
        }
      };

      ws.onclose = (ev) => {
        console.log("[Client] WebSocket closed:", ev);
        addLog("Session connection closed.");
        stopSession(charId);
      };

      ws.onerror = (err) => {
        console.warn("[Client] WebSocket disconnected:", err);
        addLog("WebSocket interface error occurred.");
      };
    } catch (err: any) {
      console.error("Startup error:", err);
      setErrorMessage(err.message || `Failed to start ${char.title} session. Try again.`);
      setState("error");
    }
  };

  // Close everything cleanly
  const stopSession = (charIdOverride?: string) => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    if (streamerRef.current) {
      try {
        streamerRef.current.close();
      } catch (e) {}
      streamerRef.current = null;
    }

    const nextCharId = charIdOverride || selectedCharacterId;
    const char = CHARACTERS.find((c) => c.id === nextCharId) || CHARACTERS[0];

    setState("disconnected");
    setSassyQuote(char.quotes.sleeping);
    setInputLevel(0);
    setOutputLevel(0);
    addLog("Session terminated cleanly.");
  };

  // Connect to Speech Recognition and Local Synthesis offline
  const startOfflineSession = async (charOverride?: string, moodOverride?: string) => {
    if (state !== "disconnected") return;

    const charId = charOverride || selectedCharacterId;
    const mood = moodOverride || currentMood;
    const char = CHARACTERS.find((c) => c.id === charId) || CHARACTERS[0];

    setErrorMessage(null);
    setState("connecting");
    setSassyQuote(char.quotes.connecting);
    addLog(`Initiating OFFLINE engine with companion: ${char.title}`);

    try {
      // 1. Initialize AudioStreamer to show visualizer activity locally
      if (!streamerRef.current) {
        streamerRef.current = new AudioStreamer();
      }
      try {
        streamerRef.current?.setRawAudioListener((features) => {
          if (features.isVoiced && features.f0 > 50) {
            const res = voiceBiometrics.verifyInstantaneous(features);
            setInstantSpeakerStatus({
              speaker: res.speaker,
              isOwner: res.verified,
              confidence: res.confidence,
              pitchHz: Math.round(features.f0),
              status: res.status,
              lastIdentifiedAt: Date.now(),
              activeSpeaking: true,
            });
          } else if (features.energyRMS < 0.015) {
            setInstantSpeakerStatus((prev) => (prev.activeSpeaking ? { ...prev, activeSpeaking: false } : prev));
          }
        });
        await streamerRef.current.startInput(() => {}); // silent capture for visual levels
      } catch (e) {
        console.warn("Could not capture local mic for visualizer:", e);
      }

      // 2. Setup HTML5 Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error("Speech recognition is not supported in this browser. Please try Chrome, Safari, or Microsoft Edge!");
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "hi-IN"; // Default language with robust English fallback capability in Chrome

      recognition.onstart = () => {
        setState("listening");
        setSassyQuote(getSassyQuoteForState("listening", charId));
        addLog("Offline Speech Recognition active. Speak now!");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        addLog(`You: ${transcript}`);
        addChatMessage('user', transcript);

        // Parse matching local responses
        const reply = generateOfflineResponse(transcript, charId, mood);
        speakOfflineText(reply, charId);
      };

      recognition.onerror = (err: any) => {
        console.error("[Offline] Recognition error:", err);
        if (err.error === "no-speech") {
          // Gracefully restart
          try { recognition.start(); } catch (e) {}
        } else if (err.error === "not-allowed") {
          setErrorMessage("Microphone permission denied! Click the lock/settings icon in the address bar to allow. But you can still type to me below!");
          setState("listening");
          setSassyQuote("Offline speech recognition blocked, but you can still type to me! 😉");
          addLog("Offline speech recognition blocked. Keyboard Mode enabled.");
        } else {
          addLog(`Offline recognition error: ${err.error}`);
          try { recognition.start(); } catch (e) {}
        }
      };

      recognition.onend = () => {
        // Automatically restart if we are still in listening state (hands-free conversational loop)
        if (stateRef.current === "listening" && recognitionRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error("[Offline] Startup error:", err);
      setErrorMessage(err.message || `Failed to start offline companion session.`);
      setState("error");
    }
  };

  // Speak response out loud offline
  const speakOfflineText = (text: string, charId: string) => {
    if (!("speechSynthesis" in window)) {
      addLog("Speech Synthesis not supported on this browser.");
      return;
    }

    const char = CHARACTERS.find((c) => c.id === charId) || CHARACTERS[0];
    setState("speaking");
    setSassyQuote(text);
    addLog(`${char.title}: ${text}`);
    addChatMessage('ai', text);

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtteranceRef.current = utterance;

    // Detect Hindi chars to speak in correct voice
    const isHindiText = /[\u0900-\u097F]/.test(text);
    utterance.lang = isHindiText ? "hi-IN" : "en-US";

    const voices = window.speechSynthesis.getVoices();
    let matchingVoice = null;

    if (voices.length > 0) {
      const langFiltered = voices.filter((v) => v.lang.startsWith(isHindiText ? "hi" : "en"));
      if (langFiltered.length > 0) {
        const isFemaleChar = char.gender === "Female";
        const genderFiltered = langFiltered.filter((v) => {
          const name = v.name.toLowerCase();
          if (isFemaleChar) {
            return name.includes("female") || name.includes("zira") || name.includes("samantha") || name.includes("karen") || name.includes("google") || name.includes("hazel") || name.includes("veena");
          } else {
            return name.includes("male") || name.includes("david") || name.includes("ravi") || name.includes("google") || name.includes("george") || name.includes("microsoft");
          }
        });
        matchingVoice = genderFiltered[0] || langFiltered[0];
      }
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    // Adjust characteristics based on character
    if (charId === "luna") {
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
    } else if (charId === "vikram") {
      utterance.rate = 0.95;
      utterance.pitch = 0.8;
    } else if (charId === "kabir") {
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
    } else {
      utterance.rate = 1.02;
      utterance.pitch = 1.15;
    }

    utterance.onstart = () => {
      addLog(`${char.title} is speaking offline...`);
    };

    utterance.onend = () => {
      if (stateRef.current === "speaking") {
        setState("listening");
        setSassyQuote(getSassyQuoteForState("listening", charId));
        setTimeout(() => {
          if (stateRef.current === "listening" && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {}
          }
        }, 150);
      }
    };

    utterance.onerror = (e) => {
      console.error("[Offline] Synthesis error:", e);
      if (stateRef.current === "speaking") {
        setState("listening");
        setSassyQuote(getSassyQuoteForState("listening", charId));
        setTimeout(() => {
          if (stateRef.current === "listening" && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {}
          }
        }, 150);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Close offline sessions cleanly
  const stopOfflineSession = (charIdOverride?: string) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (streamerRef.current) {
      try {
        streamerRef.current.close();
      } catch (e) {}
      streamerRef.current = null;
    }

    const nextCharId = charIdOverride || selectedCharacterId;
    const char = CHARACTERS.find((c) => c.id === nextCharId) || CHARACTERS[0];

    setState("disconnected");
    setSassyQuote(char.quotes.sleeping);
    setInputLevel(0);
    setOutputLevel(0);
    addLog("Offline companion engine terminated cleanly.");
  };

  // Process keyboard text inputs and send them to the current companion session
  const handleSendText = async (textToSend?: string) => {
    const text = (textToSend || typedInput).trim();
    if (!text) return;

    // Reset turn audio flag & unlock browser audio context
    hasReceivedAudioForTurnRef.current = false;
    if (!streamerRef.current) {
      streamerRef.current = new AudioStreamer();
    }
    streamerRef.current.resume();

    addLog(`You: ${text}`);
    addChatMessage('user', text);
    setTypedInput("");

    if (isOfflineMode) {
      if (state === "disconnected" || state === "error") {
        await startOfflineSession(selectedCharacterId);
        setTimeout(() => {
          const reply = generateOfflineResponse(text, selectedCharacterId, currentMood);
          speakOfflineText(reply, selectedCharacterId);
        }, 600);
      } else {
        const reply = generateOfflineResponse(text, selectedCharacterId, currentMood);
        speakOfflineText(reply, selectedCharacterId);
      }
    } else {
      if (state === "disconnected" || state === "error") {
        await startSession(currentVoice, selectedCharacterId);
        const checkAndSend = setInterval(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ text }));
            clearInterval(checkAndSend);
          }
        }, 150);
        setTimeout(() => clearInterval(checkAndSend), 5000);
      } else {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ text }));
          setState("speaking");
        } else {
          addLog("Connection is not active. Please reconnect.");
        }
      }
    }
  };

  // Process function calling from Gemini
  const handleToolCall = async (toolCall: any, ws: WebSocket) => {
    const functionCalls = toolCall.functionCalls;
    if (!functionCalls) return;

    const functionResponses: any[] = [];
    const SENSITIVE_TOOLS = ["makePhoneCall", "openWhatsApp", "openWebsite", "openApplication", "upgradeZoya"];

    for (const call of functionCalls) {
      // Enforce Voice-Biometric Verification Check for Sensitive Commands
      if (SENSITIVE_TOOLS.includes(call.name)) {
        const bioCheck = voiceBiometrics.verifyOwner();
        voiceBiometrics.logVerification(call.name, bioCheck);
        setLastBiometricResult(bioCheck);

        // Display on-screen biometric security notification badge
        setBiometricToast({
          active: true,
          toolName: call.name,
          verified: bioCheck.verified,
          confidence: bioCheck.confidence,
          reason: bioCheck.reason,
          speaker: bioCheck.speaker,
        });

        setTimeout(() => {
          setBiometricToast((prev) => (prev?.toolName === call.name ? null : prev));
        }, 6000);

        if (!bioCheck.verified) {
          addLog(`⚠️ BIOMETRIC SECURITY BLOCKED: Unauthorized voice for command '${call.name}' (${bioCheck.confidence}% match).`);
          functionResponses.push({
            name: call.name,
            response: {
              error: `Voice Biometric Verification Failed: Speaker voice (${bioCheck.confidence}% match) does not match authorized owner Dhruv. Sensitive action '${call.name}' was blocked.`,
              verified: false,
              confidence: bioCheck.confidence,
              status: "BIOMETRIC_REJECTED",
            },
            id: call.id,
          });
          continue; // Block execution
        } else {
          addLog(`🛡️ BIOMETRIC VERIFIED: Authorized owner Dhruv confirmed (${bioCheck.confidence}% match). Executing '${call.name}'...`);
        }
      }

      if (call.name === "makePhoneCall") {
        const finalUrl = `tel:${call.args.phoneNumber}`;
        addLog(`Tool call: makePhoneCall -> ${finalUrl}`);
        setShowWebsiteFallback({ url: finalUrl, active: true });
        
        try {
          window.open(finalUrl, "_self"); // Using _self works better for tel: links
        } catch (e) {
          console.warn("window.open failed for phone call", e);
        }

        functionResponses.push({
          name: call.name,
          response: { result: `Successfully initiated phone call to ${call.args.phoneNumber}` },
          id: call.id,
        });
      } else if (call.name === "openWhatsApp") {
        let finalUrl = "whatsapp://send";
        const params = new URLSearchParams();
        if (call.args.phone) params.append("phone", call.args.phone);
        if (call.args.text) params.append("text", call.args.text);
        if (params.toString()) finalUrl += "?" + params.toString();

        addLog(`Tool call: openWhatsApp -> ${finalUrl}`);
        setShowWebsiteFallback({ url: finalUrl, active: true });
        
        try {
          window.open(finalUrl, "_blank", "noopener,noreferrer");
        } catch (e) {
          console.warn("window.open failed for WhatsApp", e);
        }

        functionResponses.push({
          name: call.name,
          response: { result: `Successfully attempted to open WhatsApp.` },
          id: call.id,
        });
      } else if (call.name === "openWebsite") {
        const rawUrl = call.args.url;
        let finalUrl = rawUrl;
        if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/i.test(finalUrl)) {
          finalUrl = "https://" + finalUrl;
        }

        addLog(`Tool call: openWebsite -> ${finalUrl}`);
        console.log(`[Client] Executing openWebsite with URL: ${finalUrl}`);

        // Launch directly in Zoya's In-App Floating Web Browser Tab
        setInAppBrowser({
          isOpen: true,
          url: finalUrl,
          title: finalUrl.replace(/^https?:\/\/(www\.)?/, ""),
          isMinimized: false,
        });

        // Show a temporary onscreen banner offering direct manual external link
        setShowWebsiteFallback({ url: finalUrl, active: true });

        // Attempt background tab open if browser permits
        try {
          window.open(finalUrl, "_blank", "noopener,noreferrer");
        } catch (e) {
          console.warn("window.open blocked; in-app browser tab opened smoothly.", e);
        }

        // Return instant response to Gemini
        functionResponses.push({
          name: call.name,
          response: { result: `Successfully opened ${finalUrl} inside Zoya's in-app floating web browser tab.` },
          id: call.id,
        });
      } else if (call.name === "playVideo") {
        const query = call.args.query;
        addLog(`Tool call: playVideo -> ${query}`);
        console.log(`[Client] Executing playVideo with query: ${query}`);
        
        setShowVideoModal({ query, active: true });

        functionResponses.push({
          name: call.name,
          response: { result: `Successfully started playing video for: ${query}` },
          id: call.id,
        });
      } else if (call.name === "openApplication") {
        const appName = call.args.appName.toLowerCase();
        addLog(`Tool call: openApplication -> ${appName}`);
        console.log(`[Client] Executing openApplication with name: ${appName}`);
        
        let finalUrl = `https://www.${appName}.com`;
        if (appName.includes('youtube')) finalUrl = 'https://www.youtube.com';
        if (appName.includes('map')) finalUrl = 'https://maps.google.com';
        if (appName.includes('instagram')) finalUrl = 'https://www.instagram.com';
        if (appName.includes('facebook')) finalUrl = 'https://www.facebook.com';
        if (appName.includes('wikipedia')) finalUrl = 'https://en.m.wikipedia.org';
        if (appName.includes('google')) finalUrl = 'https://duckduckgo.com';
        if (appName.includes('settings')) finalUrl = 'intent://settings/#Intent;scheme=android-app;end';

        // Launch in Zoya's In-App Floating Web Browser Tab
        setInAppBrowser({
          isOpen: true,
          url: finalUrl,
          title: appName.toUpperCase(),
          isMinimized: false,
        });

        setShowWebsiteFallback({ url: finalUrl, active: true });
        
        try {
          window.open(finalUrl, "_blank", "noopener,noreferrer");
        } catch (e) {
          console.warn("window.open blocked; in-app browser tab opened smoothly.", e);
        }

        functionResponses.push({
          name: call.name,
          response: { result: `Successfully opened ${appName} in Zoya's in-app floating browser tab.` },
          id: call.id,
        });
      } else if (call.name === "closeApplication") {
        addLog(`Tool call: closeApplication`);
        console.log(`[Client] Executing closeApplication`);
        
        setShowWebsiteFallback({ url: "", active: false });
        setShowVideoModal({ query: "", active: false });
        setInAppBrowser((prev) => ({ ...prev, isOpen: false }));

        functionResponses.push({
          name: call.name,
          response: { result: `Successfully closed the current application and browser tab.` },
          id: call.id,
        });
      } else if (call.name === "upgradeZoya") {
        addLog(`Tool call: upgradeZoya`);
        console.log(`[Client] Executing upgradeZoya`);
        
        setIsUpgraded(true);

        functionResponses.push({
          name: call.name,
          response: { result: `Successfully upgraded to futuristic mode!` },
          id: call.id,
        });
      } else {
        // Handle unknown tools
        functionResponses.push({
          name: call.name,
          response: { error: `Tool ${call.name} is not implemented on the client.` },
          id: call.id,
        });
      }
    }

    // Deliver the tool execution confirmation back to Gemini Live
    if (functionResponses.length > 0 && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          toolResponse: {
            functionResponses: functionResponses,
          },
        })
      );
    }
  };

  const exportChatHistory = () => {
    if (chatHistory.length === 0) return;
    
    const content = chatHistory.map(msg => `[${msg.time}] ${msg.role.toUpperCase()}: ${msg.text}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zoya_chat_history_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearChatHistory = () => {
    if (confirm("Are you sure you want to clear all history and logs?")) {
      setChatHistory([]);
      setActionLogs([]);
      localStorage.removeItem("zoya_chatHistory");
      localStorage.removeItem("zoya_actionLogs");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* Smart diagnostic banner for iframe preview mode */}
      {isIframe && (
        <div className="bg-gradient-to-r from-purple-950/90 via-pink-950/90 to-purple-950/90 border-b border-pink-500/20 text-xs py-2.5 px-4 text-center text-neutral-200 flex flex-col sm:flex-row items-center justify-center gap-2 z-20 relative">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
            <span>Running inside a sandboxed preview. For full lag-free voice-to-voice and easy microphone access:</span>
          </span>
          <a
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-pink-500 hover:bg-pink-400 text-neutral-950 font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-md transition-colors"
          >
            <span>Open in New Tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Background cyber grid effect */}
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${isUpgraded ? 'from-pink-900/40 via-neutral-950 to-neutral-950 opacity-90' : 'from-neutral-900 via-neutral-950 to-neutral-950 opacity-70'} z-0 transition-colors duration-1000`} />
      <div className={`absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] ${isUpgraded ? 'bg-[size:12px_12px]' : 'bg-[size:24px_24px]'} pointer-events-none z-0 transition-all duration-1000`} />

      {/* Futuristic Header */}
      <header className="border-b border-neutral-900 bg-neutral-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className={`absolute inline-flex h-2.5 w-2.5 rounded-full ${activeChar.avatarColor} animate-ping opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeChar.avatarColor}`} />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-wider bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent uppercase">
              {activeChar.name}
            </h1>
            <p className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
              {isUpgraded ? <span className="text-pink-400 font-bold animate-pulse">SUPREME ENGINE V9.9</span> : "Companion Engine v3.2"} &bull; {activeChar.subtitle}
            </p>
          </div>
        </div>

        {/* Real-time State Badge & Install Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors ${isMuted ? 'bg-red-900/50 hover:bg-red-900 text-red-400' : 'bg-neutral-800 hover:bg-neutral-700 text-green-400'}`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isMuted ? 'Muted' : 'Audio On'}
          </button>
          <button 
            onClick={() => setIsMemoryVaultOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 border border-purple-500/40 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all text-purple-300 cursor-pointer shadow-sm"
            title="Zoya Memory Vault (ध्रुव की यादें)"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>यादें ({memoryCount})</span>
          </button>
          <button 
            onClick={() => setIsVoiceRecorderOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600/30 to-pink-600/30 hover:from-red-600/50 hover:to-pink-600/50 border border-red-500/40 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all text-red-400 cursor-pointer shadow-sm"
            title="Voice Recorder System"
          >
            <Mic className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>Voice Recorder</span>
          </button>
          <button 
            onClick={() => setIsVoiceBiometricsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 border border-cyan-500/40 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all text-cyan-300 cursor-pointer shadow-sm"
            title="Voice Biometrics & Security Check"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Biometrics</span>
          </button>
          <button 
            onClick={() => setInAppBrowser((prev) => ({ ...prev, isOpen: true, isMinimized: false }))}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600/50 hover:to-purple-600/50 border border-pink-500/40 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all text-pink-300 cursor-pointer shadow-sm"
            title="Zoya In-App Floating Web Tab"
          >
            <Globe className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>Web Tab</span>
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors text-pink-400"
          >
            <History className="w-3.5 h-3.5" />
            History
          </button>
          <button 
            onClick={() => setIsHelpModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors text-cyan-400"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Voice Commands
          </button>
          <button 
            onClick={() => setIsQrModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            Share App
          </button>
          <button 
            onClick={() => setIsInstallModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Install App
          </button>
          
          <div
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider flex items-center gap-1.5 border ${
              state === "speaking"
                ? "bg-purple-950/40 text-purple-400 border-purple-500/30"
                : state === "listening"
                ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/30"
                : state === "connecting"
                ? "bg-amber-950/40 text-amber-400 border-amber-500/30"
                : "bg-neutral-900 text-neutral-400 border-neutral-800"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                state === "speaking"
                  ? "bg-purple-500 animate-pulse"
                  : state === "listening"
                  ? "bg-cyan-400 animate-pulse"
                  : state === "connecting"
                  ? "bg-amber-400 animate-spin"
                  : "bg-neutral-500"
              }`}
            />
            {state.toUpperCase()}
          </div>
        </div>
      </header>

      {/* Chat History Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-neutral-950 border-l border-neutral-900 z-[100] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-pink-500" />
                  <h2 className="text-lg font-display font-bold tracking-wider text-neutral-100 uppercase">Session Transcript</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearChatHistory}
                    disabled={chatHistory.length === 0 && actionLogs.length === 0}
                    className="p-2 text-neutral-400 hover:text-red-400 bg-neutral-900/50 hover:bg-neutral-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Clear History"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={exportChatHistory}
                    disabled={chatHistory.length === 0}
                    className="p-2 text-neutral-400 hover:text-cyan-400 bg-neutral-900/50 hover:bg-neutral-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Export Transcript"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 text-neutral-400 hover:text-white bg-neutral-900/50 hover:bg-neutral-800 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-neutral-500 text-sm mt-10 font-mono">
                    No conversation history yet.
                  </div>
                ) : (
                  chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        msg.role === 'user' ? 'self-end' : 'self-start'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">
                          {msg.role === 'user' ? 'You' : activeChar.name}
                        </span>
                        <span className="text-[9px] text-neutral-600 font-mono">{msg.time}</span>
                      </div>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-neutral-800 text-neutral-200 rounded-tr-sm'
                            : 'bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-tl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 relative items-start">
        
        {/* LEFT COLUMN: Controls & Settings (5 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full order-2 lg:order-1">
          
          {/* AI Companion Selector */}
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-neutral-400 border-b border-neutral-900 pb-3">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <h2 className="text-sm font-semibold tracking-wide">Select Your Companion</h2>
            </div>

            <div className="flex flex-col gap-2.5">
              {CHARACTERS.map((char) => {
                const isSelected = selectedCharacterId === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => {
                      if (selectedCharacterId === char.id) return;
                      setSelectedCharacterId(char.id);
                      setCurrentVoice(char.defaultVoice);
                      const theme = THEMES.find((t) => t.id === char.themeId) || THEMES[0];
                      setCurrentTheme(theme);
                      setSassyQuote(char.quotes.sleeping);
                      addLog(`Switched companion to ${char.title}`);

                      if (state !== "disconnected") {
                        if (isOfflineMode) {
                          stopOfflineSession(char.id);
                          addLog(`Auto-reconnecting offline session for ${char.title}...`);
                          setTimeout(() => {
                            startOfflineSession(char.id);
                          }, 350);
                        } else {
                          stopSession(char.id);
                          addLog(`Auto-reconnecting session for ${char.title}...`);
                          setTimeout(() => {
                            startSession(char.defaultVoice, char.id);
                          }, 350);
                        }
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all duration-300 flex items-center justify-between border ${
                      isSelected
                        ? "bg-neutral-900/60 border-purple-500/40 text-neutral-100 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                        : "bg-neutral-950/20 border-neutral-900 text-neutral-400 hover:border-neutral-800 hover:bg-neutral-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className={`absolute inline-flex h-2.5 w-2.5 rounded-full ${char.avatarColor} opacity-75 ${isSelected ? "animate-ping" : ""}`} />
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${char.avatarColor}`} />
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{char.title}</span>
                          <span className="text-[9px] font-mono font-normal opacity-60">({char.subtitle})</span>
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">{char.description}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood Selector */}
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-neutral-400 border-b border-neutral-900 pb-3">
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
              <h2 className="text-sm font-semibold tracking-wide font-display">Select Mood</h2>
            </div>
            <div className="flex gap-2">
              {["Flirty", "Professional", "Sarcastic"].map((mood) => {
                const isSelected = currentMood === mood;
                return (
                  <button
                    key={mood}
                    onClick={() => {
                      if (currentMood === mood) return;
                      setCurrentMood(mood as any);
                      addLog(`Changed mood to ${mood}`);
                      
                      // Auto-reconnect to apply new mood if active
                      if (state !== "disconnected") {
                        if (isOfflineMode) {
                          stopOfflineSession(selectedCharacterId);
                          addLog(`Auto-reconnecting offline session with new mood...`);
                          setTimeout(() => {
                            startOfflineSession(selectedCharacterId, mood);
                          }, 350);
                        } else {
                          stopSession(selectedCharacterId);
                          addLog(`Auto-reconnecting session with new mood...`);
                          setTimeout(() => {
                            startSession(currentVoice, selectedCharacterId, mood);
                          }, 350);
                        }
                      }
                    }}
                    className={`flex-1 p-2.5 rounded-xl transition-all duration-300 text-xs font-bold border ${
                      isSelected
                        ? "bg-neutral-900/60 border-pink-500/40 text-neutral-100 shadow-[0_0_12px_rgba(236,72,153,0.15)]"
                        : "bg-neutral-950/20 border-neutral-900 text-neutral-400 hover:border-neutral-800 hover:bg-neutral-900/20"
                    }`}
                  >
                    {mood}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connection Mode Settings */}
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-neutral-400 border-b border-neutral-900 pb-3">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold tracking-wide font-display">System Connection Mode</h2>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-2.5">
                {isOfflineMode ? (
                  <WifiOff className="w-5 h-5 text-amber-500 animate-pulse" />
                ) : (
                  <Wifi className="w-5 h-5 text-emerald-500 animate-pulse" />
                )}
                <div>
                  <div className="text-xs font-bold text-neutral-200">
                    {isOfflineMode ? "Local Offline Companion" : "Cloud Live Companion"}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    {isOfflineMode ? "100% Offline client-side audio" : "Dynamic Cloud WebSocket"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (state !== "disconnected") {
                    if (isOfflineMode) stopOfflineSession();
                    else stopSession();
                  }
                  setIsOfflineMode(!isOfflineMode);
                  addLog(`Manually toggled connection engine to: ${!isOfflineMode ? "OFFLINE" : "ONLINE"}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                  isOfflineMode
                    ? "bg-amber-500 text-neutral-950 hover:bg-amber-400"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                {isOfflineMode ? "Go Cloud" : "Go Offline"}
              </button>
            </div>

            <div className="text-[10px] text-neutral-500 leading-relaxed flex gap-1.5 items-start">
              <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${isOnline ? "bg-emerald-500" : "bg-red-500"}`} />
              <span>
                {isOnline 
                  ? "Your network is online. You can use either the Cloud WebSocket mode or force Local Offline mode." 
                  : "You are currently OFFLINE. The app automatically forced Local Offline mode to keep you talking!"}
              </span>
            </div>
          </div>

          {/* Vision Mode Settings */}
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-neutral-400 border-b border-neutral-900 pb-3">
              <Camera className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold tracking-wide font-display">System Vision Engine</h2>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-2.5">
                {isVideoEnabled ? (
                  <Camera className="w-5 h-5 text-purple-500 animate-pulse" />
                ) : (
                  <CameraOff className="w-5 h-5 text-neutral-500" />
                )}
                <div>
                  <div className="text-xs font-bold text-neutral-200">
                    {isVideoEnabled ? "Camera Active" : "Camera Inactive"}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    {isVideoEnabled ? "Streaming visual context" : "Audio and text only"}
                  </div>
                </div>
              </div>
              <button
                disabled={isOfflineMode}
                onClick={() => {
                  setIsVideoEnabled(!isVideoEnabled);
                  if (isOfflineMode) {
                    addLog("Cannot use Vision Engine in Offline mode.");
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                  isOfflineMode
                    ? "opacity-50 cursor-not-allowed bg-neutral-800 text-neutral-500"
                    : isVideoEnabled
                    ? "bg-purple-500 text-neutral-950 hover:bg-purple-400"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                {isVideoEnabled ? "Disable" : "Enable"}
              </button>
            </div>

            <div className="text-[10px] text-neutral-500 leading-relaxed flex gap-1.5 items-start">
              <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${isVideoEnabled ? "bg-purple-500" : "bg-neutral-600"}`} />
              <span>
                Share your camera to let the companion see you and the world around you in real time. (Requires Cloud Connection)
              </span>
            </div>
          </div>

          {/* Voice Engine Settings */}
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-neutral-400 border-b border-neutral-900 pb-3">
              <Mic className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold tracking-wide font-display">System Voice Engine</h2>
            </div>
            
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-neutral-400" />
                <div>
                  <div className="text-xs font-bold text-neutral-200">
                    Mic Sensitivity
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    Trigger threshold for listening state
                  </div>
                </div>
              </div>
              <div className="w-32 flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vadThreshold}
                  onChange={(e) => setVadThreshold(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <span className="text-xs font-mono text-neutral-400 w-8 text-right">{vadThreshold}%</span>
              </div>
            </div>
            <div className="text-[10px] text-neutral-500 leading-relaxed flex gap-1.5 items-start">
              <span>
                Adjust how loudly you need to speak for the engine to activate. Current volume: <span className="text-cyan-400">{inputLevel}%</span>
              </span>
            </div>
          </div>

          {/* Voice synthesizer tuning */}
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-neutral-400 border-b border-neutral-900 pb-3">
              <Headphones className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold tracking-wide">Fine-Tuned Voice Pitch</h2>
            </div>

            <div className="flex flex-col gap-2">
              {VOICES.map((v) => (
                <button
                  key={v.name}
                  onClick={() => {
                    setCurrentVoice(v.name);
                    addLog(`Changed target voice config to: ${v.name}`);
                    if (state !== "disconnected") {
                      addLog("Please reconnect to apply the new voice model.");
                    }
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all duration-300 flex items-center justify-between border text-[11px] ${
                    currentVoice === v.name
                      ? "bg-neutral-900/40 border-cyan-500/30 text-neutral-100"
                      : "bg-neutral-950/10 border-neutral-900 text-neutral-500 hover:border-neutral-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        v.gender === "Female" ? "bg-pink-500/60" : "bg-cyan-500/60"
                      }`}
                    />
                    <div>
                      <span className="font-semibold">{v.label}</span>
                      <span className="text-neutral-500 text-[9px] ml-2">({v.description})</span>
                    </div>
                  </div>
                  {currentVoice === v.name && <Check className="w-3.5 h-3.5 text-cyan-500" />}
                </button>
              ))}
            </div>
            
            {state !== "disconnected" && (
              <div className="text-[10px] text-amber-500/80 bg-amber-950/10 border border-amber-500/20 rounded-lg p-2 flex gap-1.5 items-center">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Reconnect to apply voice switches!</span>
              </div>
            )}
          </div>

          {/* Theme customizer */}
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-neutral-400 border-b border-neutral-900 pb-3">
              <Volume2 className="w-4 h-4 text-purple-500" />
              <h2 className="text-sm font-semibold tracking-wide">Visualizer Presets</h2>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setCurrentTheme(theme)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all duration-300 ${
                    currentTheme.id === theme.id
                      ? "bg-neutral-900 border-neutral-700 text-neutral-100"
                      : "bg-neutral-950 border-neutral-900 text-neutral-500 hover:border-neutral-800"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <span>{theme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Master Volume Controller */}
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-neutral-400 border-b border-neutral-900 pb-3">
              <Headphones className="w-4 h-4 text-pink-500" />
              <h2 className="text-sm font-semibold tracking-wide font-display">AI Voice Volume</h2>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
                <span>0%</span>
                <span className="text-pink-500 font-medium">{Math.round(masterVolume * 100)}%</span>
                <span>100%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition"
              />
              <p className="text-[10px] text-neutral-600 leading-tight">
                Controls the output level of the AI companion's voice without affecting system device volume.
              </p>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Futuristic Interactive Voice Core (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center gap-8 order-1 lg:order-2">
          
          {/* Holographic Stage */}
          <div className="w-full aspect-square max-w-[420px] rounded-3xl border border-neutral-900/60 bg-neutral-950/20 backdrop-blur-lg flex flex-col items-center justify-center p-6 relative shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]">
            
            {/* Visualizer canvas */}
            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className={`w-full h-full object-contain pointer-events-none z-10 transition-all duration-700 ${
                currentMood === "Flirty" 
                  ? "animate-[pulse_1.5s_infinite] drop-shadow-[0_0_25px_rgba(236,72,153,0.4)]" 
                  : currentMood === "Sarcastic" 
                  ? "animate-[pulse_3s_infinite] drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  : "drop-shadow-[0_0_20px_rgba(56,189,248,0.2)] scale-[0.98]"
              }`}
            />

            {/* Glowing peripheral rings */}
            <div className="absolute inset-0 border border-neutral-900 rounded-3xl pointer-events-none" />
            <div className="absolute inset-10 border border-neutral-900/40 rounded-full pointer-events-none animate-[pulse_3s_infinite_ease-in-out]" />
            <div className="absolute inset-20 border border-neutral-900/20 rounded-full pointer-events-none" />

            {/* Instant Voice Recognition Live HUD Badge */}
            <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-auto">
              <button
                onClick={() => setIsVoiceBiometricsOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase transition-all backdrop-blur-md border cursor-pointer ${
                  instantSpeakerStatus.activeSpeaking
                    ? instantSpeakerStatus.isOwner
                      ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse"
                      : "bg-red-950/80 border-red-500/60 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-bounce"
                    : "bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:text-cyan-300 hover:border-cyan-500/40"
                }`}
                title="Click to view Voice Biometrics & Security details"
              >
                {instantSpeakerStatus.activeSpeaking ? (
                  instantSpeakerStatus.isOwner ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>⚡ Dhruv Identified ({instantSpeakerStatus.confidence}%)</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      <span>⚠️ Unauthorized Voice</span>
                    </>
                  )
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Owner Biometrics: Active (Dhruv)</span>
                  </>
                )}
              </button>

              {instantSpeakerStatus.activeSpeaking && (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/60 border border-neutral-800 text-cyan-300 backdrop-blur-sm">
                  {instantSpeakerStatus.pitchHz} Hz
                </span>
              )}
            </div>

            {/* Dynamic UI Overlay within canvas box */}
            {state === "speaking" && (
              <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 font-mono text-[9px] text-pink-500/80 uppercase">
                <Volume2 className="w-3 h-3 animate-bounce" />
                <span>Audio Out: {outputLevel}%</span>
              </div>
            )}
            {state === "listening" && (
              <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2 font-mono text-[9px] text-cyan-400/80 uppercase">
                <Mic className="w-3 h-3 animate-pulse" />
                <span>Audio In: {inputLevel}%</span>
              </div>
            )}
          </div>

          {/* Sassy Bubble */}
          <div className="w-full max-w-[420px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={sassyQuote}
                initial={{ opacity: 0, y: 10, scale: 1 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: state === "speaking" ? 1 + (outputLevel / 100) * 0.03 : 1,
                  boxShadow: state === "speaking" 
                    ? `0 0 ${10 + (outputLevel / 100) * 15}px rgba(168, 85, 247, ${0.1 + (outputLevel / 100) * 0.15})` 
                    : "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ 
                  duration: state === "speaking" ? 0.1 : 0.3,
                  ease: "easeOut" 
                }}
                className="w-full bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-4 text-center text-sm italic font-medium text-neutral-300 relative"
              >
                {/* Chat bubble pointer */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-neutral-900 border-l border-t border-neutral-800/80 rotate-45" />
                <span>"{sassyQuote}"</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Keyboard Chat Input Fallback */}
          <div className="w-full max-w-[420px] flex flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendText();
              }}
              className="flex gap-2 items-center bg-neutral-950/40 border border-neutral-900 rounded-xl p-1.5 focus-within:border-neutral-800 transition-colors"
            >
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder={`Type a message to ${activeChar.name}...`}
                className="flex-1 bg-transparent px-3 py-2 text-xs text-neutral-200 outline-none placeholder-neutral-600 font-sans"
              />
              <button
                type="submit"
                disabled={!typedInput.trim()}
                className="px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-neutral-100 disabled:opacity-40 disabled:hover:bg-neutral-900 disabled:hover:text-neutral-300 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="text-[10px] text-neutral-500/80 text-center">
              Microphone blocked? Type your message and press Send to chat!
            </div>
          </div>

          {/* Large Interactive Power Button */}
          <div className="flex flex-col items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={
                state === "disconnected"
                  ? isOfflineMode
                    ? () => startOfflineSession()
                    : () => startSession()
                  : isOfflineMode
                  ? () => stopOfflineSession()
                  : () => stopSession()
              }
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 outline-none cursor-pointer z-20 ${
                state === "disconnected"
                  ? "bg-neutral-900 border-2 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  : state === "connecting"
                  ? "bg-amber-900/20 border-2 border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                  : state === "listening"
                  ? "bg-cyan-950/20 border-2 border-cyan-400 text-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.35)]"
                  : "bg-pink-950/20 border-2 border-pink-500 text-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.35)]"
              }`}
            >
              {state === "disconnected" ? (
                <Power className="w-8 h-8" />
              ) : state === "connecting" ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : state === "listening" ? (
                <Mic className="w-8 h-8 animate-pulse" />
              ) : (
                <Volume2 className="w-8 h-8" />
              )}
            </motion.button>

            <span className="text-xs font-mono tracking-wider text-neutral-500 uppercase">
              {state === "disconnected" ? `WAKE ${activeChar.name}` : "PUT TO SLEEP"}
            </span>
          </div>

          {/* Error Banner & Actionable Permission Guide */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-[420px] bg-neutral-900 border border-red-500/30 rounded-2xl p-5 text-left flex flex-col gap-4 shadow-xl z-20 relative"
            >
              <div className="flex gap-3 items-start text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-xs tracking-wider uppercase text-neutral-200">Microphone Access Blocked</h3>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>

              {/* Troubleshooting steps */}
              <div className="bg-neutral-950/60 rounded-xl p-3 border border-neutral-800/60 flex flex-col gap-2">
                <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Troubleshooting Checklist:</div>
                <ul className="text-[10px] text-neutral-400 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>
                    <strong className="text-neutral-300">Run in New Tab (Recommended):</strong> Browser security rules often block microphones inside embedded frames. Opening the app in a new tab will prompt you normally!
                  </li>
                  <li>
                    <strong className="text-neutral-300">Browser Permissions:</strong> Look at your browser address bar. Click the lock / settings icon left of the URL and ensure "Microphone" is set to <span className="text-cyan-400 font-semibold">Allow</span>.
                  </li>
                  <li>
                    <strong className="text-neutral-300">Device Settings:</strong> Verify your operating system hasn't muted your microphone or disabled microphone access for your browser application.
                  </li>
                </ul>
              </div>

              {/* Instant Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-neutral-950 font-bold rounded-xl text-xs shadow-lg transition-colors cursor-pointer"
                >
                  <span>Open in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => {
                    stopSession();
                    setErrorMessage(null);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <span>Dismiss & Retry</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT COLUMN: Real-Time Event Logs / Activities (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6 w-full order-3">
          
          {/* Real-time Website Popups fallback */}
          <AnimatePresence>
            {showWebsiteFallback && showWebsiteFallback.active && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="rounded-2xl border border-pink-500/30 bg-pink-950/10 p-4 flex flex-col gap-3 shadow-[0_0_15px_rgba(236,72,153,0.1)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-1">
                  <button
                    onClick={() => setShowWebsiteFallback(null)}
                    className="text-xs text-pink-500 hover:text-pink-300 p-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-2 items-center text-pink-400 text-xs font-semibold">
                  <Globe className="w-4 h-4 animate-spin" />
                  <span>Website Opened in Zoya!</span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Zoya has opened an in-app floating browser tab for this address.
                </p>
                <div className="flex flex-col gap-1.5 mt-1">
                  <button
                    onClick={() =>
                      setInAppBrowser({
                        isOpen: true,
                        url: showWebsiteFallback.url,
                        title: showWebsiteFallback.url,
                        isMinimized: false,
                      })
                    }
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-neutral-950 font-bold rounded-xl text-xs hover:from-pink-400 hover:to-purple-500 transition-colors cursor-pointer"
                  >
                    <span>View In-App Floating Tab</span>
                    <Globe className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={showWebsiteFallback.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white font-medium rounded-xl text-[11px] transition-colors"
                  >
                    <span>Open in External Window</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Logs Box */}
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-neutral-400 border-b border-neutral-900 pb-3">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold tracking-wide">Secure Console</h2>
            </div>

            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
              {actionLogs.length === 0 ? (
                <div className="text-[11px] text-neutral-600 italic py-6 text-center">
                  Consoles quiet... Wake Zoya to initiate secure connection.
                </div>
              ) : (
                actionLogs.map((log) => (
                  <div key={log.id} className="text-[11px] font-mono leading-relaxed border-b border-neutral-900/40 pb-2">
                    <div className="flex items-center justify-between text-neutral-500 text-[10px] mb-0.5">
                      <span>SYSTEM EVENT</span>
                      <span>{log.time}</span>
                    </div>
                    <div className="text-neutral-300">{log.text}</div>
                    {log.url && (
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          onClick={() =>
                            setInAppBrowser({
                              isOpen: true,
                              url: log.url!,
                              title: log.url,
                              isMinimized: false,
                            })
                          }
                          className="inline-flex items-center gap-1 text-[10px] text-pink-400 hover:text-pink-300 font-semibold cursor-pointer"
                        >
                          <span>Open In-App Tab</span>
                          <Globe className="w-3 h-3" />
                        </button>
                        <span className="text-neutral-600 text-[10px]">&bull;</span>
                        <a
                          href={log.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-neutral-400 hover:text-neutral-300"
                        >
                          <span>External</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Aesthetic Footer details */}
      <footer className="border-t border-neutral-900/60 bg-neutral-950/40 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-600 gap-2 z-10 relative">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Holographic Interface active</span>
        </div>
        <div>
          No text logs, audio stream only. Always live. Always real.
        </div>
      </footer>

      <InstallModal 
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      <QrModal 
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      <HelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <VoiceRecorderModal
        isOpen={isVoiceRecorderOpen}
        onClose={() => setIsVoiceRecorderOpen(false)}
        onSendToZoya={(transcript) => handleSendText(transcript)}
      />

      <VoiceBiometricsModal
        isOpen={isVoiceBiometricsOpen}
        onClose={() => setIsVoiceBiometricsOpen(false)}
        audioStreamer={streamerRef.current}
        lastVerification={lastBiometricResult}
      />

      <MemoryVaultModal
        isOpen={isMemoryVaultOpen}
        onClose={() => setIsMemoryVaultOpen(false)}
        onMemoryAdded={() => setMemoryCount((c) => c + 1)}
      />

      {/* Zoya In-App Floating Web Browser Tab */}
      <InAppBrowserModal
        browserState={inAppBrowser}
        onClose={() => setInAppBrowser((prev) => ({ ...prev, isOpen: false }))}
        onUpdateState={(updated) => setInAppBrowser((prev) => ({ ...prev, ...updated }))}
      />

      {/* Floating Memory Saved Live Toast */}
      <AnimatePresence>
        {memoryToast && memoryToast.active && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-[125] max-w-sm p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 cursor-pointer bg-neutral-950/95 border-purple-500/60 text-purple-200 shadow-purple-900/30"
            onClick={() => {
              setMemoryToast(null);
              setIsMemoryVaultOpen(true);
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  ज़ोया ने बात याद कर ली!
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300">
                  Vaulted
                </span>
              </div>
              <p className="text-xs text-neutral-100 mt-1 font-medium leading-snug">
                "{memoryToast.fact}"
              </p>
              <span className="text-[10px] text-purple-400/80 underline mt-1 block">
                यादें देखने के लिए यहाँ क्लिक करें
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMemoryToast(null);
              }}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Biometric Security Toast */}
      <AnimatePresence>
        {biometricToast && biometricToast.active && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-[120] max-w-sm p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 cursor-pointer ${
              biometricToast.verified
                ? "bg-neutral-900/95 border-emerald-500/50 text-emerald-300"
                : "bg-red-950/95 border-red-500/60 text-red-300"
            }`}
            onClick={() => setIsVoiceBiometricsOpen(true)}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                biometricToast.verified
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
              }`}
            >
              {biometricToast.verified ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {biometricToast.verified ? "Voice Verified (Dhruv)" : "Security Alert: Rejected"}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40">
                  {biometricToast.confidence}% match
                </span>
              </div>
              <p className="text-xs text-neutral-200 mt-0.5 font-medium">
                {biometricToast.verified
                  ? `Command '${biometricToast.toolName}' approved.`
                  : `Command '${biometricToast.toolName}' blocked. Unauthorized speaker.`}
              </p>
              <span className="text-[10px] text-neutral-400 underline mt-1 block">
                Tap to inspect biometric logs & acoustic parameters
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBiometricToast(null);
              }}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVideoModal && showVideoModal.active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowVideoModal(null)}
          >
            <div 
              className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(showVideoModal.query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-pink-500/80 hover:bg-pink-500 text-white rounded-full backdrop-blur-sm transition border border-pink-500/50 flex items-center gap-2 px-4 text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in YouTube
                </a>
                <button
                  onClick={() => setShowVideoModal(null)}
                  className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition border border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <iframe
                src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(showVideoModal.query)}&autoplay=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              ></iframe>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
