const apiKey = "69d95786407649b482c2fdc1863e0a66";
const apiBaseUrl = `https://crudcrud.com/api/${apiKey}/feedback`;
let currentEditId = null;

// Load data on page load
window.onload = function () {
    loadFeedbackData();
};

// Load feedback data from API
function loadFeedbackData() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('feedback-list').innerHTML = '';

    axios.get(apiBaseUrl)
        .then(response => {
            updateUI(response.data);
            document.getElementById('loading').style.display = 'none';
        })
        .catch(error => {
            console.error('Error loading feedback data:', error);
            document.getElementById('loading').style.display = 'none';
            let errorMessage = 'Error loading feedback data.';
            if (error.response && error.response.status === 404) {
                errorMessage = 'API key invalid or endpoint not found. Please check your API key.';
            }

            document.getElementById('feedback-list').innerHTML =
                `<div class="error" style="display:block">${errorMessage}</div>`;
        });
}

// Submit feedback
function submitFeedback() {
    const nameInput = document.getElementById('name');
    const ratingInput = document.getElementById('rating');
    const name = nameInput.value.trim();
    const rating = parseInt(ratingInput.value);

    if (!name) {
        showError('submit-error', 'Please enter your name');
        return;
    }

    document.getElementById('submit-btn').disabled = true;
    document.getElementById('submit-error').style.display = 'none';

    if (currentEditId) {
        // Update existing feedback
        const feedbackData = {
            name: name,
            rating: rating,
            date: new Date().toISOString()
        };

        axios.put(`${apiBaseUrl}/${currentEditId}`, feedbackData)
            .then(() => {
                // Reset form and update UI
                resetForm();
                loadFeedbackData();
            })
            .catch(error => {
                console.error('Error updating feedback:', error);
                showError('submit-error', 'Error updating feedback. Please try again.');
                document.getElementById('submit-btn').disabled = false;
            });
    } else {
        // Add new feedback
        const newFeedback = {
            name: name,
            rating: rating,
            date: new Date().toISOString()
        };

        axios.post(apiBaseUrl, newFeedback)
            .then(() => {
                // Reset form and update UI
                resetForm();
                loadFeedbackData();
            })
            .catch(error => {
                console.error('Error submitting feedback:', error);
                showError('submit-error', 'Error submitting feedback. Please try again.');
                document.getElementById('submit-btn').disabled = false;
            });
    }
}

// Update UI with current data
function updateUI(feedbackData) {
    // Update rating counts
    const counts = [0, 0, 0, 0, 0]; // For ratings 1-5

    feedbackData.forEach(item => {
        counts[item.rating - 1]++;
    });

    for (let i = 1; i <= 5; i++) {
        document.getElementById(`star${i}-count`).textContent = counts[i - 1];
    }

    // Update feedback list
    const feedbackList = document.getElementById('feedback-list');
    feedbackList.innerHTML = '';

    if (feedbackData.length === 0) {
        feedbackList.innerHTML = '<p>No feedback submitted yet.</p>';
        return;
    }

    // Sort feedback by date (newest first)
    feedbackData.sort((a, b) => new Date(b.date) - new Date(a.date));

    feedbackData.forEach(item => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item';
        if (item._id === currentEditId) {
            feedbackItem.classList.add('edit-mode');
        }

        const date = new Date(item.date).toLocaleString();

        feedbackItem.innerHTML = `
                    <div class="feedback-content">
                        <p><strong>${item.name}</strong> - 
                        <span class="stars">${'★'.repeat(item.rating)}</span>
                        <span class="stars" style="color: #ccc;">${'★'.repeat(5 - item.rating)}</span>
                        </p>
                        <p><small>Submitted: ${date}</small></p>
                    </div>
                    <div class="feedback-actions">
                        <button class="update" onclick="editFeedback('${item._id}')">Edit</button>
                        <button class="delete" onclick="deleteFeedback('${item._id}')">Delete</button>
                    </div>
                `;

        feedbackList.appendChild(feedbackItem);
    });

    document.getElementById('submit-btn').disabled = false;
}

// Edit feedback
function editFeedback(id) {
    document.getElementById('submit-error').style.display = 'none';
    document.getElementById('loading').style.display = 'block';

    axios.get(`${apiBaseUrl}/${id}`)
        .then(response => {
            const feedback = response.data;
            document.getElementById('name').value = feedback.name;
            document.getElementById('rating').value = feedback.rating;
            document.getElementById('form-title').textContent = 'Edit Feedback';
            document.getElementById('submit-btn').textContent = 'Update Feedback';
            document.getElementById('cancel-btn').style.display = 'inline-block';

            currentEditId = id;
            document.getElementById('loading').style.display = 'none';

            // Highlight the current item being edited
            loadFeedbackData();

            // Scroll to form
            document.querySelector('.feedback-form').scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error getting feedback details:', error);
            document.getElementById('loading').style.display = 'none';
            showError('submit-error', 'Error retrieving feedback details. Please try again.');
        });
}

// Cancel edit mode
function cancelEdit() {
    resetForm();
    loadFeedbackData();
}

// Reset form
function resetForm() {
    document.getElementById('name').value = '';
    document.getElementById('rating').value = '1';
    document.getElementById('form-title').textContent = 'Submit Your Feedback';
    document.getElementById('submit-btn').textContent = 'Submit Feedback';
    document.getElementById('cancel-btn').style.display = 'none';
    document.getElementById('submit-error').style.display = 'none';

    currentEditId = null;
}

// Delete feedback
function deleteFeedback(id) {
    if (confirm('Are you sure you want to delete this feedback?')) {
        document.getElementById('loading').style.display = 'block';

        axios.delete(`${apiBaseUrl}/${id}`)
            .then(() => {
                if (currentEditId === id) {
                    resetForm();
                }
                loadFeedbackData();
            })
            .catch(error => {
                console.error('Error deleting feedback:', error);
                document.getElementById('loading').style.display = 'none';
                showError('submit-error', 'Error deleting feedback. Please try again.');
            });
    }
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}