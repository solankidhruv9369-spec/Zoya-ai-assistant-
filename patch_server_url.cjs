const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);`;
const replacement = `let cleanUrl = process.env.SUPABASE_URL.trim();
      if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
      if (cleanUrl.endsWith('/rest/v1')) cleanUrl = cleanUrl.slice(0, -8);
      supabase = createClient(cleanUrl, process.env.SUPABASE_KEY.trim());`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
