const { createLeaderboardTable, getLeaderboard, addScore } = require('../lib/db');

module.exports = async function handler(req, res) {
    // Activer CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Créer la table si elle n'existe pas
        await createLeaderboardTable();

        if (req.method === 'GET') {
            const leaderboard = await getLeaderboard();
            res.status(200).json(leaderboard);
        } else if (req.method === 'POST') {
            const { name, score, time } = req.body;
            if (!name || typeof score !== 'number') {
                return res.status(400).json({ error: 'Nom ou score invalide' });
            }

            await addScore({ name, score, time });
            res.status(200).json({ message: 'Score ajouté avec succès' });
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).json({ error: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        console.error('Erreur serveur:', error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
} 