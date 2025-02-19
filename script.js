document.addEventListener("DOMContentLoaded", async () => {
  const API_URL =
    "https://crudcrud.com/api/ca0b9509ac3f4e01abca8e0fc96f71bb/feedbacks";

  const form = document.getElementById("feedback-form");
  const nameInput = document.getElementById("name");
  const ratingSelect = document.getElementById("rating");
  const submitButton = document.getElementById("submit-button");
  const feedbackList = document.getElementById("feedback-list");

  const ratingCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let editingFeedback = null; // Stores feedback object if editing

  // **🔹 Fetch and Display Existing Feedbacks**
  async function fetchFeedbacks() {
    try {
      const response = await axios.get(API_URL);
      feedbackList.innerHTML = "";
      Object.keys(ratingCounts).forEach((key) => (ratingCounts[key] = 0));

      response.data.forEach((feedback) => {
        addFeedback(feedback);
        ratingCounts[feedback.rating]++;
      });

      updateRating();
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  }

  // **🔹 Add Feedback to DOM**
  function addFeedback(feedback) {
    const feedbackDiv = document.createElement("div");
    feedbackDiv.classList.add("feedback");
    feedbackDiv.dataset.id = feedback._id; // CRUD CRUD ID

    feedbackDiv.innerHTML = `
      <div>
        <strong>${feedback.name}</strong> - Rating: ${feedback.rating}
      </div>
      <div class="feedback-actions">
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </div>
    `;

    feedbackList.appendChild(feedbackDiv);
  }

  // **🔹 Update Rating Display**
  function updateRating() {
    document
      .querySelectorAll("#overall-ratings div span:nth-child(2)")
      .forEach((span, index) => {
        span.textContent = ratingCounts[index + 1];
      });
  }

  // **🔹 Handle Form Submission**
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const rating = parseInt(ratingSelect.value);

    if (!name) {
      alert("Please enter your name.");
      return;
    }

    try {
      if (editingFeedback) {
        // **UPDATE existing feedback**
        await axios.put(`${API_URL}/${editingFeedback._id}`, { name, rating });

        ratingCounts[editingFeedback.rating]--; // Decrease old rating count
        ratingCounts[rating]++; // Increase new rating count

        editingFeedback = null;
        submitButton.textContent = "SUBMIT";
      } else {
        // **CREATE new feedback**
        const response = await axios.post(API_URL, { name, rating });

        addFeedback(response.data);
        ratingCounts[rating]++;
      }

      updateRating();
      form.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  });

  // **🔹 Handle Edit/Delete Actions**
  feedbackList.addEventListener("click", async (e) => {
    const feedbackDiv = e.target.closest(".feedback");
    const feedbackId = feedbackDiv.dataset.id;

    if (e.target.classList.contains("edit")) {
      // **EDIT Feedback**
      const feedbackText = feedbackDiv.querySelector("div").textContent;
      const [name, rating] = feedbackText
        .match(/(.+) - Rating: (\d+)/)
        .slice(1, 3);

      nameInput.value = name.trim();
      ratingSelect.value = rating;
      submitButton.textContent = "EDIT FEEDBACK";

      editingFeedback = { _id: feedbackId, name, rating };
    } else if (e.target.classList.contains("delete")) {
      // **DELETE Feedback**
      try {
        await axios.delete(`${API_URL}/${feedbackId}`);
        ratingCounts[
          feedbackDiv.querySelector("div").textContent.match(/(\d+)/)[0]
        ]--; // Decrease count
        feedbackDiv.remove();
        updateRating();
      } catch (error) {
        console.error("Error deleting feedback:", error);
      }
    }
  });

  // **Fetch existing feedbacks when page loads**
  fetchFeedbacks();
});
