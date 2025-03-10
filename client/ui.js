// HealthSync Version 1.1.015 - UI Rendering
function renderLog() {
    const vitalsEntries = document.getElementById('vitalsEntries');
    const intakeEntries = document.getElementById('intakeEntries');
    const activityEntries = document.getElementById('activityEntries');
    const moodSupplementsEntries = document.getElementById('moodSupplementsEntries');
    const dataStatus = document.getElementById('dataStatus');

    vitalsEntries.innerHTML = '';
    intakeEntries.innerHTML = '';
    activityEntries.innerHTML = '';
    moodSupplementsEntries.innerHTML = '';

    const waterEntry = document.createElement('li');
    waterEntry.textContent = `Water: ${userDailyData[today].water} oz / 64 oz`;
    intakeEntries.appendChild(waterEntry);

    userDailyData[today].log.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = entry;
        if (entry.startsWith('Weight:') || entry.startsWith('Blood Pressure:')) {
            vitalsEntries.appendChild(li);
        } else if (entry.startsWith('Meal logged:')) {
            intakeEntries.appendChild(li);
        } else if (entry.startsWith('Steps:') || entry.startsWith('Exercise logged:')) {
            activityEntries.appendChild(li);
        } else if (entry.startsWith('Mood:') || entry.startsWith('Symptom:') || entry.includes('logged') && !entry.startsWith('Meal logged:')) {
            moodSupplementsEntries.appendChild(li);
        }
    });

    dataStatus.textContent = `Your data is saved for ${today}`;
}

function renderSupplements() {
    const supplementList = document.getElementById('supplementList');
    supplementList.innerHTML = '';
    supplements.forEach((sup, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox" id="sup${index}"><label for="sup${index}">${sup}</label>`;
        supplementList.appendChild(li);
    });
}

function renderTrends() {
    const dates = Object.keys(userDailyData).sort();
    const weights = dates.map(date => userDailyData[date].weight || null);
    const steps = dates.map(date => userDailyData[date].steps || 0);
    const systolic = dates.map(date => userDailyData[date].bloodPressure?.systolic || null);
    const diastolic = dates.map(date => userDailyData[date].bloodPressure?.diastolic || null);

    new Chart(document.getElementById('weightChart'), {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Weight (lbs)',
                data: weights,
                borderColor: '#4a90e2',
                fill: false
            }]
        },
        options: { scales: { y: { beginAtZero: false } } }
    });

    new Chart(document.getElementById('stepsChart'), {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Steps',
                data: steps,
                backgroundColor: '#2ecc71'
            }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });

    new Chart(document.getElementById('bpChart'), {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                { label: 'Systolic (mmHg)', data: systolic, borderColor: '#e74c3c', fill: false },
                { label: 'Diastolic (mmHg)', data: diastolic, borderColor: '#f39c12', fill: false }
            ]
        },
        options: { scales: { y: { beginAtZero: false } } }
    });

    const hourlySteps = {};
    userDailyData[today].stepsLog.forEach(log => {
        const hour = new Date(log.time).getHours().toString().padStart(2, '0') + ':00';
        hourlySteps[hour] = (hourlySteps[hour] || 0) + log.steps;
    });
    const hours = Object.keys(hourlySteps).sort();
    const stepsPerHour = hours.map(hour => hourlySteps[hour]);

    new Chart(document.getElementById('hourlyStepsChart'), {
        type: 'bar',
        data: {
            labels: hours,
            datasets: [{
                label: 'Steps Per Hour',
                data: stepsPerHour,
                backgroundColor: '#9b59b6'
            }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });

    const exerciseCount = {};
    Object.keys(userDailyData).forEach(date => {
        userDailyData[date].exercises?.forEach(ex => {
            exerciseCount[ex] = (exerciseCount[ex] || 0) + 1;
        });
    });
    const exerciseTrends = document.getElementById('exerciseTrends');
    exerciseTrends.innerHTML = '';
    for (const [ex, count] of Object.entries(exerciseCount)) {
        const li = document.createElement('li');
        li.textContent = `${ex}: ${count} time${count > 1 ? 's' : ''} this week`;
        exerciseTrends.appendChild(li);
    }
}