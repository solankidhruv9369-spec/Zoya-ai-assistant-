const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Add import
content = content.replace('import dotenv from "dotenv";', 'import dotenv from "dotenv";\nimport { createClient } from "@supabase/supabase-js";');

// Add tools array definition to include saveMemory
const toolBlockTarget = `              functionDeclarations: [
                {
                  name: "makePhoneCall",`;
                  
const toolBlockReplacement = `              functionDeclarations: [
                {
                  name: "saveMemory",
                  description: "Save an important fact, memory, or preference about Dhruv to your long-term Supabase memory so you never forget it.",
                  parameters: {
                    type: "OBJECT" as any,
                    properties: {
                      fact: {
                        type: "STRING" as any,
                        description: "The fact or memory to save about Dhruv (e.g. 'Dhruv loves black coffee', 'Dhruv is working on a new AI project').",
                      },
                    },
                    required: ["fact"],
                  },
                },
                {
                  name: "makePhoneCall",`;
                  
content = content.replace(toolBlockTarget, toolBlockReplacement);

fs.writeFileSync('server.ts', content);
