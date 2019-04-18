const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET': {
      const arr = pathname.split('/');
      if (arr.length > 1) {
        res.statusCode = 400;
        res.end();
        return;
      }
      if (!fs.existsSync(filepath)) {
        res.statusCode = 404;
        res.end();
        return;
      }
      const rstream = fs.createReadStream(filepath);
      rstream.on('error', (e) => {
        res.statusCode = 500;
        res.end();
        return;
      });
      rstream.pipe(res);
      return;
    }

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
