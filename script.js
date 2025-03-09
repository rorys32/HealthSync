// HealthSync Version 1.1.010
document.addEventListener('DOMContentLoaded', () => {
    const currentDate = document.getElementById('currentDate');
    const supplementList = document.getElementById('supplementList');
    const addSupplementBtn = document.getElementById('addSupplement');
    const logAllSupplementsBtn = document.getElementById('logAllSupplements');
    const waterProgress = document.getElementById('waterProgress');
    const waterBtns = document.querySelectorAll('.waterBtn');
    const weightInput = document.getElementById('weightInput');
    const logWeightBtn = document.getElementById('logWeight');
    const stepInput = document.getElementById('stepInput');
    const stepProgress = document.getElementById('stepProgress');
    const logStepsBtn = document.getElementById('logSteps');
    const systolicInput = document.getElementById('systolicInput');
    const diastolicInput = document.getElementById('diastolicInput');
    const logBloodPressureBtn = document.getElementById('logBloodPressure');
    const foodInput = document.getElementById('foodInput');
    const logFoodBtn = document.getElementById('logFood');
    const exerciseInput = document.getElementById('exerciseInput');
    const logExerciseBtn = document.getElementById('logExercise');
    const moodSelect = document.getElementById('moodSelect');
    const customMoodInput = document.getElementById('customMoodInput');
    const logMoodBtn = document.getElementById('logMood');
    const logEntries = document.getElementById('logEntries');
    const exerciseTrends = document.getElementById('exerciseTrends');

    // Date handling (hardcoded for testing)
    const today = "2025-03-09";
    currentDate.textContent = new Date(today).toLocaleDateString();

    // Load or initialize daily data
    let dailyData = JSON.parse(localStorage.getItem('dailyData')) || {};
    if (!dailyData[today]) {
        dailyData[today] = { steps: 0, water: 0, weight: null, bloodPressure: null, log: [], exercises: [] };
    }
    let totalSteps = dailyData[today].steps;
    let totalWater = dailyData[today].water;
    stepProgress.value = totalSteps;
    waterProgress.value = totalWater;

    // Render daily log
    function renderLog() {
        logEntries.innerHTML = '';
        const waterEntry = document.createElement('li');
        waterEntry.id = 'waterEntry';
        waterEntry.textContent = `Water: ${totalWater} oz / 64 oz`;
        logEntries.appendChild(waterEntry);
        dailyData[today].log.forEach(entry => {
            if (!entry.startsWith('Water:')) {
                const li = document.createElement('li');
                li.textContent = entry;
                logEntries.appendChild(li);
            }
        });
    }
    renderLog();

    // Render trends (charts and exercise frequency)
    function renderTrends() {
        const dates = Object.keys(dailyData).sort();
        const weights = dates.map(date => dailyData[date].weight || null);
        const steps = dates.map(date => dailyData[date].steps || 0);
        const systolic = dates.map(date => dailyData[date].bloodPressure?.systolic || null);
        const diastolic = dates.map(date => dailyData[date].bloodPressure?.diastolic || null);

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

        const exerciseCount = {};
        Object.keys(dailyData).forEach(date => {
            dailyData[date].exercises?.forEach(ex => {
                exerciseCount[ex] = (exerciseCount[ex] || 0) + 1;
            });
        });
        exerciseTrends.innerHTML = '';
        for (const [ex, count] of Object.entries(exerciseCount)) {
            const li = document.createElement('li');
            li.textContent = `${ex}: ${count} time${count > 1 ? 's' : ''} this week`;
            exerciseTrends.appendChild(li);
        }
    }
    renderTrends();

    // Supplements & Medications
    let supplements = JSON.parse(localStorage.getItem('supplements')) || [];
    function renderSupplements() {
        supplementList.innerHTML = '';
        supplements.forEach((sup, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<input type="checkbox" id="sup${index}"><label for="sup${index}">${sup}</label>`;
            supplementList.appendChild(li);
        });
    }
    renderSupplements();

    addSupplementBtn.addEventListener('click', () => {
        const newSup = prompt('Enter new supplement or medication:');
        if (newSup) {
            supplements.push(newSup);
            localStorage.setItem('supplements', JSON.stringify(supplements));
            renderSupplements();
        }
    });

    logAllSupplementsBtn.addEventListener('click', () => {
        const checked = supplementList.querySelectorAll('input:checked');
        if (checked.length > 0) {
            checked.forEach(input => {
                const supName = input.nextElementSibling.textContent;
                const logText = `${supName} logged`;
                dailyData[today].log.push(logText);
            });
            localStorage.setItem('dailyData', JSON.stringify(dailyData));
            renderLog();
            alert('Supplements & Medications logged!');
        }
    });

    // Water Tracking
    waterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const oz = parseInt(btn.dataset.oz);
            totalWater += oz;
            waterProgress.value = totalWater;
            dailyData[today].water = totalWater;
            localStorage.setItem('dailyData', JSON.stringify(dailyData));
            renderLog();
        });
    });

    // Weight Logging
    logWeightBtn.addEventListener('click', () => {
        const weight = weightInput.value;
        if (weight) {
            const logText = `Weight: ${weight} lbs`;
            dailyData[today].weight = weight;
            dailyData[today].log.push(logText);
            localStorage.setItem('dailyData', JSON.stringify(dailyData));
            renderLog();
            renderTrends();
            weightInput.value = '';
        }
    });

    // Steps Logging
    logStepsBtn.addEventListener('click', () => {
        const steps = parseInt(stepInput.value);
        if (steps && steps > 0) {
            totalSteps += steps;
            stepProgress.value = totalSteps;
            const logText = `Steps: ${totalSteps} / 10000`;
            dailyData[today].steps = totalSteps;
            dailyData[today].log = dailyData[today].log.filter(e => !e.startsWith('Steps:'));
            dailyData[today].log.push(logText);
            localStorage.setItem('dailyData', JSON.stringify(dailyData));
            renderLog();
            renderTrends();
            stepInput.value = '';
            alert('Steps logged!');
        }
    });

    // Blood Pressure Logging
    logBloodPressureBtn.addEventListener('click', () => {
        const systolic = systolicInput.value;
        const diastolic = diastolicInput.value;
        if (systolic && diastolic) {
            const logText = `Blood Pressure: ${systolic}/${diastolic} mmHg`;
            dailyData[today].bloodPressure = { systolic, diastolic };
            dailyData[today].log.push(logText);
            localStorage.setItem('dailyData', JSON.stringify(dailyData));
            renderLog();
            renderTrends();
            systolicInput.value = '';
            diastolicInput.value = '';
        }
    });

    // Food Logging
    let foods = JSON.parse(localStorage.getItem('foods')) || [];
    logFoodBtn.addEventListener('click', () => {
        const food = foodInput.value;
        if (food) {
            if (!foods.includes(food)) {
                foods.push(food);
                localStorage.setItem('foods', JSON.stringify(foods));
            }
            const logText = `Meal logged: ${food}, ~${estimateCalories(food)} kcal`;
            dailyData[today].log.push(logText);
            localStorage.setItem('dailyData', JSON.stringify(dailyData));
            renderLog();
            foodInput.value = '';
            alert('Meal logged');
        }
    });
    function estimateCalories(food) {
        const calorieMap = { 'Oatmeal': 150, 'Mixed Fruit': 180, 'Coffee': 5 };
        return calorieMap[food] || 100;
    }

    // Exercise Logging
    logExerciseBtn.addEventListener('click', () => {
        const exercise = exerciseInput.value;
        if (exercise) {
            const logText = `Exercise logged: ${exercise}`;
            dailyData[today].log.push(logText);
            dailyData[today].exercises = dailyData[today].exercises || [];
            dailyData[today].exercises.push(exercise);
            localStorage.setItem('dailyData', JSON.stringify(dailyData));
            renderLog();
            renderTrends();
            exerciseInput.value = '';
            alert('Exercise logged!');
        }
    });

    // Mood Logging with Custom Option
    moodSelect.addEventListener('change', () => {
        customMoodInput.style.display = moodSelect.value === 'Custom' ? 'inline-block' : 'none';
    });

    logMoodBtn.addEventListener('click', () => {
        let mood = moodSelect.value;
        if (mood === 'Custom') {
            mood = customMoodInput.value.trim();
            if (!mood) return; // Skip if custom input is empty
        }
        const logText = `Mood: ${mood}`;
        dailyData[today].log.push(logText);
        localStorage.setItem('dailyData', JSON.stringify(dailyData));
        renderLog();
        customMoodInput.value = '';
        customMoodInput.style.display = 'none';
        moodSelect.value = 'Happy'; // Reset to default
        alert('Mood logged!');
    });

    // Testing Controls
    const loadSampleDataBtn = document.getElementById('loadSampleDataBtn');
    const resetDataBtn = document.getElementById('resetDataBtn');

    loadSampleDataBtn.addEventListener('click', () => {
        dailyData = {
            "2025-03-07": {
                steps: 8000,
                water: 48,
                weight: "152",
                bloodPressure: { systolic: "118", diastolic: "78" },
                log: ["Vitamin D, 2000 IU logged", "Water: 48 oz / 64 oz", "Weight: 152 lbs", "Steps: 8000 / 10000", "Blood Pressure: 118/78 mmHg", "Meal logged: Oatmeal, ~150 kcal", "Exercise logged: Jiu Jitsu", "Mood: Happy"],
                exercises: ["Jiu Jitsu"]
            },
            "2025-03-08": {
                steps: 6000,
                water: 32,
                weight: "151",
                bloodPressure: { systolic: "120", diastolic: "80" },
                log: ["Losartan, 50 mg logged", "Water: 32 oz / 64 oz", "Weight: 151 lbs", "Steps: 6000 / 10000", "Blood Pressure: 120/80 mmHg", "Meal logged: Mixed Fruit, ~180 kcal", "Exercise logged: Mountain Biking", "Mood: Calm"],
                exercises: ["Mountain Biking"]
            },
            "2025-03-09": {
                steps: 5000,
                water: 16,
                weight: "150",
                bloodPressure: { systolic: "122", diastolic: "82" },
                log: ["Water: 16 oz / 64 oz", "Weight: 150 lbs", "Steps: 5000 / 10000", "Blood Pressure: 122/82 mmHg", "Meal logged: Coffee, ~5 kcal", "Exercise logged: Jiu Jitsu", "Mood: Anxious"],
                exercises: ["Jiu Jitsu"]
            }
        };
        const sampleSupplements = ["Vitamin D, 2000 IU", "Losartan, 50 mg"];
        const sampleFoods = ["Oatmeal", "Mixed Fruit", "Coffee"];
        localStorage.setItem('supplements', JSON.stringify(sampleSupplements));
        localStorage.setItem('foods', JSON.stringify(sampleFoods));
        localStorage.setItem('dailyData', JSON.stringify(dailyData));
        location.reload();
    });

    resetDataBtn.addEventListener('click', () => {
        localStorage.clear();
        location.reload();
    });
});