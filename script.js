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

function showDashboard() {
    document.getElementById('onboardingScreen').classList.remove('active');
    document.getElementById('dashboardScreen').classList.add('active');
    
    // Ensure we have a selected role, default to 'other' if not
    if (!selectedRole) {
        selectedRole = 'other';
    }
    
    loadModulesForRole(selectedRole);
    loadToolsForRole(selectedRole);
    loadUserProgress();
    updateProgressDisplay();
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
    toolsGrid.innerHTML = '';
    
    tools.forEach(tool => {
        const toolCard = document.createElement('div');
        toolCard.className = 'tool-card';
        toolCard.onclick = () => showTool(tool.id);
        
        toolCard.innerHTML = `
            <div class="tool-icon">${tool.icon}</div>
            <h4>${tool.title}</h4>
        `;
        
        toolsGrid.appendChild(toolCard);
    });
}

function showModuleDetail(moduleId) {
    document.querySelectorAll('.module-detail').forEach(detail => {
        detail.classList.remove('active');
    });
    
    const detailElement = document.getElementById(moduleId + 'Detail');
    if (detailElement) {
        detailElement.classList.add('active');
    } else {
        // If no specific detail view exists, create a generic one
        createGenericModuleDetail(moduleId);
    }
}

function createGenericModuleDetail(moduleId) {
    // Find the module configuration
    const currentRole = selectedRole || 'other';
    const modules = roleModules[currentRole] || roleModules.other;
    const module = modules.find(m => m.id === moduleId);
    
    if (!module) return;
    
    // Hide all other module details first
    document.querySelectorAll('.module-detail').forEach(detail => {
        detail.classList.remove('active');
    });
    
    // Create or show a generic module detail view
    let detailElement = document.getElementById(moduleId + 'Detail');
    
    if (!detailElement) {
        detailElement = document.createElement('div');
        detailElement.className = 'module-detail';
        detailElement.id = moduleId + 'Detail';
        
        // Generate content based on module type
        let lessonsHTML = '';
        if (moduleId === 'creditBasics') {
            lessonsHTML = `
                <ul class="lesson-list">
                    <li onclick="showLesson('whatIsCredit')">📖 What is Credit?</li>
                    <li onclick="showLesson('understandingFicoScores')">📊 Understanding FICO Scores</li>
                    <li onclick="showLesson('scoreRanges')">🎯 Score Ranges: What They Mean</li>
                    <li onclick="showLesson('ficoFactors')">📈 5 Factors That Affect Your Score</li>
                    <li onclick="showLesson('creditVsDebit')">💳 Credit vs Debit Cards</li>
                </ul>
            `;
        } else if (moduleId === 'budgeting') {
            lessonsHTML = `
                <ul class="lesson-list">
                    <li onclick="showLesson('budgetBasics')">💰 Income vs Expenses</li>
                    <li onclick="showLesson('firstBudget')">📝 Creating Your First Budget</li>
                    <li onclick="showLesson('fiftyThirtyTwenty')">🎯 50/30/20 Rule Explained</li>
                    <li onclick="simulateLessonComplete(this)">📱 Budget Tracking Tools</li>
                    <li onclick="simulateLessonComplete(this)">💡 Smart Spending Tips</li>
                </ul>
            `;
        } else if (moduleId === 'emergencyFund') {
            lessonsHTML = `
                <ul class="lesson-list">
                    <li onclick="showLesson('emergencyFundBasics')">🛡️ Emergency Fund Basics</li>
                    <li onclick="simulateLessonComplete(this)">📊 Building Your Fund Step by Step</li>
                    <li onclick="simulateLessonComplete(this)">🏦 Choosing the Right Account</li>
                    <li onclick="simulateLessonComplete(this)">🎯 Emergency Fund Challenges</li>
                </ul>
            `;
        } else {
            // Generic lesson structure for other modules
            lessonsHTML = `
                <ul class="lesson-list">
                    <li onclick="simulateLessonComplete(this)">📖 Introduction to ${module.title}</li>
                    <li onclick="simulateLessonComplete(this)">💡 Key Concepts</li>
                    <li onclick="simulateLessonComplete(this)">🎯 Practical Applications</li>
                    <li onclick="simulateLessonComplete(this)">📊 Advanced Strategies</li>
                    <li onclick="simulateLessonComplete(this)">✅ Summary and Next Steps</li>
                </ul>
            `;
        }
        
        detailElement.innerHTML = `
            <h3>${module.title} - Lessons</h3>
            ${lessonsHTML}
            <button class="btn-continue" onclick="hideModuleDetail()">Back to Dashboard</button>
        `;
        
        // Insert the new detail element after the modules grid
        const modulesGrid = document.getElementById('modulesGrid');
        modulesGrid.parentNode.insertBefore(detailElement, modulesGrid.nextSibling);
    }
    
    detailElement.classList.add('active');
}

function hideModuleDetail() {
    document.querySelectorAll('.module-detail').forEach(detail => {
        detail.classList.remove('active');
    });
}

function showTool(toolId) {
    showModuleDetail(toolId);
}

function simulateLessonComplete(element) {
    element.classList.add('completed');
    element.innerHTML = '✅ ' + element.innerHTML;
}

function updateScorePreview() {
    const scoreInput = document.getElementById('currentScore');
    const actionInput = document.getElementById('scoreAction');
    const scoreResult = document.getElementById('scoreResult');
    const newScoreElement = document.getElementById('newScore');
    const scoreChangeElement = document.getElementById('scoreChange');
    
    const currentScore = parseInt(scoreInput.value);
    const action = actionInput.value;
    
    // Clear previous errors
    scoreInput.classList.remove('error');
    
    // Validate current score
    if (isNaN(currentScore) || currentScore < 300 || currentScore > 850) {
        showFieldError(scoreInput, 'FICO scores range from 300 to 850');
        scoreResult.style.display = 'none';
        return;
    }
    
    if (!action) {
        scoreResult.style.display = 'none';
        return;
    }
    
    let newScore = currentScore;
    let change = 0;
    let explanation = '';
    
    switch(action) {
        case 'ontime':
            change = Math.floor(Math.random() * 5) + 3;
            explanation = 'On-time payments show lenders you\'re reliable and gradually improve your score.';
            break;
        case 'missed':
            change = -(Math.floor(Math.random() * 20) + 10);
            explanation = 'Missed payments can significantly damage your credit score and stay on your report for 7 years.';
            break;
        case 'newcard':
            change = -(Math.floor(Math.random() * 5) + 2);
            explanation = 'New credit applications temporarily lower your score due to hard inquiries.';
            break;
        case 'payoff':
            change = Math.floor(Math.random() * 15) + 10;
            explanation = 'Paying off debt reduces your credit utilization, which can boost your score significantly.';
            break;
        case 'highutil':
            change = -(Math.floor(Math.random() * 25) + 15);
            explanation = 'High credit utilization (>30%) is one of the biggest factors that can hurt your score.';
            break;
        case 'lowutil':
            change = Math.floor(Math.random() * 10) + 5;
            explanation = 'Keeping utilization low (<10%) shows responsible credit management and improves your score.';
            break;
    }
    
    newScore = Math.max(300, Math.min(850, currentScore + change));
    
    newScoreElement.textContent = newScore;
    scoreChangeElement.textContent = change > 0 ? `+${change}` : change.toString();
    scoreChangeElement.className = 'score-change' + (change < 0 ? ' negative' : '');
    
    // Add explanation if there's a container for it
    const explanationElement = document.getElementById('scoreExplanation');
    if (explanationElement) {
        explanationElement.textContent = explanation;
    }
    
    scoreResult.style.display = 'block';
}

// Lesson navigation state
let currentLessonStep = 1;
let currentLesson = '';

// Show a specific lesson
function showLesson(lessonId) {
    console.log('Showing lesson:', lessonId);
    
    // Hide ALL module details first
    document.querySelectorAll('.module-detail').forEach(detail => {
        detail.classList.remove('active');
        detail.style.display = 'none';
    });
    
    // Hide modules grid and tools section
    const modulesGrid = document.getElementById('modulesGrid');
    if (modulesGrid) {
        modulesGrid.style.display = 'none';
    }
    
    const toolsSection = document.querySelector('.tools-section');
    if (toolsSection) {
        toolsSection.style.display = 'none';
    }
    
    // Hide ALL lesson details first
    document.querySelectorAll('.lesson-detail').forEach(lesson => {
        lesson.classList.remove('active');
        lesson.style.display = 'none';
    });
    
    // Show the specific lesson detail view
    const lessonElement = document.getElementById(lessonId);
    console.log('Lesson element found:', !!lessonElement);
    
    if (lessonElement) {
        lessonElement.style.display = 'block';
        lessonElement.classList.add('active');
        currentLesson = lessonId;
        currentLessonStep = 1;
        updateLessonDisplay();
        console.log('Lesson displayed, current step:', currentLessonStep);
    } else {
        // If lesson doesn't exist, show an error or redirect back
        console.warn(`Lesson ${lessonId} not found`);
        // Fall back to showing the appropriate module
        if (lessonId.includes('credit')) {
            showModuleDetail('creditBasics');
        } else if (lessonId.includes('budget')) {
            showModuleDetail('budgeting');
        } else if (lessonId.includes('emergency')) {
            showModuleDetail('emergencyFund');
        } else {
            // Go back to dashboard if we can't determine the module
            hideModuleDetail();
        }
    }
}

// Hide lesson and return to module view
function hideLesson() {
    // Hide all lesson details
    document.querySelectorAll('.lesson-detail').forEach(lesson => {
        lesson.classList.remove('active');
        lesson.style.display = 'none';
    });
    
    // Show the modules grid and tools section again
    const modulesGrid = document.getElementById('modulesGrid');
    if (modulesGrid) {
        modulesGrid.style.display = 'grid';
    }
    
    const toolsSection = document.querySelector('.tools-section');
    if (toolsSection) {
        toolsSection.style.display = 'block';
    }

    // Determine which module detail to show based on the current lesson
    let moduleToShow = 'creditBasics'; // default
    
    if (currentLesson) {
        if (document.querySelector(`#creditBasicsDetail .lesson-list [onclick="showLesson('${currentLesson}')"]`)) {
            moduleToShow = 'creditBasics';
        } else if (document.querySelector(`#budgetingDetail .lesson-list [onclick="showLesson('${currentLesson}')"]`)) {
            moduleToShow = 'budgeting';
        } else if (document.querySelector(`#emergencyFundDetail .lesson-list [onclick="showLesson('${currentLesson}')"]`)) {
            moduleToShow = 'emergencyFund';
        }
    }
    
    // Show the appropriate module detail
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
    console.log('Updating lesson display for:', currentLesson, 'step:', currentLessonStep);
    
    if (!lessonElement) {
        console.warn('Lesson element not found:', currentLesson);
        return;
    }
    
    // Hide all lesson steps
    const allSteps = lessonElement.querySelectorAll('.lesson-step');
    console.log('Found lesson steps:', allSteps.length);
    
    allSteps.forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    const currentStepElement = lessonElement.querySelector(`[data-step="${currentLessonStep}"]`);
    console.log('Current step element found:', !!currentStepElement);
    
    if (currentStepElement) {
        currentStepElement.classList.add('active');
        console.log('Added active class to step:', currentLessonStep);
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
    const lessonListItem = document.querySelector(`[onclick="showLesson('${lessonId}')"]`);
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
    
    // Show completion message with achievement flair
    const lessonName = getLessonName(lessonId);
    showLessonCompletionModal(lessonName);
    
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

// 50/30/20 Rule Calculator with enhanced validation
function calculate503020() {
    const incomeInput = document.getElementById('ruleIncome');
    const income = parseFloat(incomeInput.value);
    
    // Clear previous error styling
    incomeInput.classList.remove('error');
    
    // Validation
    if (isNaN(income) || income === '') {
        showFieldError(incomeInput, 'Please enter your income amount');
        document.getElementById('ruleResults').style.display = 'none';
        return;
    }
    
    if (income < 0) {
        showFieldError(incomeInput, 'Income cannot be negative');
        document.getElementById('ruleResults').style.display = 'none';
        return;
    }
    
    if (income === 0) {
        showFieldError(incomeInput, 'Please enter an income amount greater than $0');
        document.getElementById('ruleResults').style.display = 'none';
        return;
    }
    
    if (income > 1000000) {
        showFieldError(incomeInput, 'Please enter a reasonable income amount (under $1,000,000)');
        document.getElementById('ruleResults').style.display = 'none';
        return;
    }
    
    // Calculate and display results
    const needs = (income * 0.5).toFixed(0);
    const wants = (income * 0.3).toFixed(0);
    const savings = (income * 0.2).toFixed(0);
    
    document.getElementById('needsAmount').textContent = '$' + needs;
    document.getElementById('wantsAmount').textContent = '$' + wants;
    document.getElementById('savingsAmount').textContent = '$' + savings;
    document.getElementById('ruleResults').style.display = 'block';
    
    trackCalculatorUsage('budget');
}

// Budget category builder
let budgetCategoryCount = 0;

function addBudgetCategory() {
    const categoriesSection = document.getElementById('budgetCategories');
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'budget-category';
    categoryDiv.innerHTML = `
        <input type="text" placeholder="Category name (e.g., Rent)" class="category-name">
        <input type="number" placeholder="Amount" class="category-amount" onchange="updateBudgetSummary()">
        <button onclick="removeBudgetCategory(this)" class="remove-category">×</button>
    `;
    categoriesSection.appendChild(categoryDiv);
    budgetCategoryCount++;
    updateBudgetSummary();
}

function removeBudgetCategory(button) {
    button.parentElement.remove();
    updateBudgetSummary();
}

function updateBudgetSummary() {
    const income = parseFloat(document.getElementById('budgetBuilderIncome').value) || 0;
    const categoryAmounts = document.querySelectorAll('.category-amount');
    let totalAllocated = 0;
    
    categoryAmounts.forEach(input => {
        totalAllocated += parseFloat(input.value) || 0;
    });
    
    const remaining = income - totalAllocated;
    
    document.getElementById('totalAllocated').textContent = totalAllocated.toFixed(2);
    document.getElementById('remaining').textContent = remaining.toFixed(2);
    
    if (income > 0 || totalAllocated > 0) {
        document.getElementById('budgetSummary').style.display = 'block';
    }
}

// Initialize budget calculator
document.addEventListener('DOMContentLoaded', function() {
    const budgetIncomeElement = document.getElementById('budgetIncome');
    if (budgetIncomeElement) {
        budgetIncomeElement.addEventListener('input', function() {
            const income = parseFloat(this.value) || 0;
            document.getElementById('budgetEssentials').value = (income * 0.5).toFixed(2);
            document.getElementById('budgetWants').value = (income * 0.3).toFixed(2);
            document.getElementById('budgetSavings').value = (income * 0.2).toFixed(2);
        });
    }
    
    // Initialize budget builder income listener
    const budgetBuilderIncome = document.getElementById('budgetBuilderIncome');
    if (budgetBuilderIncome) {
        budgetBuilderIncome.addEventListener('input', updateBudgetSummary);
    }
});

// Loan Calculator Functions with enhanced validation
function calculateLoan() {
    const amountInput = document.getElementById('loanAmount');
    const rateInput = document.getElementById('interestRate');
    const termInput = document.getElementById('loanTerm');
    
    const amount = parseFloat(amountInput.value);
    const yearlyRate = parseFloat(rateInput.value);
    const term = parseInt(termInput.value);
    
    // Clear previous errors
    [amountInput, rateInput, termInput].forEach(input => input.classList.remove('error'));
    
    // Validation
    let hasErrors = false;
    
    const amountError = validatePositiveNumber(amount, 'a loan amount', 100, 10000000);
    if (amountError) {
        showFieldError(amountInput, amountError);
        hasErrors = true;
    }
    
    if (isNaN(yearlyRate) || yearlyRate === '') {
        showFieldError(rateInput, 'Please enter an interest rate');
        hasErrors = true;
    } else if (yearlyRate < 0) {
        showFieldError(rateInput, 'Interest rate cannot be negative');
        hasErrors = true;
    } else if (yearlyRate > 50) {
        showFieldError(rateInput, 'Please enter a reasonable interest rate (under 50%)');
        hasErrors = true;
    }
    
    if (isNaN(term) || term === '') {
        showFieldError(termInput, 'Please select a loan term');
        hasErrors = true;
    } else if (term < 1) {
        showFieldError(termInput, 'Loan term must be at least 1 month');
        hasErrors = true;
    } else if (term > 600) {
        showFieldError(termInput, 'Loan term cannot exceed 50 years (600 months)');
        hasErrors = true;
    }
    
    if (hasErrors) {
        document.getElementById('loanResults').style.display = 'none';
        return;
    }
    
    // Calculate monthly payment using formula: M = P[r(1+r)^n]/[(1+r)^n-1]
    const monthlyRate = yearlyRate / 100 / 12;
    
    let monthlyPayment, totalPaid, totalInterest;
    
    if (monthlyRate === 0) {
        // No interest calculation
        monthlyPayment = amount / term;
        totalPaid = amount;
        totalInterest = 0;
    } else {
        monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
        totalPaid = monthlyPayment * term;
        totalInterest = totalPaid - amount;
    }
    
    // Check for calculation errors
    if (!isFinite(monthlyPayment) || monthlyPayment <= 0) {
        showCalculatorError('loanResults', 'Unable to calculate loan payment. Please check your values.');
        return;
    }
    
    document.getElementById('monthlyPayment').textContent = '$' + monthlyPayment.toFixed(2);
    document.getElementById('totalPaid').textContent = '$' + totalPaid.toFixed(2);
    document.getElementById('totalInterest').textContent = '$' + totalInterest.toFixed(2);
    
    // Generate tips based on loan details
    let tips = [];
    
    if (yearlyRate > 7) {
        tips.push('💡 Your interest rate is relatively high. Consider shopping around for better rates.');
    } else if (yearlyRate < 3) {
        tips.push('👍 Great interest rate! You\'re getting a good deal.');
    }
    
    if (term > 48) {
        tips.push('⏰ Longer terms mean lower monthly payments but more total interest paid.');
    }
    
    if (monthlyPayment > amount * 0.02) {
        tips.push('💰 Consider making extra payments to reduce total interest.');
    }
    
    if (totalInterest > 0) {
        const interestPercentage = ((totalInterest / amount) * 100).toFixed(1);
        tips.push(`📊 You'll pay ${interestPercentage}% of the loan amount in interest.`);
    } else {
        tips.push('🎉 No interest! This is a great deal.');
    }
    
    document.getElementById('loanTips').innerHTML = tips.map(tip => `<p>${tip}</p>`).join('');
    document.getElementById('loanResults').style.display = 'block';
    
    trackCalculatorUsage('loan');
}

// Debt Payoff Calculator Functions
let debtCount = 0;
let debts = [];

function addDebt() {
    debtCount++;
    const debtList = document.getElementById('debtList');
    const debtDiv = document.createElement('div');
    debtDiv.className = 'debt-item';
    debtDiv.id = 'debt-' + debtCount;
    
    debtDiv.innerHTML = `
        <div class="debt-inputs-row">
            <input type="text" placeholder="Debt name (e.g., Credit Card)" class="debt-name" data-debt-id="${debtCount}">
            <input type="number" placeholder="Balance ($)" class="debt-balance" data-debt-id="${debtCount}" onchange="updateDebtData()">
            <input type="number" placeholder="Min Payment ($)" class="debt-minimum" data-debt-id="${debtCount}" onchange="updateDebtData()">
            <input type="number" placeholder="Interest Rate (%)" class="debt-rate" data-debt-id="${debtCount}" step="0.1" onchange="updateDebtData()">
            <button onclick="removeDebt(${debtCount})" class="remove-debt">×</button>
        </div>
    `;
    
    debtList.appendChild(debtDiv);
    updateDebtData();
}

function removeDebt(debtId) {
    document.getElementById('debt-' + debtId).remove();
    debts = debts.filter(debt => debt.id !== debtId);
    updateDebtData();
}

function updateDebtData() {
    debts = [];
    const debtItems = document.querySelectorAll('.debt-item');
    let hasValidationErrors = false;
    
    debtItems.forEach(item => {
        const debtId = parseInt(item.id.split('-')[1]);
        const nameInput = item.querySelector('.debt-name');
        const balanceInput = item.querySelector('.debt-balance');
        const minimumInput = item.querySelector('.debt-minimum');
        const rateInput = item.querySelector('.debt-rate');
        
        const name = nameInput.value.trim();
        const balance = parseFloat(balanceInput.value);
        const minimum = parseFloat(minimumInput.value);
        const rate = parseFloat(rateInput.value);
        
        // Clear previous errors
        [balanceInput, minimumInput, rateInput].forEach(input => input.classList.remove('error'));
        
        // Only validate if any field has data (partial validation)
        const hasAnyData = name || !isNaN(balance) || !isNaN(minimum) || !isNaN(rate);
        
        if (hasAnyData) {
            // Validate balance
            if (isNaN(balance) || balance <= 0) {
                showFieldError(balanceInput, 'Enter debt balance > $0');
                hasValidationErrors = true;
            } else if (balance > 1000000) {
                showFieldError(balanceInput, 'Please enter reasonable amount');
                hasValidationErrors = true;
            }
            
            // Validate minimum payment
            if (isNaN(minimum) || minimum <= 0) {
                showFieldError(minimumInput, 'Enter minimum payment > $0');
                hasValidationErrors = true;
            } else if (minimum > balance) {
                showFieldError(minimumInput, 'Cannot exceed balance');
                hasValidationErrors = true;
            }
            
            // Validate interest rate
            if (isNaN(rate) || rate < 0) {
                showFieldError(rateInput, 'Enter valid interest rate');
                hasValidationErrors = true;
            } else if (rate > 50) {
                showFieldError(rateInput, 'Rate seems high (>50%)');
                hasValidationErrors = true;
            }
            
            // Only add to debts array if all validations pass
            if (!hasValidationErrors) {
                debts.push({
                    id: debtId,
                    name: name || `Debt ${debtId}`,
                    balance: balance,
                    minimum: minimum,
                    rate: rate / 100 / 12 // Convert to monthly rate
                });
            }
        }
    });
    
    if (!hasValidationErrors) {
        calculateDebtPayoff();
    } else {
        document.getElementById('debtResults').style.display = 'none';
    }
}

function calculateDebtPayoff() {
    if (debts.length === 0) {
        showCalculatorError('debtResults', 'Add at least one debt to see your payoff plan');
        return;
    }
    
    const strategyInput = document.getElementById('payoffStrategy');
    const extraPaymentInput = document.getElementById('extraPayment');
    
    const strategy = strategyInput.value;
    const extraPayment = parseFloat(extraPaymentInput.value) || 0;
    
    // Clear previous errors
    extraPaymentInput.classList.remove('error');
    
    // Validate extra payment
    if (extraPayment < 0) {
        showFieldError(extraPaymentInput, 'Extra payment cannot be negative');
        document.getElementById('debtResults').style.display = 'none';
        return;
    }
    
    if (extraPayment > 50000) {
        showFieldError(extraPaymentInput, 'Please enter a reasonable extra payment amount');
        document.getElementById('debtResults').style.display = 'none';
        return;
    }
    
    // Sort debts based on strategy
    let sortedDebts = [...debts];
    let strategyName = '';
    
    if (strategy === 'snowball') {
        sortedDebts.sort((a, b) => a.balance - b.balance); // Smallest balance first
        strategyName = 'Debt Snowball (smallest balance first)';
    } else if (strategy === 'avalanche') {
        sortedDebts.sort((a, b) => b.rate - a.rate); // Highest rate first
        strategyName = 'Debt Avalanche (highest interest first)';
    } else {
        strategyName = 'Current order';
    }
    
    // Calculate payoff plan
    const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimum, 0);
    const totalMonthlyPayment = totalMinimumPayments + extraPayment;
    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    
    // Check if minimum payments are sustainable
    if (totalMinimumPayments > 20000) {
        showCalculatorError('debtResults', 'Monthly minimum payments seem very high. Please verify your debt information.');
        return;
    }
    
    // Simplified calculation for demonstration (more accurate calculation would require iterative approach)
    let totalInterest = 0;
    let monthsToPayoff = 0;
    let weightedAvgRate = debts.reduce((sum, debt) => sum + (debt.rate * debt.balance), 0) / totalBalance;
    
    if (totalMonthlyPayment <= totalMinimumPayments) {
        monthsToPayoff = 999; // Never pays off with just minimums
        totalInterest = totalBalance * 3; // Very rough estimate
    } else if (weightedAvgRate === 0) {
        // No interest debts
        monthsToPayoff = Math.ceil(totalBalance / totalMonthlyPayment);
        totalInterest = 0;
    } else {
        // Approximate calculation using average values
        try {
            const monthlyRate = weightedAvgRate;
            const numerator = Math.log(1 + (totalBalance * monthlyRate) / totalMonthlyPayment);
            const denominator = Math.log(1 + monthlyRate);
            
            if (numerator > 0 && denominator > 0) {
                monthsToPayoff = Math.ceil(numerator / denominator);
                totalInterest = Math.max(0, (totalMonthlyPayment * monthsToPayoff) - totalBalance);
            } else {
                monthsToPayoff = 999;
                totalInterest = totalBalance * 2;
            }
        } catch (error) {
            monthsToPayoff = 999;
            totalInterest = totalBalance * 2;
        }
    }
    
    // Format and display results
    let timeDisplay = '';
    if (monthsToPayoff > 100) {
        timeDisplay = 'Very Long (10+ years)';
    } else {
        const years = Math.floor(monthsToPayoff / 12);
        const months = monthsToPayoff % 12;
        if (years > 0) {
            timeDisplay = `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} months` : ''}`;
        } else {
            timeDisplay = `${monthsToPayoff} month${monthsToPayoff !== 1 ? 's' : ''}`;
        }
    }
    
    document.getElementById('payoffTime').textContent = timeDisplay;
    document.getElementById('debtTotalInterest').textContent = '$' + totalInterest.toFixed(2);
    document.getElementById('totalMonthlyPayment').textContent = '$' + totalMonthlyPayment.toFixed(2);
    
    // Show payoff order with strategy explanation
    const payoffOrder = document.getElementById('payoffOrder');
    const orderList = sortedDebts.map((debt, index) => {
        const yearlyRate = (debt.rate * 12 * 100).toFixed(1);
        return `<div class="payoff-item">
            <strong>${index + 1}. ${debt.name}</strong><br>
            Balance: $${debt.balance.toLocaleString()} | Rate: ${yearlyRate}% | Min: $${debt.minimum.toFixed(2)}
        </div>`;
    }).join('');
    
    let strategyTip = '';
    if (strategy === 'snowball') {
        strategyTip = '<p class="strategy-tip">💡 <strong>Snowball Strategy:</strong> Pay minimums on all debts, then put extra money toward the smallest balance. This builds momentum and motivation!</p>';
    } else if (strategy === 'avalanche') {
        strategyTip = '<p class="strategy-tip">💡 <strong>Avalanche Strategy:</strong> Pay minimums on all debts, then put extra money toward the highest interest rate. This saves the most money!</p>';
    }
    
    payoffOrder.innerHTML = `
        <h5>${strategyName}</h5>
        ${strategyTip}
        ${orderList}
    `;
    
    // Add helpful tips
    let tips = [];
    if (extraPayment === 0) {
        tips.push('💰 Adding even $25-50 extra per month can significantly reduce your payoff time!');
    }
    if (monthsToPayoff > 60) {
        tips.push('⏰ Consider the debt avalanche method to save more on interest.');
    }
    if (totalInterest > totalBalance * 0.5) {
        tips.push('🎯 Focus on increasing monthly payments to reduce total interest paid.');
    }
    
    if (tips.length > 0) {
        payoffOrder.innerHTML += '<div class="debt-tips">' + tips.map(tip => `<p>${tip}</p>`).join('') + '</div>';
    }
    
    document.getElementById('debtResults').style.display = 'block';
    
    trackCalculatorUsage('debt');
}

// Emergency Fund Calculator Functions
function calculateEmergencyFund() {
    const expenses = parseFloat(document.getElementById('monthlyExpenses').value);
    const months = parseFloat(document.getElementById('targetMonths').value);
    
    if (expenses && months) {
        const target = expenses * months;
        document.getElementById('fundTarget').textContent = '$' + target.toLocaleString();
        document.getElementById('emergencyFundResult').style.display = 'block';
        
        trackCalculatorUsage('emergency');
    } else {
        document.getElementById('emergencyFundResult').style.display = 'none';
    }
}

function calculateSavingsPlan() {
    const target = parseFloat(document.getElementById('targetAmount').value);
    const monthly = parseFloat(document.getElementById('monthlySavings').value);
    
    if (target && monthly && monthly > 0) {
        const months = Math.ceil(target / monthly);
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        
        let timeText = '';
        if (years > 0) {
            timeText = `${years} year${years > 1 ? 's' : ''}`;
            if (remainingMonths > 0) {
                timeText += ` and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
            }
        } else {
            timeText = `${months} month${months > 1 ? 's' : ''}`;
        }
        
        document.getElementById('timeToGoal').textContent = timeText;
        
        // Encouragement based on timeline
        let encouragement = '';
        if (months <= 12) {
            encouragement = 'You can reach your goal in less than a year! That\'s fantastic progress.';
        } else if (months <= 24) {
            encouragement = 'Building an emergency fund takes time, but you\'re on a great path!';
        } else {
            encouragement = 'Every dollar counts. Consider increasing your monthly savings if possible.';
        }
        
        document.getElementById('encouragementText').textContent = encouragement;
        document.getElementById('savingsPlanResult').style.display = 'block';
    } else {
        document.getElementById('savingsPlanResult').style.display = 'none';
    }
}

function updateEmergencyFundCalculator() {
    const expenses = parseFloat(document.getElementById('efMonthlyExpenses').value) || 0;
    const current = parseFloat(document.getElementById('efCurrentAmount').value) || 0;
    const monthly = parseFloat(document.getElementById('efMonthlySavings').value) || 0;
    
    if (expenses > 0) {
        const sixMonthTarget = expenses * 6;
        const currentMonths = current / expenses;
        
        // Status calculation
        let status = '';
        let statusColor = '';
        
        if (currentMonths >= 6) {
            status = `✅ Excellent! You have ${currentMonths.toFixed(1)} months of expenses saved.`;
            statusColor = 'success';
        } else if (currentMonths >= 3) {
            status = `💪 Good progress! You have ${currentMonths.toFixed(1)} months saved. Keep going!`;
            statusColor = 'progress';
        } else if (current >= 1000) {
            status = `🌱 Great start! You have $${current.toLocaleString()} saved.`;
            statusColor = 'starter';
        } else if (current > 0) {
            status = `🎯 You're on your way! Keep building from $${current.toLocaleString()}.`;
            statusColor = 'building';
        } else {
            status = `🚀 Ready to start! Your 6-month target is $${sixMonthTarget.toLocaleString()}.`;
            statusColor = 'start';
        }
        
        document.getElementById('efStatus').textContent = status;
        document.getElementById('efStatus').className = statusColor;
        
        // Timeline calculation if savings amount provided
        if (monthly > 0 && current < sixMonthTarget) {
            const remaining = sixMonthTarget - current;
            const monthsToTarget = Math.ceil(remaining / monthly);
            const years = Math.floor(monthsToTarget / 12);
            const months = monthsToTarget % 12;
            
            let timelineText = '';
            if (years > 0) {
                timelineText = `${years} year${years > 1 ? 's' : ''}`;
                if (months > 0) {
                    timelineText += ` and ${months} month${months !== 1 ? 's' : ''}`;
                }
            } else {
                timelineText = `${monthsToTarget} month${monthsToTarget > 1 ? 's' : ''}`;
            }
            
            document.getElementById('efTimeline').textContent = `${timelineText} at $${monthly}/month`;
        } else if (current >= sixMonthTarget) {
            document.getElementById('efTimeline').textContent = '🎉 Goal achieved!';
        } else {
            document.getElementById('efTimeline').textContent = 'Enter monthly savings amount to see timeline';
        }
        
        document.getElementById('efResults').style.display = 'block';
    } else {
        document.getElementById('efResults').style.display = 'none';
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

// Credit Utilization Calculator with enhanced validation
function calculateUtilization() {
    const balanceInput = document.getElementById('cardBalance');
    const limitInput = document.getElementById('creditLimit');
    
    const balance = parseFloat(balanceInput.value);
    const limit = parseFloat(limitInput.value);
    
    // Clear previous errors
    [balanceInput, limitInput].forEach(input => input.classList.remove('error'));
    
    // Validation
    let hasErrors = false;
    
    if (isNaN(balance) || balance === '') {
        showFieldError(balanceInput, 'Please enter your current balance');
        hasErrors = true;
    } else if (balance < 0) {
        showFieldError(balanceInput, 'Balance cannot be negative');
        hasErrors = true;
    } else if (balance > 100000) {
        showFieldError(balanceInput, 'Please enter a reasonable balance amount');
        hasErrors = true;
    }
    
    if (isNaN(limit) || limit === '') {
        showFieldError(limitInput, 'Please enter your credit limit');
        hasErrors = true;
    } else if (limit <= 0) {
        showFieldError(limitInput, 'Credit limit must be greater than $0');
        hasErrors = true;
    } else if (limit > 100000) {
        showFieldError(limitInput, 'Please enter a reasonable credit limit');
        hasErrors = true;
    }
    
    if (hasErrors) {
        document.getElementById('utilPercentage').textContent = '-%';
        document.getElementById('utilStatus').textContent = '';
        return;
    }
    
    // Check if balance exceeds limit
    if (balance > limit) {
        document.getElementById('utilPercentage').textContent = 'Over Limit';
        const statusElement = document.getElementById('utilStatus');
        statusElement.textContent = '🚨 Balance exceeds credit limit! This will severely impact your credit score.';
        statusElement.className = 'over-limit';
        trackCalculatorUsage('utilization');
        return;
    }
    
    const utilization = (balance / limit) * 100;
    document.getElementById('utilPercentage').textContent = utilization.toFixed(1) + '%';
    
    let status = '';
    let statusClass = '';
    let advice = '';
    
    if (utilization === 0) {
        status = '🎉 Perfect - No balance!';
        statusClass = 'perfect';
        advice = 'Great job keeping a zero balance! This is ideal for your credit score.';
    } else if (utilization <= 10) {
        status = '🌟 Excellent - Keep it up!';
        statusClass = 'excellent';
        advice = 'You\'re in the optimal range. Credit experts recommend keeping utilization under 10%.';
    } else if (utilization <= 30) {
        status = '✅ Good - Still in acceptable range';
        statusClass = 'good';
        advice = 'This is still considered good, but try to get below 10% for the best credit score impact.';
    } else if (utilization <= 50) {
        status = '⚠️ Fair - Consider paying down balances';
        statusClass = 'fair';
        advice = `Consider paying down $${((balance - limit * 0.3)).toFixed(2)} to get into the good range.`;
    } else if (utilization <= 90) {
        status = '❌ Poor - Focus on paying down debt';
        statusClass = 'poor';
        advice = `Pay down $${((balance - limit * 0.3)).toFixed(2)} to improve your credit utilization significantly.`;
    } else {
        status = '🚨 Very Poor - Urgent action needed';
        statusClass = 'very-poor';
        advice = 'High utilization significantly hurts your credit score. Make debt payoff a priority.';
    }
    
    const statusElement = document.getElementById('utilStatus');
    statusElement.innerHTML = `<div class="status-text">${status}</div><div class="advice-text">${advice}</div>`;
    statusElement.className = statusClass;
    
    trackCalculatorUsage('utilization');
}

// Emergency Fund Calculator
function calculateEmergencyFund() {
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value) || 0;
    const targetMonths = parseFloat(document.getElementById('targetMonths').value) || 0;
    
    if (monthlyExpenses === 0 || targetMonths === 0) {
        document.getElementById('emergencyFundResult').style.display = 'none';
        return;
    }
    
    const targetAmount = monthlyExpenses * targetMonths;
    document.getElementById('fundTarget').textContent = '$' + targetAmount.toLocaleString();
    document.getElementById('emergencyFundResult').style.display = 'block';
    
    trackCalculatorUsage('emergency-fund');
}

// Savings Plan Calculator
function calculateSavingsPlan() {
    const targetAmount = parseFloat(document.getElementById('targetAmount').value) || 0;
    const monthlySavings = parseFloat(document.getElementById('monthlySavings').value) || 0;
    
    if (targetAmount === 0 || monthlySavings === 0) {
        document.getElementById('savingsPlanResult').style.display = 'none';
        return;
    }
    
    const monthsToGoal = Math.ceil(targetAmount / monthlySavings);
    document.getElementById('timeToGoal').textContent = monthsToGoal + ' months';
    
    let encouragement = '';
    if (monthsToGoal <= 6) {
        encouragement = 'You\'ll reach your goal quickly!';
    } else if (monthsToGoal <= 12) {
        encouragement = 'Great progress - less than a year to go!';
    } else if (monthsToGoal <= 24) {
        encouragement = 'Steady progress will get you there!';
    } else {
        encouragement = 'Consider increasing your monthly savings if possible.';
    }
    
    document.getElementById('encouragementText').textContent = encouragement;
    document.getElementById('savingsPlanResult').style.display = 'block';
    
    trackCalculatorUsage('savings-plan');
}

// Emergency Fund Detail Calculator with enhanced validation
function updateEmergencyFundCalculator() {
    const expensesInput = document.getElementById('efMonthlyExpenses');
    const currentInput = document.getElementById('efCurrentAmount');
    const savingsInput = document.getElementById('efMonthlySavings');
    
    const monthlyExpenses = parseFloat(expensesInput.value);
    const currentAmount = parseFloat(currentInput.value) || 0;
    const monthlySavings = parseFloat(savingsInput.value) || 0;
    
    // Clear previous errors
    [expensesInput, currentInput, savingsInput].forEach(input => input.classList.remove('error'));
    
    // Validation for required field
    if (isNaN(monthlyExpenses) || monthlyExpenses === '') {
        showFieldError(expensesInput, 'Please enter your monthly expenses');
        document.getElementById('efResults').style.display = 'none';
        return;
    }
    
    if (monthlyExpenses <= 0) {
        showFieldError(expensesInput, 'Monthly expenses must be greater than $0');
        document.getElementById('efResults').style.display = 'none';
        return;
    }
    
    if (monthlyExpenses > 50000) {
        showFieldError(expensesInput, 'Please enter a reasonable monthly expense amount');
        document.getElementById('efResults').style.display = 'none';
        return;
    }
    
    // Validate current amount (optional but if provided, must be reasonable)
    if (currentAmount < 0) {
        showFieldError(currentInput, 'Current savings cannot be negative');
        document.getElementById('efResults').style.display = 'none';
        return;
    }
    
    if (currentAmount > 1000000) {
        showFieldError(currentInput, 'Please enter a reasonable current savings amount');
        document.getElementById('efResults').style.display = 'none';
        return;
    }
    
    // Validate monthly savings (optional but if provided, must be reasonable)
    if (monthlySavings < 0) {
        showFieldError(savingsInput, 'Monthly savings cannot be negative');
        document.getElementById('efResults').style.display = 'none';
        return;
    }
    
    if (monthlySavings > 20000) {
        showFieldError(savingsInput, 'Please enter a reasonable monthly savings amount');
        document.getElementById('efResults').style.display = 'none';
        return;
    }
    
    const targetAmount = monthlyExpenses * 6; // 6-month emergency fund
    const remaining = Math.max(0, targetAmount - currentAmount);
    const monthsCovered = currentAmount / monthlyExpenses;
    
    // Calculate status with more detailed feedback
    let status = '';
    let statusClass = '';
    
    if (currentAmount >= targetAmount) {
        status = `🎉 Fully Funded! You have ${monthsCovered.toFixed(1)} months of expenses saved. Consider investing additional funds.`;
        statusClass = 'excellent';
    } else if (currentAmount >= monthlyExpenses * 3) {
        status = `✅ Good Progress! You have ${monthsCovered.toFixed(1)} months covered. Keep building to reach 6 months.`;
        statusClass = 'good';
    } else if (currentAmount >= monthlyExpenses) {
        status = `📈 Getting Started! You have ${monthsCovered.toFixed(1)} months covered. You're on the right track!`;
        statusClass = 'fair';
    } else if (currentAmount > 0) {
        status = `🌱 Building Your Fund! You have $${currentAmount.toLocaleString()} saved. Every dollar counts!`;
        statusClass = 'building';
    } else {
        status = `🚀 Just Beginning! Your 6-month goal is $${targetAmount.toLocaleString()}. Start with any amount you can.`;
        statusClass = 'start';
    }
    
    const statusElement = document.getElementById('efStatus');
    statusElement.textContent = status;
    statusElement.className = statusClass;
    
    // Calculate timeline with better messaging
    let timeline = '';
    if (remaining === 0) {
        timeline = '🎉 Goal achieved! Consider setting up automatic investing for additional savings.';
    } else if (monthlySavings > 0) {
        const monthsRemaining = Math.ceil(remaining / monthlySavings);
        const years = Math.floor(monthsRemaining / 12);
        const months = monthsRemaining % 12;
        
        if (years > 0) {
            timeline = `${years} year${years > 1 ? 's' : ''} and ${months} month${months !== 1 ? 's' : ''} at $${monthlySavings.toLocaleString()}/month`;
        } else {
            timeline = `${monthsRemaining} month${monthsRemaining !== 1 ? 's' : ''} at $${monthlySavings.toLocaleString()}/month`;
        }
        
        // Add encouragement based on timeline
        if (monthsRemaining <= 12) {
            timeline += ' - You can do this within a year! 💪';
        } else if (monthsRemaining <= 24) {
            timeline += ' - Steady progress will get you there! 📈';
        } else {
            timeline += ' - Consider increasing savings if possible 🎯';
        }
    } else {
        timeline = 'Enter monthly savings amount to see your timeline to financial security';
    }
    
    document.getElementById('efTimeline').textContent = timeline;
    document.getElementById('efResults').style.display = 'block';
    
    trackCalculatorUsage('emergency-fund-detail');
}
