// Éléments HTML
const quizContainer = document.getElementById("quiz-container");
const startButton = document.getElementById("start-quiz");
const playerNameInput = document.getElementById("player-name");

let currentQuestionIndex = 0;
let score = 0;
let leaderboard = [];
let organizedQuizData = [];
let playerName = "";

// Fonction pour charger les données JSON
async function fetchJSON(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) {
        throw new Error(`Erreur lors du chargement de ${filePath}`);
    }
    return await response.json();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function organizeQuestionsByDifficulty(questions) {
    const difficulties = ["easy", "medium", "hard"];
    let sortedQuestions = [];

    difficulties.forEach(difficulty => {
        const filteredQuestions = questions.filter(q => q.difficulty === difficulty);
        shuffleArray(filteredQuestions);
        sortedQuestions = sortedQuestions.concat(filteredQuestions);
    });

    return sortedQuestions;
}

// Fonction pour charger une question
function loadQuestion() {
    const questionData = organizedQuizData[currentQuestionIndex];

    is_image = (questionData.type === "image");
    image_options = is_image ? "image-options" : "";
    image_option = is_image ? "image-option" : "";

    quizContainer.innerHTML = `
            <div class="quiz-question">${questionData.question}</div>
            <ul class="quiz-options ${image_options}">
                ${questionData.options
                    .map((option, index) => `
                        <li>
                            <button onclick="selectAnswer(${index})" class=${image_option}>
                            ${is_image
                                ? `<img src="assets/${option}.png" alt="${option}"/>`
                                : option}
                            </button>
                        </li>
                    `)
                    .join("")}
            </ul>
        `;
}


// Fonction pour gérer la sélection de réponse
function selectAnswer(selectedIndex) {
    const questionData = organizedQuizData[currentQuestionIndex];
    const optionsList = document.querySelectorAll(".quiz-options button");

    optionsList.forEach((button) => (button.disabled = true));

    optionsList[questionData.correct].classList.add("correct");

    is_correct = (selectedIndex === questionData.correct)

    if (is_correct) {
        score++;
    }
    else {
        optionsList[selectedIndex].classList.add("incorrect");
    }

    const explanationContainer = document.createElement("div");
    explanationContainer.className = "explanation";
    explanationContainer.innerHTML = `
        <p>${questionData.explication || "Pas d'explication disponible pour cette question."}</p>
        ${is_correct 
            ? `<button onclick="nextQuestion()">Question suivante</button>`
            : `<button onclick="endGame()">Score</button>`}
    `;
    quizContainer.appendChild(explanationContainer);
}

// Fonction pour passer à la question suivante
function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < quizData.length) {
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
    currentQuestionIndex = 0;
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
        organizedQuizData = organizeQuestionsByDifficulty(quizData);
        loadQuestion();
    } catch (error) {
        alert("Erreur : " + error.message);
    }
});
