const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
const imageDirectory = path.join(__dirname, 'public', 'images');
fs.mkdirSync(imageDirectory, { recursive: true });

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

// Static image middleware
app.use('/lesson-images', (req, res) => {
    const sanitizedPath = path.normalize(req.path).replace(/^([.\/\\]+)/, '');
    if (!sanitizedPath || sanitizedPath === path.sep) {
        return res.status(400).json({ error: 'Image name is required' });
    }
    const imagePath = path.resolve(imageDirectory, sanitizedPath);

    if (!imagePath.toLowerCase().startsWith(imageDirectory.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid image path' });
    }

    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: 'Lesson image not found' });
        }
        res.sendFile(imagePath);
    });
});

// API Endpoints

// GET /lessons
app.get('/lessons', (req, res) => {
    res.json(lessons);
});

// GET /search
app.get('/search', (req, res) => {
    const query = (req.query.q || '').trim().toLowerCase();

    if (!query) {
        return res.json(lessons);
    }

    const results = lessons.filter((lesson) => {
        const searchable = [
            lesson.subject,
            lesson.location,
            String(lesson.price),
            String(lesson.spaces)
        ].join(' ').toLowerCase();

        return searchable.includes(query);
    });

    res.json(results);
});

//GET orders
app.get('/orders', (req, res) => {
    res.json(orders);
});

// POST /orders
app.post('/orders', (req, res) => {
    const { name, phone, items = [] } = req.body;

    if (!name || !/^[a-zA-Z\s]+$/.test(name)) {
        return res.status(400).json({ error: 'Name is required and must contain letters only.' });
    }

    if (!phone || !/^\d+$/.test(phone)) {
        return res.status(400).json({ error: 'Phone is required and must contain numbers only.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'At least one lesson must be included in the order.' });
    }

    let sanitizedItems;
    try {
        sanitizedItems = items.map((item) => {
            const lesson = lessons.find((l) => l.id === item.lessonId);
            const qty = Number(item.quantity) || 0;
            if (!lesson || qty <= 0 || qty > lesson.spaces) {
                throw new Error(`Invalid quantity requested for lesson ID ${item.lessonId}`);
            }
            return { lessonId: lesson.id, quantity: qty };
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    const newOrder = {
        id: orders.length + 1,
        name,
        phone,
        items: sanitizedItems,
        lessonIDs: sanitizedItems.map(item => item.lessonId),
        createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    res.status(201).json(newOrder);
});

// PUT /lessons/:id
app.put('/lessons/:id', (req, res) => {
    const lessonId = parseInt(req.params.id, 10);
    const updates = req.body || {};
    const lesson = lessons.find(l => l.id === lessonId);

    if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
    }

    Object.keys(updates).forEach((key) => {
        if (key in lesson) {
            if (key === 'spaces') {
                const nextValue = Number(updates[key]);
                lesson[key] = Number.isNaN(nextValue) ? lesson[key] : Math.max(0, nextValue);
            } else {
                lesson[key] = updates[key];
            }
        }
    });

    res.json(lesson);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
