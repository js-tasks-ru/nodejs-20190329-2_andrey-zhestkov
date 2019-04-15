const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.last = '';
    this.on('error', (e) => {
      console.log(e);
    });
  }

  _transform(chunk, encoding, callback) {
    const str = chunk.toString('utf-8');
    const lines = ((this.last || '') + str).split(os.EOL);
    this.last = lines.pop();
    lines.forEach((line) => {
      this.push(line);
    });
    callback();
  }

  _flush(callback) {
    this.push(this.last != null ? this.last : '');
    callback();
  }
}

module.exports = LineSplitStream;
