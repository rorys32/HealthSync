// HealthSync Version 1.1.015 - Data Management
const today = new Date().toISOString().split('T')[0];
let userDailyData = JSON.parse(localStorage.getItem('userDailyData')) || {};
let supplements = JSON.parse(localStorage.getItem('supplements')) || [];
let foods = JSON.parse(localStorage.getItem('foods')) || [];

if (!userDailyData[today]) {
    userDailyData[today] = { 
        steps: 0, 
        water: 0, 
        weight: null, 
        bloodPressure: null, 
        log: [], 
        exercises: [], 
        stepsLog: [], 
        moods: [], 
        symptoms: [] 
    };
}

function saveData() {
    localStorage.setItem('userDailyData', JSON.stringify(userDailyData));
    localStorage.setItem('supplements', JSON.stringify(supplements));
    localStorage.setItem('foods', JSON.stringify(foods));
}

function estimateCalories(food) {
    const calorieMap = { 'Oatmeal': 150, 'Mixed Fruit': 180, 'Coffee': 5 };
    return calorieMap[food] || 100;
}