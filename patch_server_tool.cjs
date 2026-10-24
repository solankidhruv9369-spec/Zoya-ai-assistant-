const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `            } else if (message.toolCall) {
              console.log("[WS] Tool call request received:", message.toolCall);
              clientWs.send(JSON.stringify({ toolCall: message.toolCall }));
            } else {`;

const replacement = `            } else if (message.toolCall) {
              console.log("[WS] Tool call request received:", message.toolCall);
              
              const clientCalls = [];
              const serverResponses = [];
              
              for (const call of message.toolCall.functionCalls || []) {
                if (call.name === "saveMemory") {
                  console.log("Saving memory to Supabase:", call.args.fact);
                  if (supabase) {
                    supabase.from('memories').insert([{ fact: call.args.fact }]).then(() => {
                      console.log("Memory saved.");
                      session.sendToolResponse({
                        functionResponses: [{
                          id: call.id,
                          name: call.name,
                          response: { success: true, saved: call.args.fact }
                        }]
                      });
                    }).catch(err => console.error("Error saving memory:", err));
                  }
                } else {
                  clientCalls.push(call);
                }
              }
              
              if (clientCalls.length > 0) {
                clientWs.send(JSON.stringify({ toolCall: { functionCalls: clientCalls } }));
              }
            } else {`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
