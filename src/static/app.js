document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Inject styles for participants section (once)
  (function injectStyles() {
    if (document.getElementById("participants-styles")) return;
    const style = document.createElement("style");
    style.id = "participants-styles";
    style.textContent = `
      .participants-section {
        margin-top: 0.75rem;
        padding: 0.6rem 0.75rem 0.7rem;
        border-top: 1px solid #e5e5e5;
        background: linear-gradient(135deg,#fafafa,#f5f7fa);
        border-radius: 6px;
      }
      .participants-section h5 {
        margin: 0 0 0.45rem;
        font-size: 0.75rem;
        letter-spacing: .08em;
        text-transform: uppercase;
        font-weight: 600;
        color: #555;
      }
      .participants-list {
        margin: 0;
        padding-left: 1.05rem;
        list-style: disc;
        display: grid;
        gap: 0.2rem;
      }
      .participants-list li {
        font-size: 0.78rem;
        line-height: 1.05rem;
        color: #2f2f2f;
      }
      .participants-list li.empty {
        list-style: none;
        font-style: italic;
        color: #7a7a7a;
        padding-left: 0;
      }
    `;
    document.head.appendChild(style);
  })();

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // New participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const title = document.createElement("h5");
        title.textContent = "Participants";
        participantsSection.appendChild(title);

        const list = document.createElement("ul");
        list.className = "participants-list";

        if (Array.isArray(details.participants) && details.participants.length) {
          details.participants.forEach(p => {
            const li = document.createElement("li");
            li.textContent = p;
            list.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.className = "empty";
          li.textContent = "No participants yet";
          list.appendChild(li);
        }

        participantsSection.appendChild(list);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
