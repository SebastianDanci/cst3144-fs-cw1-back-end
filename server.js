const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// In-memory data
let lessons = [
    {
        "id": 1,
        "subject": "Mathematics",
        "location": "Hendon Campus",
        "price": 100,
        "spaces": 5
    },
    {
        "id": 2,
        "subject": "Art Class",
        "location": "Camden Studio",
        "price": 80,
        "spaces": 5
    },
    {
        "id": 3,
        "subject": "History",
        "location": "Brent Cross",
        "price": 90,
        "spaces": 5
    },
    {
        "id": 4,
        "subject": "Science",
        "location": "Hendon Campus",
        "price": 110,
        "spaces": 5
    },
    {
        "id": 5,
        "subject": "F-Student Engineering",
        "location": "Milton Keynes Hub",
        "price": 250,
        "spaces": 5
    },
    {
        "id": 6,
        "subject": "Romanian Language",
        "location": "Bucharest Online",
        "price": 75,
        "spaces": 5
    },
    {
        "id": 7,
        "subject": "Physics",
        "location": "Golders Green",
        "price": 100,
        "spaces": 5
    },
    {
        "id": 8,
        "subject": "Chemistry",
        "location": "Camden Studio",
        "price": 95,
        "spaces": 5
    },
    {
        "id": 9,
        "subject": "Coding (Python)",
        "location": "Hendon Campus",
        "price": 130,
        "spaces": 5
    },
    {
        "id": 10,
        "subject": "Race Data Analysis",
        "location": "Milton Keynes Hub",
        "price": 300,
        "spaces": 5
    },
    {
        "id": 11,
        "subject": "Music Theory",
        "location": "Brent Cross",
        "price": 85,
        "spaces": 5
    }
];
let orders = [];

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// API Endpoints

// GET /lessons
app.get('/lessons', (req, res) => {
    res.json(lessons);
});

//GET orders
app.get('/orders', (req, res) => {
    res.json(orders);
});

// POST /orders
app.post('/orders', (req, res) => {
    const { name, phone, lessonIDs } = req.body;
    const newOrder = {
        id: orders.length + 1,
        name,
        phone,
        lessonIDs
    };
    orders.push(newOrder);
    res.status(201).json(newOrder);
});

// PUT /lessons/:id
app.put('/lessons/:id', (req, res) => {
    const lessonId = parseInt(req.params.id);
    const { spaces } = req.body;
    const lesson = lessons.find(l => l.id === lessonId);

    if (lesson) {
        lesson.spaces = spaces;
        res.json(lesson);
    } else {
        res.status(404).json({ error: 'Lesson not found' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
