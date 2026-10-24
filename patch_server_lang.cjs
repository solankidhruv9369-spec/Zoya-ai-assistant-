const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldLang = `IMPORTANT INSTRUCTION: Aapko hamesha Hindi mein hi baat karni hai.`;
const newLang = `IMPORTANT INSTRUCTION: Dhruv aapse jis bhasha (language) mein baat karein, aapko usi bhasha mein jawab dena hai. Agar woh Hindi mein bolen, toh aap bhi Hindi mein bolen. Agar woh English mein bolen, toh aap bhi English mein bolen. Aapki aawaz natural aur conversational honi chahiye.`;

content = content.replace(oldLang, newLang);
fs.writeFileSync('server.ts', content);
