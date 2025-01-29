const quizContainer = document.getElementById("quiz-container");
const startButton = document.getElementById("start-quiz");
const playerNameInput = document.getElementById("player-name");
const startSection = document.getElementById("start-section");

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
        const shuffledQuestions = shuffleArray([...filteredQuestions]);
        sortedQuestions = sortedQuestions.concat(shuffledQuestions);
    });

    return sortedQuestions;
}

function loadQuestion() {
    const questionData = organizedQuizData[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / organizedQuizData.length) * 100;
    const isImage = questionData.type === "image";
    const difficulty = {
        easy: { text: 'Facile', color: 'text-emerald-500 bg-emerald-50' },
        medium: { text: 'Moyen', color: 'text-amber-500 bg-amber-50' },
        hard: { text: 'Difficile', color: 'text-rose-500 bg-rose-50' }
    }[questionData.difficulty];

    const shuffledOptions = questionData.options.map((option, index) => ({
        text: option,
        isCorrect: index === questionData.correct
    }));
    shuffleArray(shuffledOptions);

    const newCorrectIndex = shuffledOptions.findIndex(option => option.isCorrect);

    quizContainer.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-500">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center space-x-4">
                    <span class="text-lg font-medium text-gray-600">Question ${currentQuestionIndex + 1}/${organizedQuizData.length}</span>
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${difficulty.color}">${difficulty.text}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span class="text-lg font-medium text-gray-600">Score: ${score}</span>
                </div>
            </div>

            <div class="w-full bg-gray-100 rounded-full h-2 mb-8">
                <div class="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out"
                     style="width: ${progress}%">
                </div>
            </div>
            
            <div class="quiz-question text-2xl font-semibold mb-8 text-gray-800">
                ${questionData.question}
            </div>

            <div class="grid ${isImage ? 'grid-cols-2' : 'grid-cols-1'} gap-4 md:gap-6">
                ${shuffledOptions.map((option, index) => `
                    <button onclick="selectAnswer(${index}, ${newCorrectIndex})" 
                            class="quiz-option group relative p-6 rounded-xl border-2 border-gray-200 hover:border-violet-500 transition-all duration-200 ${isImage ? 'aspect-square' : ''}"
                            data-index="${index}">
                        ${isImage 
                            ? `<img src="../assets/${option.text}.png" alt="${option.text}" class="w-full h-full object-cover rounded-lg"/>`
                            : `<span class="text-lg text-gray-700 font-medium">${option.text}</span>`
                        }
                        <div class="absolute inset-0 bg-violet-500 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-200"></div>
                    </button>
                `).join("")}
            </div>
        </div>
    `;

    // Animation d'entrée des options
    const options = quizContainer.querySelectorAll('.quiz-option');
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

function selectAnswer(selectedIndex, correctIndex) {
    const options = quizContainer.querySelectorAll('.quiz-option');
    const selectedOption = options[selectedIndex];
    const correctOption = options[correctIndex];

    // Désactiver tous les boutons
    options.forEach(button => {
        button.disabled = true;
        button.classList.add('pointer-events-none');
    });

    // Animer et styliser la réponse correcte et incorrecte
    correctOption.classList.add('border-emerald-500', 'bg-emerald-50');
    
    const isCorrect = selectedIndex === correctIndex;
    if (isCorrect) {
        score++;
        selectedOption.classList.add('border-emerald-500', 'bg-emerald-50', 'ring-2', 'ring-emerald-500', 'ring-opacity-50');
    } else {
        selectedOption.classList.add('border-rose-500', 'bg-rose-50', 'ring-2', 'ring-rose-500', 'ring-opacity-50');
    }

    // Créer et animer l'explication
    const explanationContainer = document.createElement('div');
    explanationContainer.className = 'mt-8 transform translate-y-4 opacity-0 transition-all duration-500';
    
    const isLastQuestion = currentQuestionIndex === organizedQuizData.length - 1;
    const nextAction = isCorrect ? 'nextQuestion()' : 'endGame()';
    const buttonText = isCorrect && !isLastQuestion ? 'Question suivante' : 'Voir mon score';
    
    explanationContainer.innerHTML = `
        <div class="bg-white rounded-xl p-6 border-2 ${isCorrect ? 'border-emerald-500' : 'border-rose-500'}">
            <div class="flex items-center mb-4">
                <div class="flex-shrink-0 w-12 h-12 ${isCorrect ? 'text-emerald-500' : 'text-rose-500'} mr-4">
                    ${isCorrect 
                        ? '<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
                        : '<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
                    }
                </div>
                <div>
                    <h3 class="text-xl font-semibold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}">
                        ${isCorrect ? 'Excellente réponse !' : 'Pas tout à fait...'}
                    </h3>
                    <p class="text-gray-600">${organizedQuizData[currentQuestionIndex].explication || "Pas d'explication disponible pour cette question."}</p>
                </div>
            </div>
            <button onclick="${nextAction}" 
                    class="w-full md:w-auto px-6 py-3 rounded-lg bg-gradient-to-r ${isCorrect ? 'from-emerald-500 to-emerald-600' : 'from-violet-600 to-indigo-600'} text-white font-semibold transform transition-all duration-200 hover:scale-105 hover:shadow-lg">
                ${buttonText}
            </button>
        </div>
    `;

    quizContainer.appendChild(explanationContainer);

    // Animer l'apparition de l'explication
    setTimeout(() => {
        explanationContainer.classList.remove('translate-y-4', 'opacity-0');
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
    const timeTaken = (endTime - startTime);
    
    let message = `
        <div class="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-500">
            <div class="text-center">
                <div class="mb-8">
                    <div class="inline-block p-4 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600 mb-4">
                        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z">
                            </path>
                        </svg>
                    </div>
                    <h2 class="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Quiz terminé !</h2>
                    <div class="flex justify-center items-center space-x-8 mb-6">
                        <div class="text-center">
                            <p class="text-sm text-gray-500 uppercase tracking-wide">Score</p>
                            <p class="text-3xl font-bold text-gray-800">${score}/${organizedQuizData.length}</p>
                        </div>
                        <div class="text-center">
                            <p class="text-sm text-gray-500 uppercase tracking-wide">Temps</p>
                            <p class="text-3xl font-bold text-gray-800">${Math.floor(timeTaken / 1000 / 60)}:${(Math.floor(timeTaken / 1000) % 60).toString().padStart(2, '0')}.${(timeTaken % 1000).toString().padStart(3, '0')}</p>
                        </div>
                    </div>
                    <p class="text-lg text-gray-600">Félicitations ${playerName} !</p>
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
            <div class="mb-8 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p class="font-medium text-emerald-700">Score sauvegardé avec succès !</p>
            </div>
        `;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du leaderboard :', error);
        message += `
            <div class="mb-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p class="font-medium text-amber-700">Le score n'a pas pu être sauvegardé</p>
                <p class="text-sm text-amber-600">Pas de panique ! Vous pouvez quand même continuer à jouer.</p>
            </div>
        `;
    }

    message += `
            <div class="flex flex-col md:flex-row justify-center gap-4">
                <button onclick="startQuiz()" 
                        class="px-6 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold transform transition-all duration-200 hover:scale-105 hover:shadow-lg">
                    Rejouer
                </button>
                <a href="/pages/leaderboard.html" 
                   class="px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold transform transition-all duration-200 hover:scale-105 hover:shadow-lg text-center">
                    Voir le classement
                </a>
            </div>
        </div>
    `;

    quizContainer.innerHTML = message;
}

function startQuiz() {
    organizedQuizData = organizeQuestionsByDifficulty(quizData);
    currentQuestionIndex = 0;
    score = 0;
    startTime = Date.now();
    loadQuestion();
}

// Initialisation du quiz
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Charger les données du quiz en arrière-plan
        quizData = await fetchJSON('../quiz.json');
        console.log('Quiz data loaded successfully:', quizData);
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
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
startButton.addEventListener("click", () => {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Veuillez entrer votre nom avant de commencer");
        return;
    }

    if (!quizData || !quizData.length) {
        console.error('Quiz data not loaded:', quizData);
        quizContainer.innerHTML = `
            <div class="text-center p-8 bg-red-50 rounded-lg">
                <p class="text-red-600 font-medium">Erreur : Les données du quiz ne sont pas encore chargées</p>
                <button onclick="location.reload()" class="btn-primary mt-4">
                    Réessayer
                </button>
            </div>
        `;
        return;
    }

    console.log('Starting quiz with player:', playerName);
    startSection.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    startTime = Date.now();
    startQuiz();
});
