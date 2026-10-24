const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000/api/live');
ws.on('open', () => console.log('connected'));
ws.on('message', (data) => console.log('message:', data.toString()));
ws.on('error', (err) => console.log('error:', err));
ws.on('close', () => console.log('closed'));
