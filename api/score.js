const supabase = require('../server/supabase');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, rollNo, score, time } = req.body;

    if (!name || !rollNo || score === undefined || !time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
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
};
