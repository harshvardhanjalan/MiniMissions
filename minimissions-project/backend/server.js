// Load environment variables from .env file
require('dotenv').config();

// Import built-in Node.js modules for creating an HTTP server and parsing URLs
const http = require('http');
const url = require('url'); // Module to parse URLs

// Import installed packages
const mongoose = require('mongoose'); // For MongoDB interaction
const bcrypt = require('bcryptjs'); // For password hashing
const { Buffer } = require('buffer'); // A Node.js class for handling raw binary data

// Import the User Model
const User = require('./models/User');
// --- NEW: IMPORT BLOG MODEL ---
const Blog = require('./models/Blog.js');
// ------------------------------

// Get configuration from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

// --- MINI MISSION BANK (50 Items) ---
const missions = [
  // Creative
  { id: 1, type: 'Creative', title: 'Rock Craft', details: 'Go outside and find 3 interesting rocks. Try to paint a face on one or arrange them into a small sculpture.' },
  { id: 2, type: 'Creative', title: 'Doodle Challenge', details: 'Grab a pen and paper. Set a timer for 10 minutes and fill the entire page with small doodles. Don\'t think, just draw.' },
  { id: 3, type: 'Creative', title: 'One Sentence Story', details: 'Write a story, but it can only be one sentence long. Make it as interesting as possible.' },
  { id: 4, type: 'Creative', title: 'Paper Airplane', details: 'Find a piece of paper and fold it into the best paper airplane you can. See how far it flies.' },
  { id: 5, type: 'Creative', title: 'Found Art', details: 'Find 5 random objects on your desk (like a paperclip, a coin, a cap) and arrange them into a work of art.' },
  { id: 6, type: 'Creative', title: 'New Recipe', details: 'Find a simple, 3-ingredient recipe for a snack you\'ve never tried. (e.g., "apple slices, peanut butter, chocolate chips").' },
  { id: 7, type: 'Creative', title: 'Origami Beginner', details: 'Find a simple origami tutorial on YouTube (like a boat or a frog) and try to make it.' },
  { id: 8, type: 'Creative', title: 'Blackout Poetry', details: 'Find an old newspaper or magazine page. Circle words you like and black out the rest to create a poem.' },
  { id: 9, type: 'Creative', title: 'Building Challenge', details: 'Using only LEGOs, playing cards, or toothpicks, try to build the tallest structure you can in 5 minutes.' },
  { id: 10, type: 'Creative', title: 'Limerick Time', details: 'Try to write a 5-line limerick about your day.' },

  // Mindfulness & Observe
  { id: 11, type: 'Mindful', title: '5-Minute Reset', details: 'Put your phone down. Close your eyes and focus only on your breathing for 5 minutes. Notice how you feel after.' },
  { id: 12, type: 'Observe', title: 'New Perspective', details: 'Look out your window for 3 minutes. Write down 5 things you\'ve never noticed before.' },
  { id: 13, type: 'Observe', title: 'Cloud Shapes', details: 'Spend 5 minutes looking at the sky. Try to find at least 3 shapes in the clouds.' },
  { id: 14, type: 'Mindful', title: 'Texture Hunt', details: 'Touch 5 different things around you (a plant, a wall, fabric, a glass). Really focus on what each one feels like.' },
  { id: 15, type: 'Mindful', title: 'Silent 10', details: 'Put on noise-cancelling headphones with no music, or just sit in the quietest place you can find for 10 minutes.' },
  { id: 16, type: 'Observe', title: 'People Watching', details: 'Safely from a window or a park bench, just watch the world go by. Invent a small, happy backstory for a person you see.' },
  { id: 17, type: 'Mindful', title: 'One-Minute Meditation', details: 'Close your eyes and count your breaths. Inhale (1), Exhale (2)... all the way to 10. Then repeat 6 times.' },
  { id: 18, type: 'Observe', title: 'Color Hunt', details: 'Look around you right now. Find 5 things that are the color blue. Then 5 things that are red. Then green.' },
  { id: 19, type: 'Mindful', title: 'Slow-Mo', details: 'Pick a simple task, like washing your hands or making tea. Do every single step as slowly and deliberately as possible.' },
  { id: 20, type: 'Observe', title: 'Sound Map', details: 'Close your eyes and listen for 2 minutes. What\'s the farthest sound you can hear? What\'s the closest? Try to identify 5 distinct sounds.' },

  // Active & Explore
  { id: 21, type: 'Explore', title: 'New Route', details: 'Walk in a direction you never go. Try to find a new street or path in your neighborhood you haven\'t seen before.' },
  { id: 22, type: 'Active', title: '10-Minute Tidy', details: 'Set a timer for 10 minutes and tidy up one small area of your room. It\'s a quick win.' },
  { id: 23, type: 'Active', title: 'Desk Stretches', details: 'Stand up and do 3 simple stretches. Touch your toes, stretch your arms overhead, and twist your torso.' },
  { id: 24, type: 'Explore', title: 'Indoor Explorer', details: 'Pretend you\'re an explorer in your own home. "Discover" a room you haven\'t been in all day.' },
  { id: 25, type: 'Active', title: 'Dance Break', details: 'Put on one of your favorite, high-energy songs and dance around your room for its entire length. No judgement.' },
  { id: 26, type: 'Active', title: 'Water Break', details: 'Go get a glass of water and drink it all. Hydration mission!' },
  { id: 27, type: 'Explore', title: 'Backwards Walk', details: 'Safely in a hallway or open space, try to walk 20 steps backwards. It uses a different part of your brain!' },
  { id: 28, type: 'Active', title: 'Stair Climb', details: 'If you have stairs, walk up and down them 3 times. If not, do 20 jumping jacks.' },
  { id: 29, type: 'Explore', title: 'New App', details: 'Find a free, educational app (like Duolingo or a star-gazing app) and spend 10 minutes with it.' },
  { id: 30, type: 'Active', title: 'Balance', details: 'Try to stand on one foot for as long as you can. Then switch to the other.' },

  // Social & Gratitude
  { id: 31, type: 'Gratitude', title: 'Quick Thanks', details: 'Send a text to one person (friend or family) telling them one reason you appreciate them.' },
  { id: 32, type: 'Social', title: 'Old Photo', details: 'Find a fun old photo of you and a friend. Send it to them and share the good memory.' },
  { id: 33, type: 'Gratitude', title: '3 Good Things', details: 'Write down 3 simple things you are grateful for right now. (e.g., "a comfy chair," "good music").' },
  { id: 34, type: 'Social', title: 'Share a Laugh', details: 'Find a meme or short video that made you laugh today and send it to a friend.' },
  { id: 35, type: 'Gratitude', title: 'Thank You', details: 'The next time you talk to a cashier, barista, or service worker, make eye contact and give them a genuine "Thank you, have a great day!"' },
  { id: 36, type: 'Social', title: 'Ask a Question', details: 'Text a friend and ask them a specific, interesting question, like "What\'s the best thing you\'ve eaten this week?"' },
  { id: 37, type: 'Gratitude', title: 'Appreciate You', details: 'Write down one thing you did well today, no matter how small. Acknowledge your own effort.' },
  { id: 38, type: 'Social', title: '5-Minute Call', details: 'Call a family member (parent, grandparent, sibling) just to say hi. Keep it short and sweet.' },
  { id: 39, type: 'Gratitude', title: 'Write a Compliment', details: 'Leave a positive, genuine comment on a creator\'s post or a friend\'s photo.' },
  { id: 40, type: 'Social', title: 'Learn a Word', details: 'Learn how to say "Hello" or "Thank You" in a new language. Try to use it on someone today.' },

  // Misc. Fun
  { id: 41, type: 'Fun', title: 'Pen Spinning', details: 'Look up a "how to spin a pen" tutorial and try to learn the "ThumbAround" basic move for 10 minutes.' },
  { id: 42, type: 'Fun', title: 'Beatbox', details: 'Try to learn the 3 basic sounds of beatboxing: "boots" (B), "cats" (ts), and "k-snare" (K). "Boots-cats-boots-cats..."' },
  { id: 43, type: 'Fun', title: 'Organize Your Desktop', details: 'Take 5 minutes to clean up your computer desktop. Put all those random files into one folder. Ah, satisfying.' },
  { id: 44, type: 'Fun', title: 'Coin Flip', details: 'Make a simple decision by flipping a coin. (e.g., "Heads I\'ll make tea, Tails I\'ll have coffee").' },
  { id: 45, type: 'Fun', title: 'Left-Handed', details: 'Try to write your name or draw a simple house using your non-dominant hand.' },
  { id: 46, type: 'Fun', title: 'Alphabet Game', details: 'Try to find an object in your room for every letter of the alphabet. "A - Apple, B - Book..." Get as far as you can in 5 mins.' },
  { id: 47, type: 'Fun', title: 'Sing!', details: 'Sing the chorus of your favorite song out loud right now. (Or in your head, if you\'re in a quiet place).' },
  { id: 48, type: 'Fun', title: 'Daydream', details: 'For 5 minutes, let your mind wander and daydream about a perfect vacation. Where would you go? What would you do?' },
  { id: 49, type: 'Fun', title: 'New Font', details: 'Change the default font in your code editor or word processor. A small change of scenery.' },
  { id: 50, type: 'Fun', title: 'Make a List', details: 'Write a list of "Top 5 Favorite Movies" or "Top 5 Best Snacks." Just for fun.' }
];
// -------------------------

// --- Mongoose Connection to MongoDB ---
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB Connected Successfully!');
})
.catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
});

// --- Manual CORS Handler ---
const handleCORS = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204); 
        res.end();
        return true; 
    }
    return false; 
};

// --- Helper function to parse JSON request body ---
const getRequestBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString(); 
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body)); 
            } catch (error) {
                reject(new Error('Invalid JSON in request body'));
            }
        });
        req.on('error', (err) => {
            reject(err);
        });
    });
};


// --- HTTP Server Creation ---
const server = http.createServer(async (req, res) => {
    if (handleCORS(req, res)) {
        return; 
    }

    const parsedUrl = url.parse(req.url, true); 
    const path = parsedUrl.pathname;
    const method = req.method;

    console.log(`[${new Date().toISOString()}] ${method} ${path}`); 

    // --- Basic Routing Logic ---
    if (path === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Minimissions Backend API is running with Node.js http module!');
    } 
    
    // --- USER ROUTES ---
    else if (path === '/api/register' && method === 'POST') {
        try {
            const { username, email, password } = await getRequestBody(req);

            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Username or email already in use' }));
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                username,
                email,
                password: hashedPassword
            });

            await newUser.save();

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User registered successfully!' }));

        } catch (error) {
            console.error('Registration error:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Server error during registration', error: error.message }));
        }
    } 
    
    else if (path === '/api/login' && method === 'POST') {
        try {
            const { usernameOrEmail, password } = await getRequestBody(req);

            const user = await User.findOne({
                $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
            });

            if (!user) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid credentials' }));
                return;
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid credentials' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'Login successful!',
                // Send back user data (but NOT the password)
                user: { id: user._id, username: user.username, email: user.email }
            }));

        }
        
        catch (error) {
            console.error('Login error:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Server error during login', error: error.message }));
        }
    }

    // --- MISSION ROUTE ---
    else if (path === '/api/get-mission' && method === 'GET') {
        // Pick a random mission from our mission bank
        const randomIndex = Math.floor(Math.random() * missions.length);
        const mission = missions[randomIndex];

        // Send the mission back as JSON
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mission));
    }
    
    // --- NEW BLOG ROUTES ---

    // 1. CREATE A NEW BLOG POST
    else if (path === '/api/blogs/create' && method === 'POST') {
        try {
            const { title, content, authorId, authorUsername } = await getRequestBody(req);

            // Simple validation
            if (!title || !content || !authorId || !authorUsername) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Missing required fields' }));
                return;
            }

            const newBlog = new Blog({
                title,
                content,
                authorId,
                authorUsername
            });

            await newBlog.save();
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newBlog));

        } catch (error) {
            console.error('Blog creation error:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Server error creating blog post', error: error.message }));
        }
    }

    // 2. GET ALL BLOG POSTS (THE FEED)
    else if (path === '/api/blogs/all' && method === 'GET') {
        try {
            // Find all blogs, sort them by creation date (newest first)
            const blogs = await Blog.find().sort({ createdAt: -1 });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(blogs));

        } catch (error) {
            console.error('Get all blogs error:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Server error fetching blog posts', error: error.message }));
        }
    }
    
    // 3. ADD A COMMENT TO A BLOG POST
    else if (path === '/api/blogs/comment' && method === 'POST') {
        try {
            const { postId, authorUsername, text } = await getRequestBody(req);

            if (!postId || !authorUsername || !text) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Missing required fields for comment' }));
                return;
            }

            const blog = await Blog.findById(postId);
            if (!blog) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Blog post not found' }));
                return;
            }

            const newComment = {
                authorUsername,
                text
            };

            blog.comments.push(newComment); // Add the new comment to the array
            await blog.save(); // Save the blog post with the new comment

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(blog)); // Send back the updated blog post

        } catch (error) {
            console.error('Add comment error:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Server error adding comment', error: error.message }));
        }
    }

    // --- 404 NOT FOUND ---
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
}); 

// --- Start the Server ---
if (mongoose.connection.readyState === 1) {
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
} else {
    mongoose.connection.on('connected', () => {
        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    });
}

// --- Graceful Shutdown ---
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection disconnected through app termination');
    process.exit(0);
});
