document.addEventListener('DOMContentLoaded', () => {
  fetchData();
  updateDateTime();
  setInterval(updateDateTime, 1000);
});

function fetchData() {
  fetch('/api/data', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  })
    .then(response => response.json())
    .then(data => renderUI(data))
    .catch(error => console.error('Error fetching data:', error));
}

function renderUI(data) {
  // Example chart rendering (placeholder for Chart.js or similar)
  const ctx = document.createElement('canvas');
  document.querySelector('.control-container').appendChild(ctx);
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.userDailyDataKeys,
      datasets: [{
        label: 'Weight (lbs)',
        data: Object.values(data.userDailyData).map(day => parseFloat(day.weight) || 0),
        borderColor: '#ff4d4d',
        fill: false
      }]
    }
  });

  // Log rendering (simplified)
  const logDiv = document.createElement('div');
  logDiv.innerHTML = data.userDailyDataKeys.map(key => data.userDailyData[key].log || []).flat().join('<br>');
  document.querySelector('.control-container').insertBefore(logDiv, document.querySelector('.control-group'));
}

function updateDateTime() {
  document.getElementById('date-time').textContent = new Date().toLocaleString();
}

// Placeholder functions (to be implemented in events.js or script.js)
function logWeight() { fetch('/api/logWeight', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ weight: document.getElementById('weight').value }) }).then(() => fetchData()); }
function addSupplement() { /* Implement */ }
function logFood() { /* Implement */ }
function logWater(amount) { /* Implement */ }
function logSteps() { /* Implement */ }
function logBP() { /* Implement */ }
function logExercise() { /* Implement */ }
function logSymptom() { /* Implement */ }
function logMood() { /* Implement */ }
function loadSampleData() { /* Implement */ }
function resetData() { /* Implement */ }
function saveData() { /* Implement */ }
function loadData() { /* Implement */ }
