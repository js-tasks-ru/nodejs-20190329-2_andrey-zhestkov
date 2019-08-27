const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

module.exports = new LocalStrategy(
    {usernameField: 'email', session: false},
    function(email, password, done) {
      User.findOne({email}, async (err, user) => {
        if (err || !user) {
          done(null, false, 'Нет такого пользователя');
          return;
        }
        const isValid = await user.checkPassword(password);
        if (isValid) {
          done(null, user);
        } else {
          done(null, false, 'Невереный пароль');
        }
      });
    }
);
