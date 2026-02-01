// ============================================
// SQL ESCAPE ROOM - BACKEND SERVER
// ============================================

require('dotenv').config();
const express = require('express');
const path = require('path');
const alasql = require('alasql');
const questions = require('./questions');
const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /api/question/:id
 * Returns question metadata WITHOUT correct answer or row data (Blind Sandbox Rule)
 */
app.get('/api/question/:id', (req, res) => {
    const questionId = parseInt(req.params.id, 10);
    const question = questions.find(q => q.id === questionId);

    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }

    // Strip sensitive data: correctAnswer and all row data from tables
    const safeQuestion = {
        id: question.id,
        level: question.level,
        title: question.title,
        storySetup: question.storySetup,
        gatekeeperMessage: question.gatekeeperMessage,
        hint: question.hint,
        tables: {}
    };

    // Only expose table names and columns (schema), not row data
    if (question.tables) {
        Object.keys(question.tables).forEach(tableName => {
            safeQuestion.tables[tableName] = {
                columns: question.tables[tableName].columns
            };
        });
    }

    res.json(safeQuestion);
});

/**
 * POST /api/check
 * Validates user SQL query against correct answer using sandboxed execution
 */
app.post('/api/check', (req, res) => {
    const { id, userAnswer } = req.body;

    // Input validation
    if (!id || typeof userAnswer !== 'string') {
        return res.status(400).json({ error: 'Missing id or userAnswer' });
    }

    const question = questions.find(q => q.id === parseInt(id, 10));

    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }

    // Basic SQL injection protection - block dangerous commands
    const blockedPatterns = /\b(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|TRUNCATE)\b/i;
    if (blockedPatterns.test(userAnswer) && !userAnswer.toLowerCase().includes('select')) {
        return res.json({ correct: false, error: 'Unauthorized command detected' });
    }

    let dbId = null;

    try {
        // Create isolated sandbox database
        dbId = `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        alasql(`CREATE DATABASE ${dbId}`);
        alasql(`USE ${dbId}`);

        // Populate sandbox with question data
        if (question.tables) {
            Object.entries(question.tables).forEach(([tableName, tableData]) => {
                alasql(`CREATE TABLE ${tableName}`);
                tableData.rows.forEach(row => {
                    alasql(`INSERT INTO ${tableName} VALUES ?`, [row]);
                });
            });
        }

        // Execute user query
        let userResult;
        try {
            userResult = alasql(userAnswer);
        } catch (sqlErr) {
            cleanup(dbId);
            return res.json({
                correct: false,
                error: `SQL Error: ${sqlErr.message.split('\n')[0]}`
            });
        }

        // Execute golden query
        const correctResult = alasql(question.correctAnswer);

        // Compare results
        const isCorrect = JSON.stringify(userResult) === JSON.stringify(correctResult);

        // Cleanup
        cleanup(dbId);

        if (isCorrect) {
            // Return the unlock code from the question
            res.json({ correct: true, unlockCode: question.unlockCode });
        } else {
            res.json({ correct: false, error: 'Result mismatch' });
        }

    } catch (err) {
        console.error('Sandbox Error:', err.message);
        cleanup(dbId);
        res.status(500).json({ error: 'Execution error' });
    }
});

/**
 * GET /api/total
 * Returns total number of questions
 */
app.get('/api/total', (req, res) => {
    res.json({ total: questions.length });
});

/**
 * POST /api/score
 * Save player score to Supabase
 */
app.post('/api/score', async (req, res) => {
    const { name, rollNo, score, time } = req.body;

    // Validation
    if (!name || !rollNo || score === undefined || !time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Save to Supabase
        const { data, error } = await supabase
            .from('player_scores')
            .insert([
                {
                    player_name: name,
                    roll_number: rollNo,
                    score: score,
                    time_taken: time,
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) {
            console.error('Supabase Error:', error);
            // Log to console even if Supabase fails
            console.log(`📊 Score (Not Saved): ${name} (${rollNo}) - Score: ${score}, Time: ${time}`);
            return res.json({ success: true, message: 'Score logged locally' });
        }

        console.log(`✅ Score Saved to Supabase: ${name} (${rollNo}) - Score: ${score}, Time: ${time}`);
        res.json({ success: true, message: 'Score saved to database' });

    } catch (err) {
        console.error('Error:', err);
        console.log(`📊 Score (Error): ${name} (${rollNo}) - Score: ${score}, Time: ${time}`);
        res.json({ success: true, message: 'Score logged' });
    }
});

// ============================================
// UTILITIES
// ============================================
function cleanup(dbId) {
    if (dbId) {
        try {
            alasql(`DROP DATABASE IF EXISTS ${dbId}`);
        } catch (e) {
            // Ignore cleanup errors
        }
    }
}

// ============================================
// SERVER START
// ============================================
app.listen(PORT, () => {
    console.log(`🚀 SQL Escape Room running on http://localhost:${PORT}`);
    console.log(`📊 Questions loaded: ${questions.length}`);
});
