// HealthSync Version 1.1.002
let profile;
let chart;

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        profile = data;
        loadChecklist();
        updateTotals();
        populateSupplements();
        renderTrends();
    })
    .catch(() => {
        console.error("Failed to load data.json - ensure a local server is running");
        profile = { today: { nutrition: [], water: { consumed: 0, goal: 85 }, supplementsTaken: [], activity: [], vitals: {} }, days: {}, masterList: { foods: [], supplements: [] } };
        loadChecklist();
    });

function loadChecklist() {
    const today = new Date().toISOString().split('T')[0];
    if (!profile.days) profile.days = {};
    if (!profile.days[today]) profile.days[today] = { nutrition: [], water: { consumed: 0 }, supplementsTaken: [], activity: [], vitals: {} };

    const daily = profile.days[today];
    const foodBeverage = document.getElementById("foodBeverage");
    foodBeverage.innerHTML = profile.today.nutrition.map((item, index) => 
        `<label><input type="checkbox" id="food${index}" onchange="updateTotals()" checked> ${item.food}: ${item.quantity} (${item.nutrition.calories} cal${item.nutrition.caffeine_mg ? ", " + item.nutrition.caffeine_mg + " mg caffeine" : ""})</label>`
    ).join("") +
    `<label><input type="checkbox" id="water1" onchange="updateTotals()" ${profile.today.water.consumed >= 16 ? "checked" : ""}> 16 oz Water</label>` +
    `<label><input type="checkbox" id="water2" onchange="updateTotals()" ${profile.today.water.consumed >= 32 ? "checked" : ""}> 16 oz Water</label>`;

    const supplements = document.getElementById("supplements");
    supplements.innerHTML = profile.today.supplementsTaken.map((supp, index) => 
        `<label><input type="checkbox" id="supp${index}" checked> ${supp.name} (${supp.quantity}${supp.caffeine_mg ? ", " + supp.caffeine_mg + " mg caffeine" : ""})</label>`
    ).join("");

    const medications = document.getElementById("medications");
    medications.innerHTML = profile.today.medicationsTaken.map((med, index) => 
        `<label><input type="checkbox" id="med${index}" checked> ${med.name} (${med.quantity})</label>`
    ).join("") +
    profile.today.activity.map((act, index) => 
        `<label><input type="checkbox" id="act${index}" checked> ${act.type} (${act.steps ? act.steps + " steps" : act.duration + " min"}) - ${act.estimated_calories_burned} cal</label>`
    ).join("");

    document.getElementById("currentDate").innerText = today;
    document.getElementById("calGoal").innerText = profile.calorieGoal || 1700;
    document.getElementById("proteinGoal").innerText = profile.proteinGoal || 130;
    document.getElementById("waterGoal").innerText = profile.waterGoal || 85;
}

function updateTotals() {
    const today = new Date().toISOString().split('T')[0];
    const daily = profile.days[today];
    daily.water.consumed = (document.getElementById("water1").checked ? 16 : 0) + (document.getElementById("water2").checked ? 16 : 0);

    let calories = 0, protein = 0, carbs = 0, fats = 0, sugar = 0, caffeine = 0, steps = 0;
    profile.today.nutrition.forEach((item, index) => {
        if (document.getElementById(`food${index}`).checked) {
            calories += item.nutrition.calories;
            protein += item.nutrition.protein || 0;
            carbs += item.nutrition.carbs || 0;
            fats += item.nutrition.fat || 0;
            sugar += item.nutrition.sugar || 0;
            caffeine += item.nutrition.caffeine_mg || 0;
        }
    });
    profile.today.supplementsTaken.forEach((supp, index) => {
        if (document.getElementById(`supp${index}`).checked) {
            caffeine += supp.caffeine_mg || 0;
        }
    });
    const burned = profile.today.activity.reduce((sum, act) => sum + parseInt(act.estimated_calories_burned || "0"), 0);
    steps = profile.today.activity.reduce((sum, act) => sum + (act.steps || 0), 0);

    document.getElementById("calories").innerText = calories;
    document.getElementById("protein").innerText = protein;
    document.getElementById("carbs").innerText = carbs;
    document.getElementById("fats").innerText = fats;
    document.getElementById("sugar").innerText = sugar;
    document.getElementById("caffeine").innerText = caffeine;
    document.getElementById("caffeineWarning").innerText = caffeine > 400 ? " (High!)" : "";
    document.getElementById("water").innerText = daily.water.consumed;
    document.getElementById("burned").innerText = burned;
    document.getElementById("net").innerText = calories - burned;
    document.getElementById("steps").innerText = steps;
}

function addFood() {
    const today = new Date().toISOString().split('T')[0];
    const name = document.getElementById("foodName").value;
    const quantity = document.getElementById("quantity").value;
    const calories = parseInt(document.getElementById("caloriesInput").value) || 0;
    const protein = parseFloat(document.getElementById("proteinInput").value) || 0;
    const carbs = parseFloat(document.getElementById("carbsInput").value) || 0;
    const fats = parseFloat(document.getElementById("fatsInput").value) || 0;
    const sugar = parseFloat(document.getElementById("sugarInput").value) || 0;
    const caffeine = parseFloat(document.getElementById("caffeineInput").value) || 0;

    if (name && quantity && calories) {
        const newFood = { 
            food: name, 
            quantity: quantity, 
            nutrition: { calories: calories, protein: protein, carbs: carbs, fat: fats, sugar: sugar, caffeine_mg: caffeine } 
        };
        profile.today.nutrition.push(newFood);
        profile.days[today].nutrition.push(newFood);

        if (!profile.masterList.foods.some(f => f.name === name)) {
            profile.masterList.foods.push({ 
                name: name, 
                serving_size: quantity, 
                nutrition: { calories: calories, protein: protein, carbs: carbs, fat: fats, sugar: sugar, caffeine_mg: caffeine } 
            });
        }

        clearFoods();
        loadChecklist();
        updateTotals();
        renderTrends();
    }
}

function addActivity() {
    const today = new Date().toISOString().split('T')[0];
    const type = document.getElementById("activityType").value;
    const steps = parseInt(document.getElementById("stepsInput").value) || 0;
    const duration = parseInt(document.getElementById("durationInput").value) || 0;
    const caloriesBurned = parseInt(document.getElementById("caloriesBurnedInput").value) || 0;

    if (type && (steps || duration || caloriesBurned)) {
        const newActivity = { type: type, steps: steps || null, duration: duration || null, estimated_calories_burned: caloriesBurned.toString(), time: new Date().toLocaleTimeString() };
        profile.today.activity.push(newActivity);
        profile.days[today].activity.push(newActivity);

        clearInputs("activity");
        loadChecklist();
        updateTotals();
        renderTrends();
    }
}

function addSupplement() {
    const today = new Date().toISOString().split('T')[0];
    const name = document.getElementById("supplementName").value;
    const quantity = document.getElementById("suppQuantity").value;
    const caffeine = parseFloat(document.getElementById("suppCaffeine").value) || 0;
    const time = document.getElementById("suppTime").value;

    if (name && quantity && time) {
        const newSupp = { name: name, quantity: quantity, caffeine_mg: caffeine, time: time };
        profile.today.supplementsTaken.push(newSupp);
        profile.days[today].supplementsTaken.push(newSupp);

        if (!profile.masterList.supplements.some(s => s.name === name)) {
            profile.masterList.supplements.push({ name: name, serving_size: quantity, caffeine_mg: caffeine, purpose: "User-added" });
            populateSupplements();
        }

        clearInputs("supplement");
        loadChecklist();
        updateTotals();
    }
}

function updateVitals() {
    const today = new Date().toISOString().split('T')[0];
    const weight = parseFloat(document.getElementById("weightInput").value) || null;
    const systolic = parseInt(document.getElementById("bpSystolic").value) || null;
    const diastolic = parseInt(document.getElementById("bpDiastolic").value) || null;
    const energy = parseInt(document.getElementById("energyInput").value) || null;
    const heartRate = parseInt(document.getElementById("heartRateInput").value) || null;

    if (weight || systolic || diastolic || energy || heartRate) {
        profile.today.vitals.weight = weight || profile.today.vitals.weight;
        profile.today.vitals.blood_pressure.systolic = systolic || profile.today.vitals.blood_pressure.systolic;
        profile.today.vitals.blood_pressure.diastolic = diastolic || profile.today.vitals.blood_pressure.diastolic;
        profile.today.vitals.energy_level = energy || profile.today.vitals.energy_level;
        profile.today.vitals.heart_rate = heartRate || profile.today.vitals.heart_rate;

        profile.days[today].vitals = { ...profile.today.vitals };

        clearInputs("vitals");
        loadChecklist();
        renderTrends();
    }
}

function clearFoods() {
    document.getElementById("foodName").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("caloriesInput").value = "";
    document.getElementById("proteinInput").value = "";
    document.getElementById("carbsInput").value = "";
    document.getElementById("fatsInput").value = "";
    document.getElementById("sugarInput").value = "";
    document.getElementById("caffeineInput").value = "";
}

function clearInputs(section) {
    const inputs = {
        activity: ["activityType", "stepsInput", "durationInput", "caloriesBurnedInput"],
        supplement: ["supplementName", "suppQuantity", "suppCaffeine", "suppTime"],
        vitals: ["weightInput", "bpSystolic", "bpDiastolic", "energyInput", "heartRateInput"]
    };
    inputs[section].forEach(id => document.getElementById(id).value = "");
}

function populateSupplements() {
    const datalist = document.getElementById("supplementList");
    datalist.innerHTML = profile.masterList.supplements.map(supp => `<option value="${supp.name}">`).join("");
}

function parseNutritionPhoto() {
    const file = document.getElementById("nutritionPhoto").files[0];
    if (file) {
        alert("Photo uploaded! OCR simulation: Enter values manually for now.");
    }
}

function renderTrends() {
    const ctx = document.getElementById("trendChart").getContext("2d");
    const toggle = document.getElementById("trendToggle").value;
    const days = Object.keys(profile.days || {}).sort();

    if (chart) chart.destroy();

    if (toggle === "activity") {
        const steps = days.map(day => profile.days[day].activity.reduce((sum, act) => sum + (act.steps || 0), 0));
        const burned = days.map(day => profile.days[day].activity.reduce((sum, act) => sum + parseInt(act.estimated_calories_burned || "0"), 0));
        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: days,
                datasets: [
                    { label: "Steps", data: steps, borderColor: "#1976d2", fill: false },
                    { label: "Calories Burned", data: burned, borderColor: "#ff5722", fill: false }
                ]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    } else if (toggle === "vitals") {
        const weight = days.map(day => profile.days[day].vitals.weight || null);
        const systolic = days.map(day => profile.days[day].vitals.blood_pressure?.systolic || null);
        const diastolic = days.map(day => profile.days[day].vitals.blood_pressure?.diastolic || null);
        const energy = days.map(day => profile.days[day].vitals.energy_level || null);
        const heartRate = days.map(day => profile.days[day].vitals.heart_rate || null);
        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: days,
                datasets: [
                    { label: "Weight (lbs)", data: weight, borderColor: "#4caf50", fill: false },
                    { label: "Systolic BP", data: systolic, borderColor: "#ffca28", fill: false },
                    { label: "Diastolic BP", data: diastolic, borderColor: "#1976d2", fill: false },
                    { label: "Energy (1-10)", data: energy, borderColor: "#ab47bc", fill: false },
                    { label: "Heart Rate (bpm)", data: heartRate, borderColor: "#ff5722", fill: false }
                ]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    } else if (toggle === "diet") {
        const calories = days.map(day => profile.days[day].nutrition.reduce((sum, item) => sum + item.nutrition.calories, 0));
        const protein = days.map(day => profile.days[day].nutrition.reduce((sum, item) => sum + (item.nutrition.protein || 0), 0));
        const carbs = days.map(day => profile.days[day].nutrition.reduce((sum, item) => sum + (item.nutrition.carbs || 0), 0));
        const fats = days.map(day => profile.days[day].nutrition.reduce((sum, item) => sum + (item.nutrition.fat || 0), 0));
        const sugar = days.map(day => profile.days[day].nutrition.reduce((sum, item) => sum + (item.nutrition.sugar || 0), 0));
        const caffeine = days.map(day => 
            profile.days[day].nutrition.reduce((sum, item) => sum + (item.nutrition.caffeine_mg || 0), 0) +
            profile.days[day].supplementsTaken.reduce((sum, supp) => sum + (supp.caffeine_mg || 0), 0)
        );
        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: days,
                datasets: [
                    { label: "Calories", data: calories, borderColor: "#4caf50", fill: false },
                    { label: "Protein (g)", data: protein, borderColor: "#ffca28", fill: false },
                    { label: "Carbs (g)", data: carbs, borderColor: "#1976d2", fill: false },
                    { label: "Fats (g)", data: fats, borderColor: "#ab47bc", fill: false },
                    { label: "Sugar (g)", data: sugar, borderColor: "#ff5722", fill: false },
                    { label: "Caffeine (mg)", data: caffeine, borderColor: "#795548", fill: false }
                ]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    }
}

function saveData() {
    const dataStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "healthsync_data.json";
    a.click();
    URL.revokeObjectURL(url);
}

setInterval(() => {
    const now = new Date();
    if (now.getHours() === 12 && now.getMinutes() === 0) {
        alert("What’s for lunch? Let’s log it!");
    }
}, 120000);