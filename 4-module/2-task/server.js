const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');

const server = new http.Server();

server.on('error', (e) => {
});

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST': {
      const arr = pathname.split('/');
      if (arr.length > 1) {
        res.statusCode = 400;
        res.end();
        return;
      }
      if (fs.existsSync(filepath)) {
        res.statusCode = 409;
        res.end();
        return;
      }
      const limitStream = new LimitSizeStream({limit: 1024 * 1024});
      const wstream = fs.createWriteStream(filepath);

      req
          .on('aborted', () => {
            if (fs.existsSync(filepath)) {
              fs.unlink(filepath, (e) => {
                res.statusCode = 500;
                res.end();
              });
            }
          })
          .pipe(limitStream)
          .on('error', (e) => {
            if (e instanceof LimitExceededError) {
              if (fs.existsSync(filepath)) {
                fs.unlink(filepath, (e) => {});
              }
              res.statusCode = 413;
              res.end();
            }
          })
          .pipe(wstream)
          .on('finish', () => {
            res.statusCode = 201;
            res.end();
          });
      return;
    }
    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
