// Données du quiz
const quizData = [
    {
        question: "Qu'est-ce que l'IA générative ?",
        options: [
            "Une IA qui génère des réponses basées sur des données statistiques",
            "Une technologie qui permet de créer du contenu comme des images ou du texte",
            "Un système qui réagit uniquement aux commandes vocales",
            "Une technique pour accélérer les calculs informatiques"
        ],
        correct: 1
    },
    {
        question: "Quelle technologie est souvent utilisée pour l'IA générative ?",
        options: [
            "GANs (Generative Adversarial Networks)",
            "Bases de données relationnelles",
            "Algorithmes de tri",
            "Serveurs web classiques"
        ],
        correct: 0
    },
    {
        question: "Dans quel domaine l'IA générative est-elle couramment utilisée dans le jeu vidéo ?",
        options: [
            "L'optimisation réseau",
            "La modélisation d'objets 3D",
            "La gestion des stocks",
            "Le débogage automatique"
        ],
        correct: 1
    }
];

// Éléments HTML
const quizContainer = document.getElementById("quiz-container");
const startButton = document.getElementById("start-quiz");

let currentQuestion = 0;
let score = 0;

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
    }

    currentQuestion++;

    if (currentQuestion < quizData.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

// Fonction pour afficher les résultats
function showResults() {
    quizContainer.innerHTML = `
        <h3>Quiz terminé !</h3>
        <p>Votre score : ${score} / ${quizData.length}</p>
        <button onclick="restartQuiz()">Recommencer le quiz</button>
    `;
}

// Fonction pour redémarrer le quiz
function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    loadQuestion();
}

// Démarrer le quiz
startButton.addEventListener("click", () => {
    startButton.style.display = "none";
    loadQuestion();
});
