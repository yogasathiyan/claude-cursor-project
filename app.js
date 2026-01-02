// State management
let calorieGoal = 1900;
let totalCalories = 0;
let exerciseCalories = 0;
let steps = 0;
let water = 0;
let notes = '';

let mealData = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 0
};

let foodItems = [];

// Weekly data (last 7 days + today)
let weeklyData = [
    { day: 'We', date: 17, calories: 1750, goal: 1900 },
    { day: 'Th', date: 18, calories: 1820, goal: 1900 },
    { day: 'Fr', date: 19, calories: 2100, goal: 1900 },
    { day: 'Sa', date: 20, calories: 2250, goal: 1900 },
    { day: 'Su', date: 21, calories: 1650, goal: 1900 },
    { day: 'Mo', date: 22, calories: 1780, goal: 1900 },
    { day: 'Tu', date: 23, calories: 1890, goal: 1900 },
    { day: 'We', date: 24, calories: 0, goal: 1900 }  // Today
];

// Initialize app
function init() {
    loadFromLocalStorage();
    updateAllDisplays();
    renderWeeklyChart();
    renderFoodLog();
}

// Update all displays
function updateAllDisplays() {
    updateBudgetDisplay();
    updateMealDisplays();
    updateMetricsDisplay();
    updateProgressRing();
    updateAnalysis();
    updateStatsDisplay();
    renderWeeklyChart();
    renderFoodLog();
}

// Update budget display
function updateBudgetDisplay() {
    document.getElementById('budget-display').textContent = calorieGoal.toLocaleString();
    document.getElementById('calories-consumed').textContent = totalCalories.toLocaleString();
    
    const remaining = calorieGoal - totalCalories;
    document.getElementById('calories-left').textContent = Math.abs(remaining).toLocaleString();
}

// Update stats display
function updateStatsDisplay() {
    document.getElementById('stat-consumed').textContent = totalCalories.toLocaleString();
    document.getElementById('stat-goal').textContent = calorieGoal.toLocaleString();
    const remaining = calorieGoal - totalCalories;
    document.getElementById('stat-remaining').textContent = remaining.toLocaleString();
}

// Update meal displays
function updateMealDisplays() {
    document.getElementById('breakfast-value').textContent = mealData.breakfast;
    document.getElementById('lunch-value').textContent = mealData.lunch;
    document.getElementById('dinner-value').textContent = mealData.dinner;
    document.getElementById('snacks-value').textContent = mealData.snacks;
}

// Update metrics display
function updateMetricsDisplay() {
    document.getElementById('exercise-value').textContent = exerciseCalories;
    document.getElementById('steps-value').textContent = formatSteps(steps);
    document.getElementById('water-value').textContent = water;
}

// Format steps (8000 -> 8k)
function formatSteps(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num;
}

// Update Apple Progress Ring
function updateProgressRing() {
    const ring = document.getElementById('progress-ring');
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    
    const percentage = Math.min((totalCalories / calorieGoal) * 100, 100);
    const offset = circumference - (percentage / 100) * circumference;
    
    ring.style.strokeDashoffset = offset;
    
    // Change color based on status
    if (totalCalories > calorieGoal) {
        ring.setAttribute('stroke', '#FF3B30'); // Red if over
    } else if (totalCalories > calorieGoal * 0.9) {
        ring.setAttribute('stroke', '#FFCC00'); // Yellow if close
    } else {
        ring.setAttribute('stroke', '#4CD964'); // Green if good
    }
}

// Update Analysis
function updateAnalysis() {
    const statusElement = document.getElementById('analysis-status');
    const detailsElement = document.getElementById('analysis-details');
    const remaining = calorieGoal - totalCalories;
    
    if (totalCalories === 0) {
        statusElement.textContent = 'Not Started';
        statusElement.className = 'analysis-status-large';
        detailsElement.textContent = 'Start tracking your meals to see your progress.';
    } else if (totalCalories <= calorieGoal * 0.8) {
        statusElement.textContent = 'On Track';
        statusElement.className = 'analysis-status-large';
        detailsElement.textContent = `You're doing great! You have ${remaining} calories remaining for today.`;
    } else if (totalCalories <= calorieGoal * 0.95) {
        statusElement.textContent = 'On Target';
        statusElement.className = 'analysis-status-large';
        detailsElement.textContent = `Excellent progress! ${remaining} calories left to reach your goal.`;
    } else if (totalCalories <= calorieGoal) {
        statusElement.textContent = 'Nearly There';
        statusElement.className = 'analysis-status-large';
        detailsElement.textContent = `Almost at your goal! Only ${remaining} calories remaining.`;
    } else {
        statusElement.textContent = 'Over Budget';
        statusElement.className = 'analysis-status-large over';
        detailsElement.textContent = `You've exceeded your goal by ${Math.abs(remaining)} calories. Try some exercise!`;
    }
}

// Render Weekly Chart
function renderWeeklyChart() {
    const container = document.getElementById('weekly-bars');
    container.innerHTML = '';
    
    const maxCalories = Math.max(...weeklyData.map(d => d.calories), calorieGoal);
    
    weeklyData.forEach((day, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        
        // Set height based on calories (percentage of container)
        const height = (day.calories / maxCalories) * 100;
        bar.style.height = height + '%';
        
        // Color based on whether over budget
        if (day.calories > day.goal) {
            bar.classList.add('over-budget');
        }
        
        // Add tooltip
        bar.title = `${day.day} ${day.date}: ${day.calories} cal`;
        
        container.appendChild(bar);
    });
}

// Render Food Log
function renderFoodLog() {
    const container = document.getElementById('food-log');
    
    if (foodItems.length === 0) {
        container.innerHTML = `
            <div class="empty-log">
                <p>No food items logged yet today.</p>
                <p class="empty-subtext">Click "+ Add Food" to get started</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = foodItems.map(item => `
        <div class="food-item">
            <div class="food-item-info">
                <span class="food-meal-badge">${item.meal}</span>
                <span class="food-name">${item.name}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <span class="food-calories">${item.calories} cal</span>
                <button class="delete-food-btn" onclick="deleteFoodItem(${item.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Delete food item
function deleteFoodItem(id) {
    const item = foodItems.find(f => f.id === id);
    if (item) {
        mealData[item.meal] -= item.calories;
        totalCalories -= item.calories;
        foodItems = foodItems.filter(f => f.id !== id);
        
        // Update today's data in weekly chart
        weeklyData[7].calories = totalCalories;
        
        saveToLocalStorage();
        updateAllDisplays();
    }
}

// Modal functions
function openAddModal() {
    document.getElementById('addModal').style.display = 'block';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('food-name').value = '';
    document.getElementById('food-calories').value = '';
}

function openQuickMetrics() {
    document.getElementById('metricsModal').style.display = 'block';
    // Pre-fill current values
    document.getElementById('exercise-input').value = exerciseCalories;
    document.getElementById('steps-input').value = steps;
    document.getElementById('water-input').value = water;
}

function closeQuickMetrics() {
    document.getElementById('metricsModal').style.display = 'none';
}

function openSettings() {
    document.getElementById('settingsModal').style.display = 'block';
    document.getElementById('calorie-goal-input').value = calorieGoal;
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Add food
function addFood() {
    const mealType = document.getElementById('meal-type').value;
    const name = document.getElementById('food-name').value.trim();
    const calories = parseInt(document.getElementById('food-calories').value);
    
    if (name && calories && calories > 0) {
        const foodItem = {
            id: Date.now(),
            name: name,
            calories: calories,
            meal: mealType
        };
        
        foodItems.push(foodItem);
        mealData[mealType] += calories;
        totalCalories += calories;
        
        // Update today's data in weekly chart
        weeklyData[7].calories = totalCalories;
        
        saveToLocalStorage();
        updateAllDisplays();
        closeAddModal();
    }
}

// Update metrics
function updateMetrics() {
    const exerciseInput = parseInt(document.getElementById('exercise-input').value) || 0;
    const stepsInput = parseInt(document.getElementById('steps-input').value) || 0;
    const waterInput = parseInt(document.getElementById('water-input').value) || 0;
    
    exerciseCalories = exerciseInput;
    steps = stepsInput;
    water = waterInput;
    
    saveToLocalStorage();
    updateAllDisplays();
    closeQuickMetrics();
}

// Update goal
function updateGoal() {
    const newGoal = parseInt(document.getElementById('calorie-goal-input').value);
    
    if (newGoal && newGoal > 0) {
        calorieGoal = newGoal;
        
        // Update all weekly data goals
        weeklyData.forEach(day => day.goal = newGoal);
        
        saveToLocalStorage();
        updateAllDisplays();
        closeSettings();
    }
}

// Save notes
function saveNotes() {
    const notesText = document.getElementById('notes-text').value;
    notes = notesText;
    saveToLocalStorage();
    alert('Notes saved successfully!');
}

// Reset today's data
function resetDay() {
    if (confirm('Are you sure you want to reset today\'s data?')) {
        totalCalories = 0;
        exerciseCalories = 0;
        steps = 0;
        water = 0;
        mealData = {
            breakfast: 0,
            lunch: 0,
            dinner: 0,
            snacks: 0
        };
        foodItems = [];
        weeklyData[7].calories = 0;
        
        saveToLocalStorage();
        updateAllDisplays();
    }
}

// Local storage functions
function saveToLocalStorage() {
    localStorage.setItem('calorieGoal', calorieGoal);
    localStorage.setItem('totalCalories', totalCalories);
    localStorage.setItem('exerciseCalories', exerciseCalories);
    localStorage.setItem('steps', steps);
    localStorage.setItem('water', water);
    localStorage.setItem('notes', notes);
    localStorage.setItem('mealData', JSON.stringify(mealData));
    localStorage.setItem('foodItems', JSON.stringify(foodItems));
    localStorage.setItem('weeklyData', JSON.stringify(weeklyData));
}

function loadFromLocalStorage() {
    const savedGoal = localStorage.getItem('calorieGoal');
    const savedTotal = localStorage.getItem('totalCalories');
    const savedExercise = localStorage.getItem('exerciseCalories');
    const savedSteps = localStorage.getItem('steps');
    const savedWater = localStorage.getItem('water');
    const savedNotes = localStorage.getItem('notes');
    const savedMealData = localStorage.getItem('mealData');
    const savedFoodItems = localStorage.getItem('foodItems');
    const savedWeeklyData = localStorage.getItem('weeklyData');
    
    if (savedGoal) calorieGoal = parseInt(savedGoal);
    if (savedTotal) totalCalories = parseInt(savedTotal);
    if (savedExercise) exerciseCalories = parseInt(savedExercise);
    if (savedSteps) steps = parseInt(savedSteps);
    if (savedWater) water = parseInt(savedWater);
    if (savedNotes) {
        notes = savedNotes;
        document.getElementById('notes-text').value = notes;
    }
    if (savedMealData) mealData = JSON.parse(savedMealData);
    if (savedFoodItems) foodItems = JSON.parse(savedFoodItems);
    if (savedWeeklyData) {
        weeklyData = JSON.parse(savedWeeklyData);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
