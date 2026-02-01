const alasql = require('alasql');
const questions = require('../server/questions');
const supabase = require('../server/supabase');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, userAnswer } = req.body;

    if (!id || typeof userAnswer !== 'string') {
        return res.status(400).json({ error: 'Missing id or userAnswer' });
    }

    const question = questions.find(q => q.id === parseInt(id, 10));

    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }

    const blockedPatterns = /\b(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|TRUNCATE)\b/i;
    if (blockedPatterns.test(userAnswer) && !userAnswer.toLowerCase().includes('select')) {
        return res.json({ correct: false, error: 'Unauthorized command detected' });
    }

    let dbId = null;

    try {
        dbId = `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        alasql(`CREATE DATABASE ${dbId}`);
        alasql(`USE ${dbId}`);

        if (question.tables) {
            Object.entries(question.tables).forEach(([tableName, tableData]) => {
                alasql(`CREATE TABLE ${tableName}`);
                tableData.rows.forEach(row => {
                    alasql(`INSERT INTO ${tableName} VALUES ?`, [row]);
                });
            });
        }

        let userResult;
        try {
            userResult = alasql(userAnswer);
        } catch (sqlErr) {
            if (dbId) alasql(`DROP DATABASE IF EXISTS ${dbId}`);
            return res.json({
                correct: false,
                error: `SQL Error: ${sqlErr.message.split('\n')[0]}`
            });
        }

        const correctResult = alasql(question.correctAnswer);
        const isCorrect = JSON.stringify(userResult) === JSON.stringify(correctResult);

        if (dbId) alasql(`DROP DATABASE IF EXISTS ${dbId}`);

        if (isCorrect) {
            res.json({ correct: true, unlockCode: question.unlockCode });
        } else {
            res.json({ correct: false, error: 'Result mismatch' });
        }

    } catch (err) {
        console.error('Sandbox Error:', err.message);
        if (dbId) alasql(`DROP DATABASE IF EXISTS ${dbId}`);
        res.status(500).json({ error: 'Execution error' });
    }
}
