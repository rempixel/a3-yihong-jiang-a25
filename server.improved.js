const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); 

//temp data
let server_data = [];

async function DB_connection() {
  await mongoose.connect(process.env.CONNECTION, {useNewURLParser: true})
  .then(() => app.listen(PORT, () => {
    console.log("Mongoose connection successful.")
  }));
}

await DB_connection();

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/results", (req, res) => {
  res.json(server_data);
});

app.post("/submit", (req, res) => {
  const { name, birthday, image } = req.body;

  if (!name || !birthday || !image) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const user_name = name.toString().trim();
  const image_data = image.toString();
  const date = birthday.toString().trim();

  const age = derive_age(date);
  const zodiac = derive_zodiac(date);

  server_data.push({
    name: user_name,
    image: image_data,
    birthday: date,
    age,
    zodiac,
  });

  console.log("Data added:", user_name);
  res.json(server_data); // return updated dataset
});

// Edit entry
app.post("/edit", (req, res) => {
  const { index, name, birthday, image } = req.body;

  if (
    index === undefined || index < 0 || index >= server_data.length || !name || !birthday ||!image
  ) {
    return res.status(400).json({ error: "Invalid edit request" });
  }

  const age = derive_age(birthday);
  const zodiac = derive_zodiac(birthday);

  server_data[index] = {
    name: name.toString().trim(),
    image: image.toString(),
    birthday: birthday.toString().trim(),
    age,
    zodiac,
  };

  console.log("Data updated at index", index);
  res.json(server_data); // return updated dataset
});

// Delete entry
app.post("/delete", (req, res) => {
  const { index } = req.body;

  if (index === undefined || index < 0 || index >= server_data.length) {
    return res.status(400).json({ error: "Invalid index" });
  }

  server_data.splice(index, 1);
  console.log("Deleted entry at index", index);
  res.json(server_data); // return updated dataset
});

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
