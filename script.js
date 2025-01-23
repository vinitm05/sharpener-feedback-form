document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("feedback-form");
  const nameInput = document.getElementById("name");
  const ratingSelect = document.getElementById("rating");
  const submitButton = document.getElementById("submit-button");
  const feedbackList = document.getElementById("feedback-list");
  const ratingCounts = Array.from(
    document.querySelectorAll("#overall-ratings div span:nth-child(2)")
  );

  let editingFeedbackId = null;
  let editingOldRating = null;
  const addFeedbackToDOM = (feedback) => {
    const feedbackDiv = document.createElement("div");
    feedbackDiv.classList.add("feedback");
    feedbackDiv.dataset.id = feedback._id || Date.now();

    feedbackDiv.innerHTML = `
      <div>
        ${feedback.name} ${feedback.rating}
      </div>
      <div class="feedback-actions">
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </div>
    `;

    feedbackList.appendChild(feedbackDiv);
  };
  const updateRatingCount = (rating, change) => {
    const ratingIndex = parseInt(rating) - 1;
    const currentCount = parseInt(ratingCounts[ratingIndex].textContent);
    ratingCounts[ratingIndex].textContent = currentCount + change;
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const rating = ratingSelect.value;

    if (!name) {
      alert("Please enter your name.");
      return;
    }

    if (editingFeedbackId) {
      const feedbackDiv = document.querySelector(
        `.feedback[data-id="${editingFeedbackId}"]`
      );
      const oldRating = editingOldRating;
      updateRatingCount(oldRating, -1);
      updateRatingCount(rating, 1);
      feedbackDiv.querySelector(
        "div"
      ).textContent = `${name} ${rating}`;
      editingFeedbackId = null;
      editingOldRating = null;
      submitButton.textContent = "SUBMIT";
    } else {
      const feedback = { name, rating, _id: Date.now() };
      addFeedbackToDOM(feedback);
      updateRatingCount(rating, 1);
    }
    form.reset();
  });
  feedbackList.addEventListener("click", (e) => {
    const feedbackDiv = e.target.closest(".feedback");
    const feedbackId = feedbackDiv.dataset.id;

    if (e.target.classList.contains("edit")) {
      const feedbackText = feedbackDiv.querySelector("div").textContent;
      const [name, rating] = feedbackText
        .match(/(.+) (\d+)/)
        .slice(1, 3);

      nameInput.value = name.trim();
      ratingSelect.value = rating;
      submitButton.textContent = "EDIT RATING";

      editingFeedbackId = feedbackId;
      editingOldRating = rating;
    } else if (e.target.classList.contains("delete")) {
      const feedbackText = feedbackDiv.querySelector("div").textContent;
      const rating = feedbackText.match(/ (\d+)/)[1];

      updateRatingCount(rating, -1);
      feedbackDiv.remove();
    }
  });
  feedbackList.innerHTML = "";
  ratingCounts.forEach((count) => (count.textContent = "0"));
});
