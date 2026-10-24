const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000/api/live?voice=Kore');
ws.on('open', () => {
  console.log('Connected!');
  ws.send(JSON.stringify({ audio: "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=" })); // fake tiny audio
});
ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.audio) {
    console.log('Got audio chunk of length', msg.audio.length);
  } else {
    console.log('Got message:', msg);
  }
});
setTimeout(() => ws.close(), 5000);
