const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000/api/live?voice=Kore');
ws.on('open', () => {
  console.log('Connected!');
});
ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.status === 'connected') {
    ws.send(JSON.stringify({ text: "Say 'Hello Zoya', literally just those two words in English." }));
  } else if (msg.audio) {
    console.log('Got audio chunk of length', msg.audio.length);
  } else {
    console.log('Got message:', msg);
  }
});
setTimeout(() => ws.close(), 6000);
