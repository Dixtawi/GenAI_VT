const quizContainer = document.getElementById("quiz-container");
const startButton = document.getElementById("start-quiz");
const playerNameInput = document.getElementById("player-name");

let currentQuestionIndex = 0;
let score = 0;
let quizData = [];
let leaderboard = [];
let organizedQuizData = [];
let playerName = "";
let startTime;

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

function loadQuestion() {
    const questionData = organizedQuizData[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / organizedQuizData.length) * 100;

    const isImage = questionData.type === "image";
    const optionsClass = isImage ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2";
    const optionClass = isImage ? "image-option" : "quiz-option";

    quizContainer.innerHTML = `
        <div class="mb-8">
            <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-600">Question ${currentQuestionIndex + 1}/${organizedQuizData.length}</span>
                <span class="text-sm font-medium text-gray-600">Score: ${score}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-primary-500 h-2 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
            </div>
        </div>
        
        <div class="quiz-question">
            ${questionData.question}
        </div>

        <div class="quiz-options ${optionsClass}">
            ${questionData.options.map((option, index) => `
                <button onclick="selectAnswer(${index})" 
                        class="${optionClass} group relative"
                        data-index="${index}">
                    ${isImage 
                        ? `<img src="assets/${option}.png" alt="${option}" class="w-full h-auto rounded-lg"/>`
                        : `<span>${option}</span>`
                    }
                    <div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                </button>
            `).join("")}
        </div>
    `;

    // Animation d'entrée des options
    const options = quizContainer.querySelectorAll('.quiz-option, .image-option');
    options.forEach((option, index) => {
        option.style.opacity = '0';
        option.style.transform = 'translateY(20px)';
        setTimeout(() => {
            option.style.transition = 'all 0.5s ease-out';
            option.style.opacity = '1';
            option.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function selectAnswer(selectedIndex) {
    const questionData = organizedQuizData[currentQuestionIndex];
    const options = quizContainer.querySelectorAll('.quiz-option, .image-option');
    const selectedOption = options[selectedIndex];
    const correctOption = options[questionData.correct];

    // Désactiver tous les boutons
    options.forEach(button => {
        button.disabled = true;
        button.classList.add('pointer-events-none');
    });

    // Animer la réponse correcte
    correctOption.classList.add('correct', 'animate-bounce-in');

    const isCorrect = selectedIndex === questionData.correct;
    if (isCorrect) {
        score++;
        selectedOption.classList.add('correct');
    } else {
        selectedOption.classList.add('incorrect', 'animate-shake');
    }

    // Créer et animer l'explication
    const explanationContainer = document.createElement('div');
    explanationContainer.className = 'explanation opacity-0 transform translate-y-4';
    explanationContainer.innerHTML = `
        <div class="flex items-center mb-4">
            <div class="flex-shrink-0 w-8 h-8 ${isCorrect ? 'text-green-500' : 'text-red-500'} mr-3">
                ${isCorrect 
                    ? '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
                    : '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
                }
            </div>
            <p class="text-lg font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}">
                ${isCorrect ? 'Bonne réponse !' : 'Pas tout à fait...'}
            </p>
        </div>
        <p class="text-gray-600 mb-4">${questionData.explication || "Pas d'explication disponible pour cette question."}</p>
        <button onclick="${isCorrect ? 'nextQuestion()' : 'endGame()'}" 
                class="btn-primary w-full md:w-auto">
            ${isCorrect ? 'Question suivante' : 'Voir mon score'}
        </button>
    `;

    quizContainer.appendChild(explanationContainer);

    // Animer l'apparition de l'explication
    setTimeout(() => {
        explanationContainer.classList.add('transition-all', 'duration-500', 'opacity-100', 'transform', 'translate-y-0');
    }, 100);
}

function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < organizedQuizData.length) {
        loadQuestion();
    } else {
        endGame();
    }
}

async function endGame() {
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    
    let message = `
        <div class="text-center animate-fade-in">
            <div class="mb-8">
                <div class="inline-block p-4 rounded-full bg-primary-100 text-primary-500 mb-4">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z">
                        </path>
                    </svg>
                </div>
                <h2 class="text-3xl font-bold mb-2">Quiz terminé !</h2>
                <p class="text-xl text-gray-600">Votre score : ${score}/${organizedQuizData.length}</p>
                <p class="text-gray-500">Temps : ${Math.floor(timeTaken / 60)}min ${timeTaken % 60}s</p>
            </div>
    `;
    
    try {
        const response = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: playerName, score, time: timeTaken })
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la sauvegarde du score');
        }
        
        message += `
            <div class="mb-8 p-4 bg-green-50 text-green-700 rounded-lg">
                <p class="font-medium">Score sauvegardé avec succès !</p>
            </div>
        `;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du leaderboard :', error);
        message += `
            <div class="mb-8 p-4 bg-red-50 text-red-700 rounded-lg">
                <p class="font-medium">Erreur lors de la sauvegarde du score.</p>
                <p class="text-sm">Réessayez plus tard.</p>
            </div>
        `;
    }

    message += `
            <div class="flex flex-col md:flex-row justify-center gap-4">
                <button onclick="startQuiz()" class="btn-primary">
                    Rejouer
                </button>
                <a href="/leaderboard" class="btn-secondary">
                    Voir le classement
                </a>
            </div>
        </div>
    `;

    quizContainer.innerHTML = message;
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    startTime = Date.now();
    loadQuestion();
}

// Initialisation du quiz
document.addEventListener('DOMContentLoaded', async () => {
    try {
        quizData = await fetchJSON('quiz.json');
        leaderboard = await fetchJSON('leaderboard.json');
        organizedQuizData = organizeQuestionsByDifficulty(quizData);
        startQuiz();
    } catch (error) {
        quizContainer.innerHTML = `
            <div class="text-center p-8 bg-red-50 rounded-lg">
                <p class="text-red-600 font-medium">Erreur : ${error.message}</p>
                <button onclick="location.reload()" class="btn-primary mt-4">
                    Réessayer
                </button>
            </div>
        `;
    }
});

// Démarrer le quiz
startButton.addEventListener("click", async () => {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        return;
    }

    startButton.style.display = "none";
    playerNameInput.style.display = "none";

    try {
        quizData = await fetchJSON('quiz.json');
        leaderboard = await fetchJSON('leaderboard.json');
        organizedQuizData = organizeQuestionsByDifficulty(quizData);
        startQuiz();
    } catch (error) {
        alert("Erreur : " + error.message);
    }
});
