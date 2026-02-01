const questions = require('../../lib/questions');

module.exports = function handler(req, res) {
    const { id } = req.query;
    const questionId = parseInt(id, 10);
    const question = questions.find(q => q.id === questionId);

    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }

    // Strip sensitive data
    const safeQuestion = {
        id: question.id,
        level: question.level,
        title: question.title,
        storySetup: question.storySetup,
        gatekeeperMessage: question.gatekeeperMessage,
        hint: question.hint,
        tables: {}
    };

    if (question.tables) {
        Object.keys(question.tables).forEach(tableName => {
            safeQuestion.tables[tableName] = {
                columns: question.tables[tableName].columns
            };
        });
    }

    res.json(safeQuestion);
};
