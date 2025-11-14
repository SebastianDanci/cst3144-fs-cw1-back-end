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
        "spaces": 5,
        "image": "https://images.pexels.com/photos/3729557/pexels-photo-3729557.jpeg"
    },
    {
        "id": 2,
        "subject": "Art Class",
        "location": "Camden Studio",
        "price": 80,
        "spaces": 5,
        "image": "https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg"
    },
    {
        "id": 3,
        "subject": "History",
        "location": "Brent Cross",
        "price": 90,
        "spaces": 5,
        "image": "https://images.pexels.com/photos/7245237/pexels-photo-7245237.jpeg"
    },
    {
        "id": 4,
        "subject": "Science",
        "location": "Hendon Campus",
        "price": 110,
        "spaces": 5,
        "image": "https://images.pexels.com/photos/8472009/pexels-photo-8472009.jpeg"
    },
    {
        "id": 5,
        "subject": "F-Student Engineering",
        "location": "Milton Keynes Hub",
        "price": 250,
        "spaces": 5,
        "image": "https://images.pexels.com/photos/29255752/pexels-photo-29255752.jpeg"
    },
    {
        "id": 6,
        "subject": "Romanian Language",
        "location": "Bucharest Online",
        "price": 75,
        "spaces": 5,
        "image": "https://images.pexels.com/photos/5238117/pexels-photo-5238117.jpeg"
    },
    {
        "id": 7,
        "subject": "Physics",
        "location": "Golders Green",
        "price": 100,
        "spaces": 5,
        "image": "https://images.pexels.com/photos/6208702/pexels-photo-6208702.jpeg"
    },
    {
        "id": 8,
        "subject": "Chemistry",
        "location": "Camden Studio",
        "price": 95,
        "spaces": 5,
        "image": "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg"
    },
    {
        "id": 9,
        "subject": "Coding (Python)",
        "location": "Hendon Campus",
        "price": 130,
        "spaces": 5,
        "image": "https://images.pexels.com/photos/4976710/pexels-photo-4976710.jpeg"
    },
    {
        "id": 10,
        "subject": "Race Data Analysis",
        "location": "Milton Keynes Hub",
        "price": 300,
        "spaces": 5,
        "image": "https://images.pexels.com/photos/29327948/pexels-photo-29327948.jpeg"
    },
    {
        "id": 11,
        "subject": "Music Theory",
        "location": "Brent Cross",
        "price": 85,
        "spaces": 5,
        "image": "https://images.pexels.com/photos/685458/pexels-photo-685458.jpeg"
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
