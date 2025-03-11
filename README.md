# HealthSync

A health tracking application to log daily metrics like steps, water intake, and more, with data visualization via charts. Now with MongoDB persistence starting at version 1.3.0.

## Setup Instructions

### Prerequisites
- **Node.js**: Version 14.x or higher (check with `node --version`).
- **npm**: Comes with Node.js (check with `npm --version`).
- **MongoDB**: Version 8.0.5 installed (check with `mongod --version`).

### MongoDB Environment Setup (macOS)
1. **Install MongoDB** (if not already done):
   - Using Homebrew:
     ```bash
     brew tap mongodb/brew
     brew install mongodb-community@8.0