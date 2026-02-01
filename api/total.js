const questions = require('../server/questions');

export default function handler(req, res) {
    res.json({ total: questions.length });
}
