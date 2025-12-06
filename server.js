const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);

// CORS Configuration - Allow GitHub Pages and local development
const allowedOrigins = [
    'https://sebastiandanci.github.io',
    'http://localhost:5173'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Middleware
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Static image middleware
const imageDirectory = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imageDirectory)){
    fs.mkdirSync(imageDirectory, { recursive: true });
}

app.use('/lesson-images', (req, res, next) => {
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
            return res.sendFile(path.join(imageDirectory, 'ImageNotFound.png'));
        }
        res.sendFile(imagePath);
    });
});

function getLessonImage(image, baseUrl) {
    if (!image) return `${baseUrl}/lesson-images/ImageNotFound.png`;
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    
    const imagePath = path.join(imageDirectory, image);
    if (!fs.existsSync(imagePath)) {
        return `${baseUrl}/lesson-images/ImageNotFound.png`;
    }
    return `${baseUrl}/lesson-images/${image}`;
}

// MongoDB Connection
let db;
const uri = process.env.MONGO_URI;

// Connect to MongoDB
async function connectToDB() {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        db = client.db('ezlessons');
        console.log("Connected to MongoDB Atlas");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}

// Connect to DB then start server
connectToDB().then(() => {
    app.listen(port, () => {
        console.log(`Server listening at port ${port}`);
    });
});

// --- API Endpoints ---

// GET /lessons
app.get('/lessons', async (req, res) => {
    try {
        const collection = db.collection('lessons');
        const results = await collection.find({}).toArray();
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        results.forEach(lesson => {
            lesson.image = getLessonImage(lesson.image, baseUrl);
        });

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching lessons' });
    }
});

// GET /search
app.get('/search', async (req, res) => {
    try {
        const query = (req.query.q || '').trim().toLowerCase();
        const collection = db.collection('lessons');
        const lessons = await collection.find({}).toArray();
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        if (!query) {
            lessons.forEach(lesson => {
                lesson.image = getLessonImage(lesson.image, baseUrl);
            });
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

        results.forEach(lesson => {
            lesson.image = getLessonImage(lesson.image, baseUrl);
        });

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Error searching lessons' });
    }
});

// GET /orders
app.get('/orders', async (req, res) => {
    try {
        const collection = db.collection('orders');
        const results = await collection.find({}).toArray();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

// POST /orders
app.post('/orders', async (req, res) => {
    try {
        const { name, phone, items = [] } = req.body;

        // Validation
        if (!name || !/^[a-zA-Z\s]+$/.test(name)) {
            return res.status(400).json({ error: 'Name is required and must contain letters only.' });
        }
        if (!phone || !/^\d{2,}$/.test(phone)) {
            return res.status(400).json({ error: 'Phone is required and must be at least 2 digits.' });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'At least one lesson must be included in the order.' });
        }

        const orderCollection = db.collection('orders');
        
        // Construct the new order
        const newOrder = {
            name,
            phone,
            items,
            lessonIDs: items.map(item => item.lessonId), 
            createdAt: new Date().toISOString()
        };

        const result = await orderCollection.insertOne(newOrder);
        
        res.status(201).json({ ...newOrder, _id: result.insertedId });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving order' });
    }
});

// PUT /lessons/:id
app.put('/lessons/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid lesson id' });
        }

        const updates = req.body;
        const collection = db.collection('lessons');

        const updatedLesson = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );

        if (!updatedLesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        res.json(updatedLesson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating lesson' });
    }
});
