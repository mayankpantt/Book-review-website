const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
var cors = require("cors");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const app = express();
const port = 3000;

app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: "djgevocmm",
  api_key: "264777488666317",
  api_secret: "rGM5kJRp3LwGjOeGiZElJRMLVio",
});

// Set up Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "book-reviews", // Folder name on Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"], // Allowed file types
  },
});

const upload = multer({ storage: storage });

const reviewsFilePath = path.join(__dirname, "reviews.json");
let reviews = [];

// Load reviews from the JSON file on server start
fs.readFile(reviewsFilePath, (err, data) => {
  if (err) {
    console.error("Could not read reviews file:", err);
    reviews = [];
  } else {
    reviews = JSON.parse(data);
  }
});

function saveReviews() {
  fs.writeFile(reviewsFilePath, JSON.stringify(reviews, null, 2), (err) => {
    if (err) {
      console.error("Could not save reviews:", err);
    }
  });
}

// Post new review
app.post(
  "/reviews",
  upload.fields([{ name: "cover" }, { name: "fullImage" }]),
  (req, res) => {
    const { title, author, review } = req.body;
    const reviewId = Date.now();

    const reviewData = {
      id: reviewId,
      title,
      author,
      review,
      cover: req.files["cover"] ? req.files["cover"][0].path : null,
      fullImage: req.files["fullImage"] ? req.files["fullImage"][0].path : null,
    };

    reviews.push(reviewData);
    saveReviews();
    res.status(201).send("Review saved");
  }
);

// Get all reviews
app.get("/reviews", (req, res) => {
  res.json(reviews);
});

// Update review
app.put(
  "/reviews/:id",
  upload.fields([{ name: "cover" }, { name: "fullImage" }]),
  (req, res) => {
    const reviewId = parseInt(req.params.id);
    const reviewIndex = reviews.findIndex((review) => review.id === reviewId);

    if (reviewIndex !== -1) {
      const { title, author, review } = req.body;

      const updatedReview = {
        id: reviewId,
        title,
        author,
        review,
        cover: req.files["cover"]
          ? req.files["cover"][0].path
          : reviews[reviewIndex].cover,
        fullImage: req.files["fullImage"]
          ? req.files["fullImage"][0].path
          : reviews[reviewIndex].fullImage,
      };

      reviews[reviewIndex] = updatedReview;
      saveReviews();
      res.send("Review updated");
    } else {
      res.status(404).send("Review not found");
    }
  }
);

// Delete review
app.delete("/reviews/:id", (req, res) => {
  const reviewId = parseInt(req.params.id);
  reviews = reviews.filter((review) => review.id !== reviewId);
  saveReviews();
  res.send("Review deleted");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

});

