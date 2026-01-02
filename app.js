// State management
let calorieGoal = 2000;
let foodItems = [];

// DOM elements
const calorieGoalInput = document.getElementById('calorie-goal');
const setGoalBtn = document.getElementById('set-goal-btn');
const foodNameInput = document.getElementById('food-name');
const foodCaloriesInput = document.getElementById('food-calories');
const addFoodBtn = document.getElementById('add-food-btn');
const foodList = document.getElementById('food-list');
const clearAllBtn = document.getElementById('clear-all-btn');
const caloriesConsumed = document.querySelector('.calories-consumed');
const caloriesGoalDisplay = document.querySelector('.calories-goal');
const progressFill = document.querySelector('.progress-fill');
const remainingDisplay = document.getElementById('remaining');

// Initialize app
function init() {
    loadFromLocalStorage();
    updateDisplay();
    attachEventListeners();
}

// Event listeners
function attachEventListeners() {
    setGoalBtn.addEventListener('click', setGoal);
    addFoodBtn.addEventListener('click', addFood);
    clearAllBtn.addEventListener('click', clearAll);
    
    // Allow Enter key to add food
    foodNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addFood();
    });
    foodCaloriesInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addFood();
    });
}

// Set calorie goal
function setGoal() {
    const newGoal = parseInt(calorieGoalInput.value);
    if (newGoal && newGoal > 0) {
        calorieGoal = newGoal;
        calorieGoalInput.value = '';
        saveToLocalStorage();
        updateDisplay();
    }
}

// Add food item
function addFood() {
    const name = foodNameInput.value.trim();
    const calories = parseInt(foodCaloriesInput.value);

    if (name && calories && calories >= 0) {
        const foodItem = {
            id: Date.now(),
            name: name,
            calories: calories
        };
        
        foodItems.push(foodItem);
        foodNameInput.value = '';
        foodCaloriesInput.value = '';
        foodNameInput.focus();
        
        saveToLocalStorage();
        updateDisplay();
    }
}

// Delete food item
function deleteFood(id) {
    foodItems = foodItems.filter(item => item.id !== id);
    saveToLocalStorage();
    updateDisplay();
}

// Clear all food items
function clearAll() {
    if (foodItems.length > 0 && confirm('Are you sure you want to clear all food items?')) {
        foodItems = [];
        saveToLocalStorage();
        updateDisplay();
    }
}

// Update display
function updateDisplay() {
    const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);
    const remaining = calorieGoal - totalCalories;
    const percentage = Math.min((totalCalories / calorieGoal) * 100, 100);

    // Update calories display
    caloriesConsumed.textContent = totalCalories;
    caloriesGoalDisplay.textContent = calorieGoal;
    remainingDisplay.textContent = remaining;

    // Update progress bar
    progressFill.style.width = `${percentage}%`;

    // Change color if over goal
    if (totalCalories > calorieGoal) {
        progressFill.style.background = '#dc3545';
        remainingDisplay.textContent = `${Math.abs(remaining)} over goal`;
        remainingDisplay.style.color = '#dc3545';
    } else {
        progressFill.style.background = 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)';
        remainingDisplay.style.color = '#666';
    }

    // Update food list
    renderFoodList();
}

// Render food list
function renderFoodList() {
    if (foodItems.length === 0) {
        foodList.innerHTML = '<li class="empty-state">No food items added yet</li>';
        return;
    }

    foodList.innerHTML = foodItems.map(item => `
        <li>
            <div class="food-info">
                <span class="food-name">${item.name}</span>
                <span class="food-calories">${item.calories} cal</span>
            </div>
            <button class="delete-btn" onclick="deleteFood(${item.id})">Delete</button>
        </li>
    `).join('');
}

// Local storage functions
function saveToLocalStorage() {
    localStorage.setItem('calorieGoal', calorieGoal);
    localStorage.setItem('foodItems', JSON.stringify(foodItems));
}

function loadFromLocalStorage() {
    const savedGoal = localStorage.getItem('calorieGoal');
    const savedItems = localStorage.getItem('foodItems');

    if (savedGoal) {
        calorieGoal = parseInt(savedGoal);
    }

    if (savedItems) {
        foodItems = JSON.parse(savedItems);
    }
}

// Initialize the app when DOM is loaded
init();

