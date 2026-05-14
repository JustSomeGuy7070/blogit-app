import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;
const API_URL =
  process.env.API_URL || "http://localhost:4000";

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

// Home page
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      `${API_URL}/posts`
    );

    res.render("index.ejs", {
      posts: response.data,
    });
  } catch (error) {
    res.status(500).send("Error fetching posts");
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
    const response = await axios.get(
      `${API_URL}/posts/${req.params.id}`
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
    await axios.post(
      `${API_URL}/posts`,
      req.body
    );

    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error creating post");
  }
});

// Update post
app.post("/api/posts/:id", async (req, res) => {
  try {
    await axios.patch(
      `${API_URL}/posts/${req.params.id}`,
      req.body
    );

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
      await axios.delete(
        `${API_URL}/posts/${req.params.id}`
      );

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