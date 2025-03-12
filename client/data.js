let sampleData = {
  userDailyDataKeys: ['2025-03-11', '2025-03-10'],
  userDailyData: {
    '2025-03-11': { weight: 244.0, water: 16 },
    '2025-03-10': { weight: 245.0, water: 8 }
  }
};

function loadSample() {
  fetch('/api/loadSample', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify(sampleData)
  }).then(() => fetchData());
}