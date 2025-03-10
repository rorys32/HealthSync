// HealthSync Version 1.2.000 - Data Management
const today = new Date().toISOString().split('T')[0];
let userDailyData = {};
let supplements = [];
let foods = [];
let token = null;

async function fetchData() {
    const response = await fetch('/api/data', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
        const data = await response.json();
        userDailyData = data.userDailyData;
        supplements = data.supplements;
        foods = data.foods;
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
    }
}

async function saveData() {
    await fetch('/api/data', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userDailyData, supplements, foods })
    });
}

function estimateCalories(food) {
    const calorieMap = { 'Oatmeal': 150, 'Mixed Fruit': 180, 'Coffee': 5 };
    return calorieMap[food] || 100;
}

// Initial login (temporary hardcoded credentials)
async function login() {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'testpass' })
    });
    const data = await response.json();
    token = data.token;
    await fetchData();
}