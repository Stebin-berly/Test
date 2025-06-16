const http = require('http');
const fs = require('fs');
const path = require('path');

const bookings = [];

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (req.url === '/') {
      serveFile(res, path.join(__dirname, 'public', 'index.html'), 'text/html');
    } else if (req.url === '/bookings') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(bookings));
    } else {
      const parsed = new URL(req.url, `http://${req.headers.host}`);
      const filePath = path.join(__dirname, 'public', parsed.pathname);
      const ext = path.extname(filePath);
      const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
      serveFile(res, filePath, types[ext] || 'application/octet-stream');
    }
  } else if (req.method === 'POST' && req.url === '/book') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const slot = params.get('slot');
      const time = params.get('time');
      bookings.push({ slot, time });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, slot }));
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
