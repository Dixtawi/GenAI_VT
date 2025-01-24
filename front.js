// Éléments HTML
const quizContainer = document.getElementById("quiz-container");
const startButton = document.getElementById("start-quiz");
const playerNameInput = document.getElementById("player-name");

let currentQuestion = 0;
let score = 0;
let leaderboard = [];
let playerName = "";

// Fonction pour charger les données JSON
async function fetchJSON(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) {
        throw new Error(`Erreur lors du chargement de ${filePath}`);
    }
    return await response.json();
}

let quizData = [];

// Fonction pour charger une question
function loadQuestion() {
    const questionData = quizData[currentQuestion];

    quizContainer.innerHTML = `
        <div class="quiz-question">${questionData.question}</div>
        <ul class="quiz-options">
            ${questionData.options
                .map((option, index) => `<li><button onclick="selectAnswer(${index})">${option}</button></li>`)
                .join("")}
        </ul>
    `;
}

// Fonction pour gérer la sélection de réponse
function selectAnswer(selectedIndex) {
    const questionData = quizData[currentQuestion];

    if (selectedIndex === questionData.correct) {
        score++;
        alert("Bonne réponse !");
    } else {
        alert("Mauvaise réponse. La bonne réponse était : " + questionData.options[questionData.correct]);
        endGame();
        return;
    }

    currentQuestion++;

    if (currentQuestion < quizData.length) {
        loadQuestion();
    } else {
        endGame();
    }
}

// Fonction pour terminer le jeu
async function endGame() {
    // Ajouter ou mettre à jour le score du joueur dans le leaderboard
    const existingPlayer = leaderboard.find(entry => entry.name === playerName);
    if (existingPlayer) {
        existingPlayer.score = Math.max(existingPlayer.score, score); // Met à jour si le nouveau score est supérieur
    } else {
        leaderboard.push({ name: playerName, score });
    }

    // Trier le leaderboard
    leaderboard.sort((a, b) => b.score - a.score);

    // Sauvegarder le leaderboard via le backend
    try {
        await fetch('/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: playerName, score })
        });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du leaderboard :', error);
    }

    quizContainer.innerHTML = `
        <h2>Quiz terminé !</h2>
        <p>Votre score : ${score}</p>`;
}

// Fonction pour redémarrer le quiz
function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    loadQuestion();
}

// Démarrer le quiz
startButton.addEventListener("click", async () => {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Veuillez entrer votre nom pour commencer le quiz.");
        return;
    }

    startButton.style.display = "none";
    playerNameInput.style.display = "none";

    try {
        quizData = await fetchJSON('quiz.json');
        leaderboard = await fetchJSON('leaderboard.json');
        loadQuestion();
    } catch (error) {
        alert("Erreur : " + error.message);
    }
});
