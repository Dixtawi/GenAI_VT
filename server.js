const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;
const leaderboardPath = 'leaderboard.json';


// Middleware pour traiter les données JSON
app.use(bodyParser.json());

// Charger le leaderboard
app.get('/leaderboard', (req, res) => {
    fs.readFile('leaderboard.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Erreur lors de la lecture du leaderboard.');
        } else {
            res.send(JSON.parse(data));
        }
    });
});

// Mettre à jour le leaderboard
app.post('/leaderboard', (req, res) => {
    const { name, score } = req.body;

    if (!name || typeof score !== 'number') {
        res.status(400).send('Nom ou score invalide.');
        return;
    }

    fs.readFile(leaderboardPath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Erreur lors de la lecture du leaderboard.');
            return;
        }

        const leaderboard = JSON.parse(data);
        const existingPlayer = leaderboard.find(entry => entry.name === name);

        if (existingPlayer) {
            existingPlayer.score = Math.max(existingPlayer.score, score); // Met à jour si le score est supérieur
        } else {
            leaderboard.push({ name, score });
        }

        leaderboard.sort((a, b) => b.score - a.score); // Trier les scores par ordre décroissant

        fs.writeFile(leaderboardPath, JSON.stringify(leaderboard, null, 2), (err) => {
            if (err) {
                res.status(500).send('Erreur lors de la mise à jour du leaderboard.');
            } else {
                res.send({ message: 'Leaderboard mis à jour avec succès.' });
            }
        });
    });
});



// Servir les fichiers statiques
app.use(express.static('./'));

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
