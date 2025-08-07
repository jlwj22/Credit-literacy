let selectedRole = '';
let userResponses = {};

// Achievement System
let userAchievements = {
    badges: [],
    lessonsCompleted: [],
    streakDays: 0,
    lastVisit: null,
    totalPoints: 0,
    currentLevel: 1
};

const achievementBadges = {
    'first-lesson': {
        id: 'first-lesson',
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🌟',
        points: 10
    },
    'budget-master': {
        id: 'budget-master',
        name: 'Budget Master',
        description: 'Complete all budgeting lessons',
        icon: '📊',
        points: 50
    },
    'credit-rookie': {
        id: 'credit-rookie',
        name: 'Credit Rookie',
        description: 'Complete your first credit lesson',
        icon: '💳',
        points: 20
    },
    'emergency-prepared': {
        id: 'emergency-prepared',
        name: 'Emergency Prepared',
        description: 'Complete the emergency fund lesson',
        icon: '🛡️',
        points: 30
    },
    'calculator-pro': {
        id: 'calculator-pro',
        name: 'Calculator Pro',
        description: 'Use 3 different financial calculators',
        icon: '🧮',
        points: 25
    },
    'streak-starter': {
        id: 'streak-starter',
        name: 'Streak Starter',
        description: 'Visit 3 days in a row',
        icon: '🔥',
        points: 15
    },
    'week-warrior': {
        id: 'week-warrior',
        name: 'Week Warrior',
        description: 'Visit 7 days in a row',
        icon: '💪',
        points: 40
    },
    'lesson-legend': {
        id: 'lesson-legend',
        name: 'Lesson Legend',
        description: 'Complete 10 lessons',
        icon: '🏆',
        points: 75
    }
};

const levelThresholds = [0, 50, 150, 300, 500, 800, 1200, 1700, 2300, 3000];

// Enhanced error handling and validation functions
function showFieldError(inputElement, message) {
    // Add error styling to input
    inputElement.classList.add('error');
    
    // Remove existing error messages
    const existingError = inputElement.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create and show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    
    // Auto-remove error after user starts typing
    const clearError = () => {
        inputElement.classList.remove('error');
        const errorMsg = inputElement.parentNode.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
        inputElement.removeEventListener('input', clearError);
    };
    inputElement.addEventListener('input', clearError);
}

function showCalculatorError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="calculator-error">⚠️ ${message}</div>`;
        container.style.display = 'block';
    }
}

function validatePositiveNumber(value, fieldName, min = 0, max = Infinity) {
    if (isNaN(value) || value === '') {
        return `Please enter ${fieldName}`;
    }
    if (value < min) {
        return `${fieldName} must be at least $${min.toLocaleString()}`;
    }
    if (value > max) {
        return `${fieldName} must be less than $${max.toLocaleString()}`;
    }
    return null; // No error
}

// Load user achievements from localStorage
function loadUserProgress() {
    const saved = localStorage.getItem('ficowise-progress');
    if (saved) {
        userAchievements = { ...userAchievements, ...JSON.parse(saved) };
    }
    updateStreakCounter();
}

// Save user achievements to localStorage
function saveUserProgress() {
    localStorage.setItem('ficowise-progress', JSON.stringify(userAchievements));
}

// Update streak counter
function updateStreakCounter() {
    const today = new Date().toDateString();
    const lastVisit = userAchievements.lastVisit;
    
    if (lastVisit) {
        const lastVisitDate = new Date(lastVisit);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate - lastVisitDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
            // Consecutive day
            userAchievements.streakDays++;
            checkStreakAchievements();
        } else if (daysDiff > 1) {
            // Streak broken
            userAchievements.streakDays = 1;
        }
        // If daysDiff === 0, same day visit, don't change streak
    } else {
        // First visit
        userAchievements.streakDays = 1;
    }
    
    userAchievements.lastVisit = today;
    saveUserProgress();
    updateStreakDisplay();
}

// Check for streak achievements
function checkStreakAchievements() {
    if (userAchievements.streakDays === 3 && !userAchievements.badges.includes('streak-starter')) {
        awardBadge('streak-starter');
    }
    if (userAchievements.streakDays === 7 && !userAchievements.badges.includes('week-warrior')) {
        awardBadge('week-warrior');
    }
}

// Award a badge to the user
function awardBadge(badgeId) {
    if (!userAchievements.badges.includes(badgeId)) {
        userAchievements.badges.push(badgeId);
        userAchievements.totalPoints += achievementBadges[badgeId].points;
        
        // Check for level up
        const newLevel = calculateLevel(userAchievements.totalPoints);
        const leveledUp = newLevel > userAchievements.currentLevel;
        userAchievements.currentLevel = newLevel;
        
        saveUserProgress();
        showAchievementNotification(badgeId, leveledUp);
        updateProgressDisplay();
    }
}

// Calculate user level based on points
function calculateLevel(points) {
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
        if (points >= levelThresholds[i]) {
            return i + 1;
        }
    }
    return 1;
}

// Show achievement notification
function showAchievementNotification(badgeId, leveledUp = false) {
    const badge = achievementBadges[badgeId];
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    
    let content = `
        <div class="achievement-content">
            <div class="achievement-icon">${badge.icon}</div>
            <div class="achievement-text">
                <h4>Achievement Unlocked!</h4>
                <p><strong>${badge.name}</strong></p>
                <p>${badge.description}</p>
                <p class="points">+${badge.points} points</p>
            </div>
        </div>
    `;
    
    if (leveledUp) {
        content += `
            <div class="level-up">
                <h4>🎉 Level Up!</h4>
                <p>You're now Level ${userAchievements.currentLevel}!</p>
            </div>
        `;
    }
    
    notification.innerHTML = content;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Update progress display in dashboard
function updateProgressDisplay() {
    // Update level display
    const levelDisplay = document.getElementById('userLevel');
    if (levelDisplay) {
        levelDisplay.textContent = `Level ${userAchievements.currentLevel}`;
    }
    
    // Update points display
    const pointsDisplay = document.getElementById('userPoints');
    if (pointsDisplay) {
        pointsDisplay.textContent = `${userAchievements.totalPoints} points`;
    }
    
    // Update progress bar
    const currentLevel = userAchievements.currentLevel;
    const currentLevelMin = levelThresholds[currentLevel - 1] || 0;
    const nextLevelMin = levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1];
    const progress = ((userAchievements.totalPoints - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
    
    const progressBar = document.getElementById('levelProgress');
    if (progressBar) {
        progressBar.style.width = Math.min(progress, 100) + '%';
    }
}

// Update streak display
function updateStreakDisplay() {
    const streakDisplay = document.getElementById('streakCounter');
    if (streakDisplay) {
        streakDisplay.innerHTML = `🔥 ${userAchievements.streakDays} day streak`;
    }
}

// Module configurations for different user roles
const roleModules = {
    highschool: [
        {
            id: 'creditBasics',
            icon: '💳',
            title: 'Credit Basics',
            description: 'Start here! Learn what credit is and why it matters for your future.',
            progress: 0
        },
        {
            id: 'budgeting',
            icon: '📊',
            title: 'Budgeting 101',
            description: 'Master money management with easy budgeting techniques for students.',
            progress: 0
        },
        {
            id: 'emergencyFund',
            icon: '🛡️',
            title: 'Emergency Fund Basics',
            description: 'Learn why you need an emergency fund and how to start building one.',
            progress: 0
        }
    ],
    recentgrad: [
        {
            id: 'creditBasics',
            icon: '💳',
            title: 'Advanced Credit Management',
            description: 'Deep dive into credit scores, reports, and building credit history.',
            progress: 0
        },
        {
            id: 'studentLoans',
            icon: '🎓',
            title: 'Student Loan Strategy',
            description: 'Navigate repayment options and strategies for your student loans.',
            progress: 0
        },
        {
            id: 'budgeting',
            icon: '📊',
            title: 'Post-Grad Budgeting',
            description: 'Create a budget that works with your new income and expenses.',
            progress: 0
        },
        {
            id: 'banking',
            icon: '🏦',
            title: 'Banking & Savings',
            description: 'Choose the right accounts and start building your emergency fund.',
            progress: 0
        },
        {
            id: 'emergencyFund',
            icon: '🛡️',
            title: 'Emergency Fund Strategy',
            description: 'Build a solid emergency fund while managing student loans and new expenses.',
            progress: 0
        }
    ],
    fulltime: [
        {
            id: 'bestPractices',
            icon: '⚡',
            title: 'Financial Best Practices',
            description: 'Advanced strategies for optimizing your finances and credit.',
            progress: 0
        },
        {
            id: 'investing',
            icon: '💰',
            title: 'Saving & Investing',
            description: 'Build wealth through smart saving and investment strategies.',
            progress: 0
        },
        {
            id: 'debtManagement',
            icon: '📉',
            title: 'Debt Management',
            description: 'Strategies to pay off debt efficiently and improve your score.',
            progress: 0
        },
        {
            id: 'retirement',
            icon: '🎯',
            title: 'Retirement Planning',
            description: 'Start planning for retirement with 401(k)s and IRAs.',
            progress: 0
        }
    ],
    parttime: [
        {
            id: 'budgeting',
            icon: '📊',
            title: 'Variable Income Budgeting',
            description: 'Budget effectively with changing income from part-time work.',
            progress: 0
        },
        {
            id: 'creditBasics',
            icon: '💳',
            title: 'Building Credit',
            description: 'Start or improve your credit with limited income.',
            progress: 0
        },
        {
            id: 'emergencyFund',
            icon: '🛡️',
            title: 'Emergency Fund Basics',
            description: 'Build a safety net even with part-time income.',
            progress: 0
        },
        {
            id: 'banking',
            icon: '🏦',
            title: 'Smart Banking',
            description: 'Find accounts with low fees and helpful features.',
            progress: 0
        }
    ],
    other: [
        {
            id: 'creditBasics',
            icon: '💳',
            title: 'Credit Fundamentals',
            description: 'Understanding credit scores and how they work.',
            progress: 0
        },
        {
            id: 'budgeting',
            icon: '📊',
            title: 'Personal Budgeting',
            description: 'Create a budget that fits your unique situation.',
            progress: 0
        },
        {
            id: 'banking',
            icon: '🏦',
            title: 'Banking Essentials',
            description: 'Choose the right financial products for your needs.',
            progress: 0
        },
        {
            id: 'emergencyFund',
            icon: '🛡️',
            title: 'Emergency Fund Planning',
            description: 'Create a personalized emergency fund strategy.',
            progress: 0
        }
    ]
};

const roleTools = {
    highschool: [
        { icon: '🎮', title: 'FICO Simulator', id: 'ficoSimulator' },
        { icon: '📝', title: 'Simple Budget Builder', id: 'budgetBuilder' },
        { icon: '🎯', title: 'Credit Quiz', id: 'creditQuiz' },
        { icon: '📚', title: 'Glossary', id: 'glossary' }
    ],
    recentgrad: [
        { icon: '🎮', title: 'FICO Simulator', id: 'ficoSimulator' },
        { icon: '📝', title: 'Budget Calculator', id: 'budgetBuilder' },
        { icon: '🎓', title: 'Loan Calculator', id: 'loanCalc' },
        { icon: '📈', title: 'Progress Tracker', id: 'progress' }
    ],
    fulltime: [
        { icon: '📊', title: 'Investment Calculator', id: 'investCalc' },
        { icon: '🎮', title: 'Advanced FICO Simulator', id: 'ficoSimulator' },
        { icon: '💰', title: 'Retirement Planner', id: 'retirement' },
        { icon: '📉', title: 'Debt Payoff Calculator', id: 'debtCalc' }
    ],
    parttime: [
        { icon: '🎮', title: 'FICO Simulator', id: 'ficoSimulator' },
        { icon: '📝', title: 'Variable Income Budget', id: 'budgetBuilder' },
        { icon: '💰', title: 'Savings Goal Tracker', id: 'savingsTracker' },
        { icon: '📈', title: 'Progress Dashboard', id: 'progress' }
    ],
    other: [
        { icon: '🎮', title: 'FICO Simulator', id: 'ficoSimulator' },
        { icon: '📝', title: 'Budget Builder', id: 'budgetBuilder' },
        { icon: '🎯', title: 'Practice Quizzes', id: 'quizzes' },
        { icon: '📈', title: 'Learning Progress', id: 'progress' }
    ]
};

function showOnboarding() {
    document.getElementById('welcomeScreen').classList.remove('active');
    document.getElementById('onboardingScreen').classList.add('active');
}

function selectRole(element, role) {
    document.querySelectorAll('.role-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selectedRole = role;
    
    document.querySelectorAll('.follow-up-questions').forEach(q => q.style.display = 'none');
    const questionsId = role + 'Questions';
    const questionsElement = document.getElementById(questionsId);
    if (questionsElement) {
        questionsElement.style.display = 'block';
    }
    
    document.getElementById('continueBtn').disabled = false;
}

function showMainDashboardView() {
    // Hide all detail views (modules and lessons)
    document.querySelectorAll('.module-detail, .lesson-detail').forEach(detail => {
        detail.classList.remove('active');
    });

    // Show the main grids
    document.getElementById('modulesGrid').style.display = 'grid';
    const toolsSection = document.querySelector('.tools-section');
    if (toolsSection) {
        toolsSection.style.display = 'block';
    }
}

function showDashboard() {
    document.getElementById('onboardingScreen').classList.remove('active');
    document.getElementById('dashboardScreen').classList.add('active');
    
    if (!selectedRole) {
        selectedRole = 'other';
    }
    
    loadModulesForRole(selectedRole);
    loadToolsForRole(selectedRole);
    loadUserProgress();
    updateProgressDisplay();
    showMainDashboardView();
}

// Function to directly access dashboard (useful for direct navigation)
function goToDashboard(role = null) {
    // Hide welcome and onboarding screens
    document.getElementById('welcomeScreen').classList.remove('active');
    document.getElementById('onboardingScreen').classList.remove('active');
    
    // Set role if provided
    if (role) {
        selectedRole = role;
    } else if (!selectedRole) {
        selectedRole = 'other';
    }
    
    showDashboard();
}

function loadModulesForRole(role) {
    const modules = roleModules[role] || roleModules.other;
    const modulesGrid = document.getElementById('modulesGrid');
    modulesGrid.innerHTML = '';
    
    modules.forEach(module => {
        const moduleCard = document.createElement('div');
        moduleCard.className = 'module-card';
        moduleCard.onclick = () => showModuleDetail(module.id);
        
        moduleCard.innerHTML = `
            <div class="module-icon">${module.icon}</div>
            <h3>${module.title}</h3>
            <p>${module.description}</p>
            <div class="module-progress">
                <div class="module-progress-fill" style="width: ${module.progress}%"></div>
            </div>
        `;
        
        modulesGrid.appendChild(moduleCard);
    });
}

function loadToolsForRole(role) {
    const tools = roleTools[role] || roleTools.other;
    const toolsGrid = document.getElementById('toolsGrid');
    if (!toolsGrid) return; 
    toolsGrid.innerHTML = '';
    
    tools.forEach(tool => {
        const toolCard = document.createElement('div');
        // Add disabled class and remove onclick functionality
        toolCard.className = 'tool-card disabled-tool';
        
        toolCard.innerHTML = `
            <div class="tool-icon">${tool.icon}</div>
            <h4>${tool.title}</h4>
        `;
        
        toolsGrid.appendChild(toolCard);
    });
}

function showModuleDetail(moduleId) {
    // Hide main grids and other detail views first
    document.getElementById('modulesGrid').style.display = 'none';
    const toolsSection = document.querySelector('.tools-section');
    if (toolsSection) toolsSection.style.display = 'none';

    document.querySelectorAll('.module-detail, .lesson-detail').forEach(detail => {
        detail.classList.remove('active');
    });
    
    const detailElement = document.getElementById(moduleId + 'Detail');
    if (detailElement) {
        detailElement.classList.add('active');
    } else {
        console.warn(`Module detail view for '${moduleId}' not found.`);
        showMainDashboardView(); // Go back if not found
    }
}

function hideModuleDetail() {
    showMainDashboardView();
}

// Lesson navigation state
let currentLessonStep = 1;
let currentLesson = '';

// Show a specific lesson
function showLesson(lessonId) {
    // Hide main grids and all other detail views
    document.getElementById('modulesGrid').style.display = 'none';
    const toolsSection = document.querySelector('.tools-section');
    if (toolsSection) toolsSection.style.display = 'none';

    document.querySelectorAll('.module-detail, .lesson-detail').forEach(detail => {
        detail.classList.remove('active');
    });
    
    const lessonElement = document.getElementById(lessonId);
    
    if (lessonElement) {
        lessonElement.classList.add('active');
        currentLesson = lessonId;
        currentLessonStep = 1;

        // Only run updateLessonDisplay for multi-step lessons
        if (lessonId !== 'whatIsCredit') {
            updateLessonDisplay();
        }
    } else {
        console.warn(`Lesson ${lessonId} not found`);
        showMainDashboardView(); // Go back to main dashboard if lesson not found
    }
}

function hideLesson() {
    // Hide the current lesson
    document.querySelectorAll('.lesson-detail').forEach(lesson => {
        lesson.classList.remove('active');
    });

    // Determine which module this lesson belongs to and show it
    let moduleToShow = 'creditBasics'; // Default
    if (currentLesson === 'whatIsCredit') {
        moduleToShow = 'creditBasics';
    }
    // Add more else-if blocks here if other lessons are added to other modules
    
    showModuleDetail(moduleToShow);
}

// Navigate to next lesson step
function nextLessonStep() {
    const lessonElement = document.getElementById(currentLesson);
    if (!lessonElement) return;
    const totalSteps = lessonElement.querySelectorAll('.lesson-step').length;
    if (currentLessonStep < totalSteps) {
        currentLessonStep++;
        updateLessonDisplay();
    }
}

// Navigate to previous lesson step
function prevLessonStep() {
    if (currentLessonStep > 1) {
        currentLessonStep--;
        updateLessonDisplay();
    }
}

// Update lesson display based on current step
function updateLessonDisplay() {
    const lessonElement = document.getElementById(currentLesson);
    if (!lessonElement) return;
    
    // Hide all lesson steps
    lessonElement.querySelectorAll('.lesson-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    const currentStepElement = lessonElement.querySelector(`[data-step="${currentLessonStep}"]`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    // Update progress indicator
    lessonElement.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 === currentLessonStep) {
            step.classList.add('active');
        } else if (index + 1 < currentLessonStep) {
            step.classList.add('completed');
        }
    });
}

// NEW: Show the "Correct!" modal for the 'What is Credit' lesson
function checkCreditDefinition() {
    const modal = document.getElementById('correctModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// NEW: Close the "Correct!" modal and mark the lesson as complete
function closeCorrectModalAndComplete() {
    const modal = document.getElementById('correctModal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Now, mark the lesson as complete
    completeLesson('whatIsCredit');
}


// Check quiz answer
function checkQuizAnswer(questionId, correctAnswer) {
    const selectedAnswer = document.querySelector(`input[name="${questionId}"]:checked`);
    const feedback = document.getElementById(`${questionId}-feedback`);
    const options = document.querySelectorAll(`input[name="${questionId}"]`);
    
    if (!selectedAnswer) {
        feedback.innerHTML = '❗ Please select an answer first.';
        feedback.className = 'quiz-feedback incorrect';
        feedback.style.display = 'block';
        return;
    }
    
    // Mark all options
    options.forEach(option => {
        const label = option.closest('.quiz-option');
        if (option.value === correctAnswer) {
            label.classList.add('correct');
        } else if (option === selectedAnswer && option.value !== correctAnswer) {
            label.classList.add('incorrect');
        }
    });
    
    if (selectedAnswer.value === correctAnswer) {
        feedback.innerHTML = '✅ Correct! Great job.';
        feedback.className = 'quiz-feedback correct';
    } else {
        feedback.innerHTML = '❌ Not quite right. Try again!';
        feedback.className = 'quiz-feedback incorrect';
    }
    feedback.style.display = 'block';
    
    // Disable the check answer button
    const button = document.querySelector(`[onclick="checkQuizAnswer('${questionId}', '${correctAnswer}')"]`);
    if (button) {
        button.disabled = true;
        button.textContent = 'Answered';
    }
}

// Complete a lesson
function completeLesson(lessonId) {
    // Mark lesson as completed
    const lessonListItem = document.querySelector(`li[onclick="showLesson('${lessonId}')"]`);
    if (lessonListItem && !lessonListItem.classList.contains('completed')) {
        lessonListItem.classList.add('completed');
        lessonListItem.innerHTML = '✅ ' + lessonListItem.innerText;
        
        // Track lesson completion for achievements
        if (!userAchievements.lessonsCompleted.includes(lessonId)) {
            userAchievements.lessonsCompleted.push(lessonId);
            
            // Check for achievements
            checkLessonAchievements(lessonId);
            
            saveUserProgress();
        }
    }
    
    // For regular lessons, show a completion message. For our new lesson, this is handled by the custom modal.
    if (lessonId !== 'whatIsCredit') {
        const lessonName = getLessonName(lessonId);
        showLessonCompletionModal(lessonName);
    }
    
    // Return to module view
    hideLesson();
}

// Get lesson name from ID
function getLessonName(lessonId) {
    const lessonNames = {
        'whatIsCredit': 'What is Credit?',
        'understandingFicoScores': 'Understanding FICO Scores',
        'scoreRanges': 'Score Ranges: What They Mean',
        'ficoFactors': '5 Factors That Affect Your Score',
        'creditVsDebit': 'Credit vs Debit Cards',
        'budgetBasics': 'Income vs Expenses',
        'firstBudget': 'Creating Your First Budget',
        'fiftyThirtyTwenty': '50/30/20 Rule Explained',
        'emergencyFundBasics': 'Emergency Fund Basics'
    };
    return lessonNames[lessonId] || 'Financial Lesson';
}

// Show lesson completion modal
function showLessonCompletionModal(lessonName) {
    const modal = document.createElement('div');
    modal.className = 'completion-modal';
    modal.innerHTML = `
        <div class="completion-content">
            <div class="completion-icon">🎉</div>
            <h3>Lesson Complete!</h3>
            <p>Congratulations! You've completed <strong>"${lessonName}"</strong></p>
            <p>Great job learning about financial literacy!</p>
            <button class="btn-continue" onclick="this.parentElement.parentElement.remove()">Continue Learning</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Auto-remove after 4 seconds if not clicked
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 4000);
}

// Check for lesson-based achievements
function checkLessonAchievements(lessonId) {
    // First lesson achievement
    if (userAchievements.lessonsCompleted.length === 1) {
        awardBadge('first-lesson');
    }
    
    // Credit rookie achievement
    if (lessonId.toLowerCase().includes('credit') && !userAchievements.badges.includes('credit-rookie')) {
        awardBadge('credit-rookie');
    }
    
    // Emergency prepared achievement
    if (lessonId === 'emergencyFundBasics' && !userAchievements.badges.includes('emergency-prepared')) {
        awardBadge('emergency-prepared');
    }
    
    // Budget master achievement (complete all budget lessons)
    const budgetLessons = ['budgetBasics', 'firstBudget', 'fiftyThirtyTwenty'];
    const completedBudgetLessons = budgetLessons.filter(lesson => 
        userAchievements.lessonsCompleted.includes(lesson)
    );
    if (completedBudgetLessons.length === budgetLessons.length && !userAchievements.badges.includes('budget-master')) {
        awardBadge('budget-master');
    }
    
    // Lesson legend achievement (10 lessons)
    if (userAchievements.lessonsCompleted.length >= 10 && !userAchievements.badges.includes('lesson-legend')) {
        awardBadge('lesson-legend');
    }
}

// Achievement Modal Functions
function showAchievements() {
    document.getElementById('achievementsModal').style.display = 'flex';
    populateAchievementsModal();
}

function hideAchievements() {
    document.getElementById('achievementsModal').style.display = 'none';
}

function populateAchievementsModal() {
    // Update overview stats
    document.getElementById('totalBadges').textContent = userAchievements.badges.length;
    document.getElementById('totalLessons').textContent = userAchievements.lessonsCompleted.length;
    document.getElementById('currentStreak').textContent = userAchievements.streakDays;
    
    // Populate achievements grid
    const achievementsGrid = document.getElementById('achievementsGrid');
    achievementsGrid.innerHTML = '';
    
    Object.values(achievementBadges).forEach(badge => {
        const isEarned = userAchievements.badges.includes(badge.id);
        const badgeElement = document.createElement('div');
        badgeElement.className = `achievement-badge ${isEarned ? 'earned' : 'locked'}`;
        
        badgeElement.innerHTML = `
            <div class="badge-icon">${isEarned ? badge.icon : '🔒'}</div>
            <div class="badge-info">
                <h4>${badge.name}</h4>
                <p>${badge.description}</p>
                <div class="badge-points">${badge.points} points</div>
            </div>
        `;
        
        achievementsGrid.appendChild(badgeElement);
    });
}

// Track calculator usage for achievements
let calculatorsUsed = new Set();

function trackCalculatorUsage(calculatorType) {
    calculatorsUsed.add(calculatorType);
    if (calculatorsUsed.size >= 3 && !userAchievements.badges.includes('calculator-pro')) {
        awardBadge('calculator-pro');
    }
}
