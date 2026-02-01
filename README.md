# SQL Escape Room - ISTE SQL Event

A SQL-themed escape room game where players solve SQL questions to progress through levels.

## 🎮 Features

- **Secure Backend**: Express.js server with server-side answer validation
- **3 SQL Challenges**: Progressive difficulty from SELECT to JOIN operations
- **Interactive UI**: Dark-themed interface with dynamic table rendering
- **Hidden Entrance**: Hover-triggered door button on the landing page
- **No Answer Exposure**: Correct answers never sent to frontend (DevTools-safe)

## 📁 Project Structure

```
sql-escape-room/
│
├── server/
│   ├── server.js        # Express server with API endpoints
│   └── questions.js     # Question database (answers server-only)
│
├── public/
│   ├── index.html      # Main game UI
│   ├── style.css       # Dark theme styling
│   └── script.js       # Game logic (vanilla JavaScript)
│
└── package.json        # Express dependencies
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd sql-escape-room
npm install
```

### 2. Start the Server

```bash
node server/server.js
```

The server will start on **http://localhost:3000**

### 3. Access the Game

**Option A: Through Landing Page (Recommended)**
1. Visit the landing page at **http://localhost:5174**
2. Hover over the "ISTE SQL EVENT" section
3. Click the **door button** that appears
4. The escape room opens in a new tab

**Option B: Direct Access**
- Navigate directly to **http://localhost:3000**

## 🎯 How to Play

1. **Read the Question**: Each level presents a SQL scenario
2. **Examine the Dataset**: Tables show sample data
3. **Enter Your Answer**: Type the result your SQL query would return
4. **Unlock the Door**: Click "UNLOCK" to submit
5. **Progress**: Correct answers advance you to the next level
6. **Victory**: Complete all 3 levels to escape the SQL vault!

## 📊 Questions Overview

### Level 1: SELECT with WHERE
**Scenario**: Find an employee by ID  
**Query Type**: `SELECT ... WHERE`  
**Answer**: Employee name

### Level 2: LIKE Pattern Matching
**Scenario**: Search for products containing "SQL"  
**Query Type**: `SELECT ... WHERE ... LIKE '%SQL%'`  
**Answer**: Comma-separated product names

### Level 3: JOIN Operation
**Scenario**: Find customer name from order ID  
**Query Type**: `SELECT ... JOIN ... WHERE`  
**Answer**: Customer name

## 🔐 Security Features

### Server-Side Validation
- Correct answers stored ONLY in `server/questions.js`
- API endpoint `/api/question/:id` excludes `correctAnswer` field
- Validation happens server-side via `/api/check`
- Frontend never receives correct answers

### Testing Security
```bash
# This should NOT contain correctAnswer field
curl http://localhost:3000/api/question/1
```

## 🛠 API Endpoints

### GET /api/question/:id
Returns question data without the answer.

**Response:**
```json
{
  "id": 1,
  "level": "Level 1",
  "title": "The Employee Archives",
  "question": "Find the name of the employee with ID 5",
  "hint": "Use SELECT and WHERE to filter by employee ID",
  "tableName": "employees",
  "columns": ["id", "name", "department"],
  "rows": [...]
}
```

### POST /api/check
Validates user answer.

**Request:**
```json
{
  "id": 1,
  "userAnswer": "Eve Davis"
}
```

**Response:**
```json
{
  "correct": true
}
```

### GET /api/total
Returns total number of questions.

**Response:**
```json
{
  "total": 3
}
```

## 💻 Technology Stack

- **Backend**: Express.js
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: Custom CSS with dark theme
- **Data Format**: JSON

## 🎨 Customization

### Adding More Questions

Edit `server/questions.js` and add new question objects:

```javascript
{
    id: 4,
    level: "Level 4",
    title: "Your Question Title",
    question: "Your question text",
    hint: "Helpful hint",
    tableName: "your_table",
    columns: ["col1", "col2"],
    rows: [
        { col1: "value1", col2: "value2" }
    ],
    correctAnswer: "Your answer"
}
```

### Changing Colors

Edit `public/style.css` CSS variables:

```css
:root {
    --primary: #00d9ff;    /* Main accent color */
    --secondary: #7b2ff7;  /* Secondary color */
    --accent: #ff2e97;     /* Tertiary color */
}
```

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is occupied, edit `server/server.js`:
```javascript
const PORT = 3001; // Change to any available port
```

### Door Button Not Appearing
- Ensure landing page dev server is running (port 5174)
- Hover over the entire hero content area
- Check browser console for errors

### Questions Not Loading
- Verify Express server is running
- Check server console for errors
- Ensure `questions.js` has no syntax errors

## 📝 License

MIT

## 👥 Author

ISTE SQL Event Team
---
**Enjoy the SQL Escape Room Challenge! 🎉**
