const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `SECURITY RULES (HIGHEST PRIORITY):`;
const replacement = `IMPORTANT INSTRUCTION: Aapko hamesha Hindi mein hi baat karni hai. (You must always speak in Hindi).\\n\\nSECURITY RULES (HIGHEST PRIORITY):`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
