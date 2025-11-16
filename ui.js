// Wait for the DOM to be fully loaded before running our script
document.addEventListener("DOMContentLoaded", () => {
  // --- STATE ---
  // This is the "single source of truth" for our app,
  // just like React's useState
  let state = {
    events: [
      {
        id: 1,
        title: "TechFest 2025",
        category: "Tech",
        date: "2025-11-20T10:00:00",
        location: "Auditorium A",
        description: "Annual technology festival featuring hackathons, tech talks, and exhibitions.",
        organizer: "Tech Club",
        registrationLink: "https://register.example.com/techfest",
        prizes: "1st Prize: $500, 2nd Prize: $300, 3rd Prize: $100",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        attendees: 245,
        ratings: [5, 4, 5, 5, 4],
        reminded: false,
        status: "upcoming",
      },
      {
        id: 2,
        title: "Cultural Night",
        category: "Cultural",
        date: "2025-11-18T18:00:00",
        location: "Main Stage",
        description: "Celebrate diversity with dance, music, and performances from various cultures.",
        organizer: "Cultural Committee",
        registrationLink: "https://register.example.com/cultural",
        prizes: "Best Performance: Trophy + $200",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
        attendees: 180,
        ratings: [5, 5, 4, 5],
        reminded: false,
        status: "upcoming",
      },
      {
        id: 3,
        title: "Startup Summit",
        category: "Seminar",
        date: "2025-11-22T14:00:00",
        location: "Conference Hall",
        description: "Learn from successful entrepreneurs about building startups and innovation.",
        organizer: "Entrepreneurship Cell",
        registrationLink: "https://register.example.com/startup",
        prizes: "Best Pitch: Seed Funding Opportunity",
        image: "https://images.unsplash.com/photo-1559223607-a43c990e6e1e?w=800",
        attendees: 120,
        ratings: [4, 5, 5],
        reminded: false,
        status: "upcoming",
      }
    ],
    filteredEvents: [],
    categories: ["All", "Tech", "Cultural", "Seminar", "Club", "Sports", "Workshop"],
    selectedCategory: "All",
    searchTerm: "",
    selectedEvent: null,
    userRole: "student",
    checkedIn: {},
    viewMode: "grid",
    showAddEvent: false,
  };

  // --- SELECTORS ---
  // Get references to the DOM elements we'll interact with
  const eventListContainer = document.getElementById("event-list-container");
  const modalContainer = document.getElementById("modal-container");
  const searchInput = document.getElementById("search-input");
  const categoryFiltersContainer = document.getElementById("category-filters");
  const userRoleSelect = document.getElementById("user-role-select");
  const addEventBtn = document.getElementById("add-event-btn");
  const viewGridBtn = document.getElementById("view-grid-btn");
  const viewListBtn = document.getElementById("view-list-btn");

  // --- HELPER FUNCTIONS ---
  // (These are mostly the same as in your React code)
  const getAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };
  
  // --- STATE UPDATE & HANDLER FUNCTIONS ---
  // These functions modify the 'state' object and then
  // call render functions to update the UI
  
  function handleRemindMe(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (event) {
      event.reminded = !event.reminded;
      alert(event.reminded ? "You'll be reminded about this event!" : "Reminder removed!");
      // Re-render both list and modal
      renderEventList();
      renderModals(); 
    }
  }

  function handleCheckIn(eventId) {
    state.checkedIn[eventId] = true;
    alert("Checked in successfully! Certificate will be emailed to you.");
    renderModals(); // Re-render modal to show "Checked In" message
  }

  function handleAddRating(eventId, rating) {
    const event = state.events.find(e => e.id === eventId);
    if (event) {
      event.ratings.push(rating);
      alert("Thank you for your feedback!");
      // Re-render both list and modal
      renderEventList();
      renderModals();
    }
  }
  
  function handleAddEvent(formData) {
    const newEvent = {
      ...formData,
      id: state.events.length + 1,
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
      attendees: 0,
      ratings: [],
      reminded: false,
      status: "upcoming",
    };
    state.events.push(newEvent);
    state.showAddEvent = false;
    alert("Event added successfully!");
    
    // Update UI
    updateFilteredEvents();
    renderEventList();
    renderModals();
  }

  // --- CORE RENDER FUNCTIONS ---
  // These functions read the 'state' and generate HTML
  
  /**
   * Updates the state.filteredEvents array based on
   * current filters and search term. (Like React's useEffect)
   */
  function updateFilteredEvents() {
    let filtered = [...state.events];
    
    if (state.selectedCategory !== "All") {
      filtered = filtered.filter(e => e.category === state.selectedCategory);
    }
    
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term)
      );
    }
    
    state.filteredEvents = filtered;
  }

  /**
   * Renders the list of category filter buttons.
   */
  function renderCategoryFilters() {
    categoryFiltersContainer.innerHTML = '<i data-lucide="filter"></i>'; // Reset
    state.categories.forEach(cat => {
      const btn = document.createElement("button");
      // Use backticks (`) to create a template literal
      btn.className = `category-btn ${state.selectedCategory === cat ? 'active' : ''}`;
      btn.textContent = cat;
      btn.dataset.category = cat;
      categoryFiltersContainer.appendChild(btn);
    });
  }
  
  /**
   * Renders the event cards in the main list.
   */
  function renderEventList() {
    eventListContainer.innerHTML = ""; // Clear existing list
    
    if (state.filteredEvents.length === 0) {
      eventListContainer.innerHTML = `
        <div class="no-events-found">
          <i data-lucide="calendar"></i>
          <h3>No events found</h3>
          <p>Try adjusting your filters or search term</p>
        </div>
      `;
    } else {
      state.filteredEvents.forEach(event => {
        const avgRating = getAverageRating(event.ratings);
        const cardHTML = `
          <div class="event-card" data-event-id="${event.id}">
            <div class="event-card-image-wrapper">
              <img src="${event.image}" alt="${event.title}" class="event-card-image">
              <span class="event-card-category">${event.category}</span>
            </div>
            <div class="event-card-content">
              <h3 class="event-card-title">${event.title}</h3>
              <p class="event-card-description">${event.description}</p>
              <div class="event-card-info">
                <div class="info-item">
                  <i data-lucide="clock"></i>
                  <span>${formatDate(event.date)}</span>
                </div>
                <div class="info-item">
                  <i data-lucide="map-pin"></i>
                  <span>${event.location}</span>
                </div>
                <div class="info-item">
                  <i data-lucide="users"></i>
                  <span>${event.attendees} attending</span>
                </div>
              </div>
              <div class="event-card-footer">
                <div class="rating">
                  <i data-lucide="star"></i>
                  <span class="rating-avg">${avgRating}</span>
                  <span class="rating-count">(${event.ratings.length})</span>
                </div>
                ${event.reminded ? '<div class="event-card-reminded"><i data-lucide="bell"></i></div>' : ''}
              </div>
            </div>
          </div>
        `;
        eventListContainer.innerHTML += cardHTML;
      });
    }
    
    // After updating HTML, tell Lucide to render the icons
    lucide.createIcons();
  }

  /**
   * Renders the Add Event or Event Detail modal based on state.
   */
  function renderModals() {
    modalContainer.innerHTML = ""; // Clear any existing modals
    
    if (state.showAddEvent) {
      modalContainer.innerHTML = `
        <div class="modal-overlay" id="add-event-modal-overlay">
          <div class="modal-content">
            <form id="add-event-form">
              <div class="modal-header">
                <h2>Add New Event</h2>
                <button type="button" class="modal-close-btn" data-action="close-modal">
                  <i data-lucide="x"></i>
                </button>
              </div>
              <div class="modal-body">
                <div class="modal-form">
                  <div class="form-field">
                    <label for="title">Event Title</label>
                    <input type="text" id="title" name="title" class="form-input" required>
                  </div>
                  <div class="form-grid">
                    <div class="form-field">
                      <label for="category">Category</label>
                      <select id="category" name="category" class="form-select">
                        ${state.categories.filter(c => c !== "All").map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                      </select>
                    </div>
                    <div class="form-field">
                      <label for="date">Date & Time</label>
                      <input type="datetime-local" id="date" name="date" class="form-input" required>
                    </div>
                  </div>
                  <div class="form-field">
                    <label for="location">Location</label>
                    <input type="text" id="location" name="location" class="form-input" required>
                  </div>
                  <div class="form-field">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="3" class="form-textarea" required></textarea>
                  </div>
                  <div class="form-field">
                    <label for="organizer">Organizer</label>
                    <input type="text" id="organizer" name="organizer" class="form-input" required>
                  </div>
                  <div class="form-field">
                    <label for="registrationLink">Registration Link</label>
                    <input type="url" id="registrationLink" name="registrationLink" class="form-input" required>
                  </div>
                  <div class="form-field">
                    <label for="prizes">Prizes/Winners Info</label>
                    <input type="text" id="prizes" name="prizes" class="form-input">
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="submit" class="btn btn-primary">Add Event</button>
                <button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      `;
    } else if (state.selectedEvent) {
      const event = state.selectedEvent;
      const avgRating = getAverageRating(event.ratings);
      modalContainer.innerHTML = `
        <div class="modal-overlay" id="detail-modal-overlay">
          <div class="modal-content modal-content-lg">
            <div style="position: relative;">
              <img src="${event.image}" alt="${event.title}" class="detail-modal-image">
              <button class="modal-close-btn" data-action="close-modal" style="position: absolute; top: 1rem; right: 1rem; background: white; border-radius: 99px; padding: 0.5rem; box-shadow: var(--shadow-lg);">
                <i data-lucide="x"></i>
              </button>
            </div>
            
            <div class="modal-body">
              <div class="detail-modal-header">
                <div>
                  <h2 class="detail-modal-title">${event.title}</h2>
                  <span class="detail-modal-category">${event.category}</span>
                </div>
                <div class="detail-modal-rating">
                  <i data-lucide="star"></i>
                  <span class="detail-modal-rating-avg">${avgRating}</span>
                  <span class="detail-modal-rating-count">(${event.ratings.length})</span>
                </div>
              </div>
              
              <div class="detail-modal-info-grid">
                <div class="detail-modal-info-item"><i data-lucide="clock"></i><span>${formatDate(event.date)}</span></div>
                <div class="detail-modal-info-item"><i data-lucide="map-pin"></i><span>${event.location}</span></div>
                <div class="detail-modal-info-item"><i data-lucide="users"></i><span>${event.attendees} attendees</span></div>
                <div class="detail-modal-info-item"><i data-lucide="calendar"></i><span>Organized by ${event.organizer}</span></div>
              </div>
              
              <div class="detail-modal-section">
                <h3>About This Event</h3>
                <p>${event.description}</p>
              </div>
              
              ${event.prizes ? `
                <div classs="detail-modal-section prizes-box">
                  <h3><i data-lucide="award"></i>Prizes & Winners</h3>
                  <p>${event.prizes}</p>
                </div>` : ''
              }
              
              <div class="detail-modal-actions">
                <a href="${event.registrationLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                  <i data-lucide="external-link"></i>
                  Register Now
                </a>
                <button class="btn btn-remind ${event.reminded ? 'active' : ''}" data-action="remind-me" data-event-id="${event.id}">
                  <i data-lucide="bell"></i>
                  <span>${event.reminded ? 'Reminder Set' : 'Remind Me'}</span>
                </button>
              </div>
              
              ${state.userRole === 'organizer' ? `
                <div class="detail-modal-section qr-code-box">
                  <h3><i data-lucide="qr-code"></i> Event Check-in QR Code</h3>
                  <div class="qr-code-box-inner">
                    <div class="qr-placeholder"><i data-lucide="qr-code"></i></div>
                  </div>
                  <p style="font-size: 0.875rem; color: var(--color-gray-600); margin-top: 0.5rem;">Show this QR code for attendee check-ins</p>
                </div>
              ` : ''}
              
              ${state.userRole === 'student' && !state.checkedIn[event.id] ? `
                <button class="btn btn-primary" style="width: 100%; background-color: var(--color-green-600);" data-action="check-in" data-event-id="${event.id}">
                  <i data-lucide="qr-code"></i>
                  Check In (Scan QR)
                </button>
              ` : ''}
              
              ${state.checkedIn[event.id] ? `
                <div class="checked-in-box">
                  <p>✓ Checked in! Certificate sent to your email.</p>
                </div>
              ` : ''}
              
              <div class="detail-modal-section" style="border-top: 1px solid var(--color-gray-200); padding-top: 1.5rem; margin-top: 1.5rem;">
                <h3>Rate This Event</h3>
                <div class="rating-stars" data-event-id="${event.id}">
                  ${[1, 2, 3, 4, 5].map(rating => `
                    <button data-action="rate" data-rating="${rating}">
                      <i data-lucide="star"></i>
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Render icons for the new modal content
    lucide.createIcons();
  }

  // --- EVENT LISTENERS ---
  // Connect user actions to our handler functions
  
  // Search
  searchInput.addEventListener("input", (e) => {
    state.searchTerm = e.target.value;
    updateFilteredEvents();
    renderEventList();
  });

  // Category Filters
  categoryFiltersContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".category-btn");
    if (btn) {
      state.selectedCategory = btn.dataset.category;
      updateFilteredEvents();
      renderCategoryFilters(); // Re-render buttons to show active state
      renderEventList();
    }
  });

  // View Mode
  viewGridBtn.addEventListener("click", () => {
    state.viewMode = "grid";
    eventListContainer.className = "grid-view";
    viewGridBtn.classList.add("active");
    viewListBtn.classList.remove("active");
  });
  
  viewListBtn.addEventListener("click", () => {
    state.viewMode = "list";
    eventListContainer.className = "list-view";
    viewListBtn.classList.add("active");
    viewGridBtn.classList.remove("active");
  });

  // User Role
  userRoleSelect.addEventListener("change", (e) => {
    state.userRole = e.target.value;
    // Show/hide "Add Event" button
    if (state.userRole === "organizer") {
      addEventBtn.classList.add("visible");
    } else {
      addEventBtn.classList.remove("visible");
    }
    // If a detail modal is open, re-render it to show/hide organizer content
    if (state.selectedEvent) {
      renderModals();
    }
  });

  // Show "Add Event" Modal
  addEventBtn.addEventListener("click", () => {
    state.showAddEvent = true;
    renderModals();
  });

  // Open Event Detail Modal
  eventListContainer.addEventListener("click", (e) => {
    const card = e.target.closest(".event-card");
    if (card) {
      const eventId = parseInt(card.dataset.eventId, 10);
      state.selectedEvent = state.events.find(e => e.id === eventId);
      renderModals();
    }
  });

  // Handle all clicks inside the modal container (Event Delegation)
  modalContainer.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]");
    if (!action) return;

    const eventId = parseInt(action.dataset.eventId, 10);

    switch (action.dataset.action) {
      case "close-modal":
        state.selectedEvent = null;
        state.showAddEvent = false;
        renderModals();
        break;
      case "remind-me":
        handleRemindMe(eventId);
        break;
      case "check-in":
        handleCheckIn(eventId);
        break;
      case "rate":
        const rating = parseInt(action.dataset.rating, 10);
        const starEventId = parseInt(e.target.closest(".rating-stars").dataset.eventId, 10);
        
        // Update stars UI immediately
        const stars = e.target.closest(".rating-stars").querySelectorAll("i");
        stars.forEach((star, i) => {
          if (i < rating) {
            star.classList.add("active");
          } else {
            star.classList.remove("active");
          }
        });
        
        handleAddRating(starEventId, rating);
        break;
    }
  });
  
  // Handle "Add Event" Form Submission
  modalContainer.addEventListener("submit", (e) => {
    if (e.target.id === "add-event-form") {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      // Basic validation (same as React)
      if (!data.title || !data.date || !data.location || !data.description || !data.organizer || !data.registrationLink) {
        alert("Please fill in all required fields");
        return;
      }
      
      handleAddEvent(data);
    }
  });

  // --- INITIALIZATION ---
  // Run this when the page first loads
  function initializeApp() {
    // Set initial filtered events
    updateFilteredEvents();
    // Render the category buttons
    renderCategoryFilters();
    // Render the initial event list
    renderEventList();
    // Set initial button state
    viewGridBtn.classList.add("active");
    // Call Lucide to render any static icons
    lucide.createIcons();
  }

  initializeApp();
});