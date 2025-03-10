# HealthSync Version 1.2.000

A health tracking app with a Node.js backend.

## Setup
1. Install dependencies: `npm install`
2. Start the server: `npm start` or `npm run dev` (with nodemon)
3. Open `http://localhost:3000` in your browser.

## Features
- Tracks daily health data (steps, water, weight, etc.) with a Node.js/Express backend.
- JWT authentication (dummy login for now).
- Data persists in memory (future: database).
- Responsive UI from 1.1.017.

## Directory Structure
- `client/`: Frontend files (HTML, CSS, JS).
- `server/`: Backend Node.js server.


healthsync/
├── client/
│   ├── index.html
│   ├── styles.css
│   ├── data.js
│   ├── ui.js
│   ├── events.js
│   └── script.js
├── server/
│   └── server.js
├── package.json
└── README.md