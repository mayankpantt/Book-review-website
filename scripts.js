document.addEventListener("DOMContentLoaded", () => {
  // Fetch and display reviews on the home page
  if (
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/"
  ) {
    fetchReviews();
  }

  // Handle review form submission
  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const reviewId = urlParams.get("id");

    if (reviewId) {
      // We're in edit mode
      populateForm(reviewId);
      document.getElementById("submitButton").style.display = "none";
      document.getElementById("updateButton").style.display = "block";
      document
        .getElementById("updateButton")
        .addEventListener("click", handleReviewUpdate);
    } else {
      // We're in create mode
      reviewForm.addEventListener("submit", handleReviewFormSubmit);
    }
  }

  // Handle search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
  }

  // Handle full review page
  const fullReviewContainer = document.getElementById("fullReview");
  if (fullReviewContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const reviewId = urlParams.get("id");
    if (reviewId) {
      displayFullReview(reviewId);
    }
  }
});

async function fetchReviews() {
  const response = await fetch(" /reviews");
  const reviews = await response.json();
  displayReviews(reviews);
}

function displayReviews(reviews) {
  const reviewGrid = document.getElementById("reviewGrid");
  reviewGrid.innerHTML = ""; // Clear existing reviews
  reviews.forEach((review) => {
    const tile = document.createElement("div");
    tile.className = "review-tile";
    tile.innerHTML = `
            <img src="${review.cover || "default-cover.jpg"}" alt="${
      review.title
    }" onerror="this.onerror=null;this.src='default-cover.jpg';">
            <h3>${review.title}</h3>
        `;
    tile.addEventListener("click", () => {
      window.location.href = `review.html?id=${review.id}`;
    });
    reviewGrid.appendChild(tile);
  });
}

async function displayFullReview(reviewId) {
  const response = await fetch(" /reviews");
  const reviews = await response.json();
  const review = reviews.find((r) => r.id === parseInt(reviewId));

  if (review) {
    const fullReviewContainer = document.getElementById("fullReview");
    fullReviewContainer.innerHTML = `
            <img src="${review.fullImage || "default-full-image.jpg"}" alt="${
      review.title
    }" onerror="this.onerror=null;this.src='default-full-image.jpg';">
            <h2>${review.title}</h2>
            <h3>by ${review.author}</h3>
            <p>${review.review}</p>
            <div class="button-group">
                <button onclick="editReview(${review.id})">Edit</button>
                <button onclick="deleteReview(${review.id})">Delete</button>
            </div>
        `;
  } else {
    fullReviewContainer.innerHTML = "<p>Review not found.</p>";
  }
}

async function populateForm(reviewId) {
  const response = await fetch(` /reviews`);
  const reviews = await response.json();
  const review = reviews.find((review) => review.id === parseInt(reviewId));

  if (review) {
    document.getElementById("reviewId").value = review.id;
    document.getElementById("title").value = review.title;
    document.getElementById("author").value = review.author;
    document.getElementById("review").value = review.review;
    // Note: You might want to preload the images here if needed
  } else {
    console.error("Review not found for ID:", reviewId);
  }
}

async function handleReviewUpdate(event) {
  event.preventDefault();
  const reviewId = parseInt(document.getElementById("reviewId").value);
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const reviewText = document.getElementById("review").value;
  const cover = document.getElementById("cover").files[0];
  const fullImage = document.getElementById("fullImage").files[0];

  const formData = new FormData();
  formData.append("title", title);
  formData.append("author", author);
  formData.append("review", reviewText);
  if (cover) {
    formData.append("cover", cover);
  }
  if (fullImage) {
    formData.append("fullImage", fullImage);
  }

  await fetch(` /reviews/${reviewId}`, {
    method: "PUT",
    body: formData,
  });
  alert("Review updated successfully!");
  window.location.href = "index.html";
}

async function handleReviewFormSubmit(event) {
  event.preventDefault();
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const review = document.getElementById("review").value;
  const cover = document.getElementById("cover").files[0];
  const fullImage = document.getElementById("fullImage").files[0];

  const formData = new FormData();
  formData.append("title", title);
  formData.append("author", author);
  formData.append("review", review);
  if (cover) {
    formData.append("cover", cover);
  }
  if (fullImage) {
    formData.append("fullImage", fullImage);
  }

  await fetch(" /reviews", {
    method: "POST",
    body: formData,
  });

  window.location.href = "index.html";
}

let debounceTimer;

async function handleSearchInput(event) {
  const query = event.target.value.toLowerCase();

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const response = await fetch(" /reviews");
    const reviews = await response.json();
    const filteredReviews = reviews.filter((review) =>
      review.title.toLowerCase().includes(query)
    );
    displayReviews(filteredReviews);
  }, 300); // Adjust the delay (300ms) as necessary
}

async function editReview(id) {
  const response = await fetch(` /reviews`);
  const reviews = await response.json();
  const review = reviews.find((review) => review.id === id);

  if (review) {
    window.location.href = `form.html?id=${id}`;
  } else {
    alert("Review not found.");
  }
}

async function deleteReview(id) {
  if (confirm("Are you sure you want to delete this review?")) {
    await fetch(` /reviews/${id}`, {
      method: "DELETE",
    });
    window.location.href = "index.html";
  }
}
