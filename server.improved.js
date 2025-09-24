require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("./passport-config");
const User = require("./user_schema");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

async function DB_connection() {
  try {
    await mongoose.connect(process.env.CONNECTION);
    console.log("Mongoose connection successful.");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

function ensure_authenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

// Test route
app.get('/test', (req, res) => {
  console.log('Test route hit!');
  res.json({ message: 'Server is working!' });
});

app.get('/auth/github', (req, res, next) => {
  console.log('GitHub OAuth route hit');
  next();
}, passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login-failed' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.redirect('/');
  });
});

app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        username: req.user.username,
        avatar: req.user.avatar
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

app.get('/login-failed', (req, res) => {
  res.json({ error: "GitHub authentication failed" });
});

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/results", ensure_authenticated, async (req, res) => {
  try {
    const users = await User.find({ image: { $ne: '' } });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/submit", ensure_authenticated, async (req, res) => {
  const { name, birthday, image } = req.body;

  if (!name || !birthday || !image) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const user_name = name.toString().trim();
  const image_data = image.toString();
  const date = birthday.toString().trim();

  const age = derive_age(date);
  const zodiac = derive_zodiac(date);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: user_name,
        image: image_data,
        birthday: date,
        age,
        zodiac,
      },
      { new: true }
    );

    console.log("Data updated for user:", updatedUser.name);
    const users = await User.find({ image: { $ne: '' } });
    res.json(users);
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ error: "Failed to save user" });
  }
});

app.post("/edit", ensure_authenticated, async (req, res) => {
  const { name, birthday, image } = req.body;

  if (!name || !birthday || !image) {
    return res.status(400).json({ error: "Invalid edit request" });
  }

  const age = derive_age(birthday);
  const zodiac = derive_zodiac(birthday);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name.toString().trim(),
        image: image.toString(),
        birthday: birthday.toString().trim(),
        age,
        zodiac,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Data updated for user:", updatedUser.name);
    const users = await User.find({ image: { $ne: '' } });
    res.json(users);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.post("/delete", ensure_authenticated, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        image: '',
        birthday: '',
        age: 0,
        zodiac: ''
      },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Cleared submission for user:", updatedUser.name);
    const users = await User.find({ image: { $ne: '' } });
    res.json(users);
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({ error: "Failed to delete submission" });
  }
});

app.use(express.static("public"));

function derive_age(string) {
  const today = new Date();
  const birth_date = new Date(string);
  let age = today.getFullYear() - birth_date.getFullYear();
  const m = today.getMonth() - birth_date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth_date.getDate())) {
    age--;
  }
  return age;
}

function derive_zodiac(string) {
  const birth_date = new Date(string);
  const birth_year = birth_date.getFullYear();
  const modulo = birth_year % 12;
  const zodiac_map = [
    "Monkey",
    "Rooster",
    "Dog",
    "Pig",
    "Rat",
    "Ox",
    "Tiger",
    "Rabbit",
    "Dragon",
    "Snake",
    "Horse",
    "Sheep",
  ];
  return zodiac_map[modulo];
}

// Initialize database and start server
async function init() {
  await DB_connection();
  startServer();
}

init();

