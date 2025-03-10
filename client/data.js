// HealthSync Version 1.2.2 - Data Management
const today = new Date().toISOString().split('T')[0];
let userDailyData = {
    [today]: { 
        steps: 0, 
        water: 0, 
        weight: null, 
        bloodPressure: null, 
        log: [], 
        exercises: [], 
        stepsLog: [], 
        moods: [], 
        symptoms: [] 
    }
};
let supplements = [];
let foods = [];
let token = null;

async function fetchData() {
    console.log('Fetching data with token:', token);
    const response = await fetch('/api/data', {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
        }
    });
    console.log('Fetch response:', response.status);
    if (response.ok) {
        const data = await response.json();
        console.log('Fetched data:', JSON.stringify(data, null, 2));
        userDailyData = data.userDailyData || {};
        supplements = data.supplements || [];
        foods = data.foods || [];
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
        console.log('Updated userDailyData:', JSON.stringify(userDailyData, null, 2));
    } else if (response.status === 401 || response.status === 403) {
        console.log('Token invalid, re-logging in...');
        await login();
        await fetchData();
    }
}

async function saveData() {
    console.log('Saving data with token:', token);
    console.log('Data to save:', JSON.stringify({ userDailyData, supplements, foods }, null, 2));
    const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userDailyData, supplements, foods })
    });
    console.log('Save response:', response.status);
    if (!response.ok) {
        console.error('Save failed:', response.status);
        if (response.status === 401 || response.status === 403) {
            console.log('Token invalid, re-logging in...');
            await login();
            await fetch('/api/data', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userDailyData, supplements, foods })
            });
        }
    }
}

function estimateCalories(food) {
    const calorieMap = { 'Oatmeal': 150, 'Mixed Fruit': 180, 'Coffee': 5 };
    return calorieMap[food] || 100;
}

async function login() {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'testpass' })
    });
    const data = await response.json();
    token = data.token;
    console.log('Login token set:', token);
    await fetchData();
}

login();