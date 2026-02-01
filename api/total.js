const questions = require('../lib/questions');

module.exports = function handler(req, res) {
    res.json({ total: questions.length });
};
