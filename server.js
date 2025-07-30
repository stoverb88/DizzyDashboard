const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '192.168.4.120';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev });
const handle = app.getRequestHandler();

// SSL certificate paths
let httpsOptions;
try {
  httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost.pem')),
  };
  console.log('✓ SSL certificates loaded successfully');
} catch (err) {
  console.error('✗ Failed to load SSL certificates:', err.message);
  process.exit(1);
}

app.prepare().then(() => {
  const server = createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on https://${hostname}:${port}`);
    console.log('> HTTPS server started successfully');
    console.log('> Press Ctrl+C to stop');
  });
});