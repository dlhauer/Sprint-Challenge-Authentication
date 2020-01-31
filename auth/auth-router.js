const router = require('express').Router();
const bc = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/secrets');
const Users = require('./auth-model');

router.post('/register', (req, res) => {
  const user = req.body;
  const hash = bc.hashSync(user.password); 
  user.password = hash;
  Users.add(user)
    .then(id => {
      res.status(201).json(id);
    })
    .catch(error => {
      res.status(500).json({
        error: 'Error saving new user.'
      });
    });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bc.compareSync(password, user.password)) {
        const token = signToken(user);
        res.status(200).json({token: token})
      } else {
        res.status(401).json({ message: 'Invalid kridencials!'})
      }
    })
});

function signToken(user) {
  const payload = {
    user
  };
  const options = {
    expiresIn: '1h'
  };
  return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;
