import { createLeaderboardTable, getLeaderboard, addScore } from '../lib/db';

export default async function handler(req, res) {
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
        res.status(500).json({ error: 'Erreur serveur' });
    }
} 