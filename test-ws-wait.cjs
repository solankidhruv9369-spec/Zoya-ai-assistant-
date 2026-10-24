const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000/api/live?voice=Kore');
ws.on('open', () => {
  console.log('Connected!');
});
ws.on('message', (data) => {
  console.log('Got message:', JSON.parse(data.toString()));
});
setTimeout(() => ws.close(), 5000);
