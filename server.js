require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const leaderboardHandler = require('./api/leaderboard');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// API Routes
app.use('/api/leaderboard', leaderboardHandler);

// Serve static files
app.get('*', (req, res) => {
    // Si l'URL ne contient pas d'extension, ajouter .html
    let filePath = req.url;
    if (!path.extname(filePath)) {
        filePath += '.html';
    }
    
    // Si l'URL contient /pages/, servir le fichier correspondant
    if (filePath.includes('/pages/')) {
        res.sendFile(path.join(__dirname, 'public', filePath));
    } else {
        res.sendFile(path.join(__dirname, 'public/pages/index.html'));
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 