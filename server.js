require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;
let movies;

async function start() {
  if (!uri) {
    console.error("Missing MONGODB_URI. Copy .env.example to .env and add your Atlas connection string.");
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("moviesdb");
  movies = db.collection("movies");
  console.log("Connected to MongoDB Atlas: moviesdb.movies");

  app.get("/api/movies", async (req, res) => {
    try {
      const q = (req.query.search || "").trim();
      const filter = q ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { genre: { $regex: q, $options: "i" } },
          { director: { $regex: q, $options: "i" } },
          { star: { $regex: q, $options: "i" } }
        ]
      } : {};
      const data = await movies.find(filter).sort({ name: 1 }).toArray();
      res.json(data);
    } catch (e) { res.status(500).json({ error: "Could not load movies." }); }
  });

  app.post("/api/movies", async (req, res) => {
    try {
      const movie = validateMovie(req.body);
      const result = await movies.insertOne(movie);
      res.status(201).json({ ...movie, _id: result.insertedId });
    } catch (e) { res.status(400).json({ error: e.message }); }
  });

  app.put("/api/movies/:id", async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid movie ID." });
      const movie = validateMovie(req.body);
      const result = await movies.updateOne({ _id: new ObjectId(req.params.id) }, { $set: movie });
      if (!result.matchedCount) return res.status(404).json({ error: "Movie not found." });
      res.json({ message: "Movie updated." });
    } catch (e) { res.status(400).json({ error: e.message }); }
  });

  app.delete("/api/movies/:id", async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid movie ID." });
      const result = await movies.deleteOne({ _id: new ObjectId(req.params.id) });
      if (!result.deletedCount) return res.status(404).json({ error: "Movie not found." });
      res.json({ message: "Movie deleted." });
    } catch (e) { res.status(500).json({ error: "Could not delete movie." }); }
  });

  app.listen(PORT, () => console.log(`Website running at http://localhost:${PORT}`));
}

function validateMovie(body) {
  const name = String(body.name || "").trim();
  const genre = String(body.genre || "").trim();
  const director = String(body.director || "").trim();
  const star = String(body.star || "").trim();
  const year = Number(body.year);
  const rating = Number(body.rating);
  if (!name || !genre || !director || !star) throw new Error("Please fill in all fields.");
  if (!Number.isInteger(year) || year < 1888 || year > 2100) throw new Error("Enter a valid release year.");
  if (!Number.isFinite(rating) || rating < 0 || rating > 10) throw new Error("Rating must be between 0 and 10.");
  return { name, genre, year, director, star, rating };
}

start().catch(err => {
  console.error("MongoDB connection failed:", err.message);
  process.exit(1);
});