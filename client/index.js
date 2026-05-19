import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;
const API_URL = (
  process.env.API_URL || "http://localhost:4000"
).replace(/\/+$/, "");
const API_TIMEOUT =
  Number(process.env.API_TIMEOUT_MS) || 60000;
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  express.static(path.join(__dirname, "public"))
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set(
  "views",
  path.join(__dirname, "views")
);

app.get("/status", async (req, res) => {
  try {
    await api.get("/health");

    res.json({
      ready: true,
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      message: "Server is waking up",
    });
  }
});

// Home page
app.get("/", async (req, res) => {
  try {
    const response = await api.get("/posts");

    res.render("index.ejs", {
      posts: response.data,
    });
  } catch (error) {
    res.render("loading.ejs");
  }
});

// New post page
app.get("/new", (req, res) => {
  res.render("modify.ejs", {
    heading: "New Post",
    submit: "Create Post",
  });
});

// Edit post page
app.get("/edit/:id", async (req, res) => {
  try {
    const response = await api.get(
      `/posts/${req.params.id}`
    );

    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: response.data,
    });
  } catch (error) {
    res.status(500).send("Error fetching post");
  }
});

// Create post
app.post("/api/posts", async (req, res) => {
  try {
    await api.post("/posts", req.body);

    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error creating post");
  }
});

// Update post
app.post("/api/posts/:id", async (req, res) => {
  try {
    await api.patch(`/posts/${req.params.id}`, req.body);

    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error updating post");
  }
});

// Delete post
app.get(
  "/api/posts/delete/:id",
  async (req, res) => {
    try {
      await api.delete(`/posts/${req.params.id}`);

      res.redirect("/");
    } catch (error) {
      res.status(500).send("Error deleting post");
    }
  }
);

// Start the server
app.listen(port, () => {
  console.log(
    `Client running on http://localhost:${port}`
  );
});
