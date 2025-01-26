const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Créer la table si elle n'existe pas
async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                score INTEGER NOT NULL,
                time INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

initializeDatabase();

module.exports = async (req, res) => {
    // Activer CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            // Récupérer le top 10 des scores
            const result = await pool.query(`
                SELECT name, score, time 
                FROM leaderboard 
                ORDER BY score DESC, time ASC 
                LIMIT 10
            `);
            res.status(200).json(result.rows);
        } 
        else if (req.method === 'POST') {
            const { name, score, time } = req.body;

            // Validation des données
            if (!name || typeof score !== 'number' || typeof time !== 'number') {
                res.status(400).json({ error: 'Données invalides' });
                return;
            }

            // Insérer le nouveau score
            await pool.query(
                'INSERT INTO leaderboard (name, score, time) VALUES ($1, $2, $3)',
                [name, score, time]
            );

            res.status(201).json({ message: 'Score sauvegardé avec succès' });
        } 
        else {
            res.status(405).json({ error: 'Méthode non autorisée' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}; 