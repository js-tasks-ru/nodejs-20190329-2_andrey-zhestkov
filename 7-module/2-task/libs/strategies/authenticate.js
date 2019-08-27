const User = require('../../models/User');

module.exports = function authenticate(strategy, email, displayName, done) {
  if (!email) {
    done(null, false, 'Не указан email');
    return;
  }
  User.findOne({email}, (err, user) => {
    if (err || !user) {
      User.create({email, displayName}, (err, user) => {
        if (err) {
          done(err);
        } else {
          done(null, user);
        }
      });
    } else {
      done(null, user);
    }
  });
};
