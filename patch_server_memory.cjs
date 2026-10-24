const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const fetchMemoryLogic = `
    let supabase = null;
    let memoryContext = "";
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
      try {
        const { data, error } = await supabase.from('memories').select('fact').order('created_at', { ascending: false }).limit(20);
        if (data && data.length > 0) {
          memoryContext = "\\n\\nHere is what you remember about Dhruv from past conversations:\\n" + data.map((m) => "- " + m.fact).join("\\n");
        }
      } catch (err) {
        console.error("Supabase memory fetch error:", err);
      }
    }
`;

const systemInstructionAppend = `    systemInstruction += memoryContext + "\\n\\nIs app ke developer`;

content = content.replace(`    systemInstruction += "\\n\\nIs app ke developer`, fetchMemoryLogic + systemInstructionAppend);
fs.writeFileSync('server.ts', content);
