const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Update systemInstruction to remind her to save facts
const oldSystemInstr = `Jab bhi aap koi command execute karein ya tool use karein, toh humesha bol kar bhi response dein.`;
const newSystemInstr = `Jab bhi aap koi command execute karein ya tool use karein, toh humesha bol kar bhi response dein. Agar Dhruv aapko kisi ka naam ya koi important baat yaad rakhne ko kahe, toh turant saveMemory tool ka use karke use yaad kar lijiye taki aap future me use na bhoolein.`;
content = content.replace(oldSystemInstr, newSystemInstr);

// Update saveMemory description to be more general
const oldToolDesc = `Save an important fact, memory, or preference about Dhruv to your long-term Supabase memory so you never forget it.`;
const newToolDesc = `Save an important fact, memory, name, or preference to your long-term Supabase database memory so you never forget it.`;
content = content.replace(oldToolDesc, newToolDesc);

const oldFactDesc = `The fact or memory to save about Dhruv (e.g. 'Dhruv loves black coffee', 'Dhruv is working on a new AI project').`;
const newFactDesc = `The fact, name, or memory to save (e.g. 'Dhruv loves black coffee', 'Dhruv's friend name is Rahul').`;
content = content.replace(oldFactDesc, newFactDesc);

fs.writeFileSync('server.ts', content);
