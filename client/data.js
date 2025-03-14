// HealthSync Version 1.3.003 - Data Management
let userDailyData = {};
let supplements = [];
let foods = [];
let token = null;

function getTodayFormatted() {
  const today = new Date();
  return `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`; // e.g., "03/14/2025"
}

function resetDailyData() {
  const todayKey = getTodayFormatted();
  const lastSavedDate = localStorage.getItem('lastSavedDate') || todayKey;

  if (lastSavedDate !== todayKey) {
    // New day—reset today’s data
    userDailyData[todayKey] = {
      steps: 0,
      water: 0,
      weight: null,
      bloodPressure: null,
      log: [],
      exercises: [],
      stepsLog: [],
      moods: [],
      symptoms: [],
      supplements: [],
      foods: []
    };
    localStorage.setItem('lastSavedDate', todayKey);
    // Don’t overwrite server data yet—sync after fetch
  }
}

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
    const todayKey = getTodayFormatted();
    if (!userDailyData[todayKey]) {
      resetDailyData(); // Ensure today’s data exists if not fetched
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

function updateDataStatus() {
  const statusElement = document.getElementById('dataStatus');
  const todayKey = getTodayFormatted();
  if (userDailyData[todayKey] && Object.keys(userDailyData[todayKey]).some(key => userDailyData[todayKey][key] !== null && userDailyData[todayKey][key] !== 0 && userDailyData[todayKey][key]?.length > 0)) {
    statusElement.textContent = `Your data is saved for ${todayKey}`;
  } else {
    statusElement.textContent = `No data saved for ${todayKey} yet`;
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

document.addEventListener('DOMContentLoaded', () => {
  resetDailyData();
  login(); // Fetch data after reset
  updateDataStatus();
});