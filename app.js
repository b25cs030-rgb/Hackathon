// Wait for the DOM to be fully loaded before running our script
document.addEventListener("DOMContentLoaded", () => {
  // --- STATE ---
  // This is the "single source of truth" for our app
  let state = {
    // NEW: Dummy user database for login/signup
    users: [
      { id: 1, email: "student@mail.com", password: "123", role: "student" },
      { id: 2, email: "organizer@mail.com", password: "123", role: "organizer" },
    ],
    // NEW: Tracks the logged-in user. null = logged out
    currentUser: null, 
    // NEW: Controls which auth modal to show (login, signup, or null)
    authMode: 'login', // Default to showing login modal on load
    
    // NEW: Updated mock data with end dates and a mix of event times
    events: [
      {
        id: 1,
        title: "TechFest 2025",
        category: "Tech",
        date: "2025-11-20T10:00:00",
        endDate: "2025-11-20T18:00:00", // NEW
        location: "Auditorium A",
        description: "Annual technology festival featuring hackathons, tech talks, and exhibitions.",
        organizer: "Tech Club",
        registrationLink: "https://register.example.com/techfest",
        prizes: "1st Prize: $500, 2nd Prize: $300, 3rd Prize: $100",
        winners: null, // NEW
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        attendees: 245,
        ratings: [5, 4, 5, 5, 4],
        reminded: false,
      },
      {
        id: 2,
        title: "Cultural Night",
        category: "Cultural",
        date: "2025-11-18T18:00:00",
        endDate: "2025-11-18T22:00:00", // NEW
        location: "Main Stage",
        description: "Celebrate diversity with dance, music, and performances from various cultures.",
        organizer: "Cultural Committee",
        registrationLink: "https://register.example.com/cultural",
        prizes: "Best Performance: Trophy + $200",
        winners: null, // NEW
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
        attendees: 180,
        ratings: [5, 5, 4, 5],
        reminded: false,
      },
      {
        id: 3,
        title: "Startup Summit (PAST)",
        category: "Seminar",
        date: "2025-11-10T14:00:00", // Past event
        endDate: "2025-11-10T17:00:00", // NEW
        location: "Conference Hall",
        description: "Learn from successful entrepreneurs about building startups and innovation.",
        organizer: "Entrepreneurship Cell",
        registrationLink: "https://register.example.com/startup",
        prizes: "Best Pitch: Seed Funding Opportunity",
        winners: "1st: 'EcoSort', 2nd: 'QuickHealth', 3rd: 'Learnify'", // NEW
        image: "https://images.unsplash.com/photo-1559223607-a43c990e6e1e?w=800",
        attendees: 120,
        ratings: [4, 5, 5],
        reminded: false,
      },
      {
        id: 4,
        title: "Live Art Workshop (CURRENT)",
        category: "Workshop",
        date: "2025-11-16T13:00:00", // Current event (relative to Nov 16, 2:10 PM)
        endDate: "2025-11-16T16:00:00", // NEW
        location: "Art Studio 1",
        description: "Join us for a live painting and sculpting workshop.",
        organizer: "Art Club",
        registrationLink: "https://register.example.com/art",
        prizes: "Best Artwork: $150 Art Supplies",
        winners: null, // NEW
        image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800",
        attendees: 45,
        ratings: [5, 5],
        reminded: true,
      }
    ],
    filteredEvents: [],
    categories: ["All", "Tech", "Cultural", "Seminar", "Club", "Sports", "Workshop"],
    selectedCategory: "All",
    // NEW: Controls the Past / Upcoming / All filter
    selectedTimeFilter: "upcoming", // Default to "upcoming"
    searchTerm: "",
    selectedEvent: null,
    checkedIn: {},
    viewMode: "grid",
    showAddEvent: false,
  };

  // --- SELECTORS ---
  const eventListContainer = document.getElementById("event-list-container");
  const modalContainer = document.getElementById("modal-container");
  const searchInput = document.getElementById("search-input");
  const categoryFiltersContainer = document.getElementById("category-filters");
  const addEventBtn = document.getElementById("add-event-btn");
  const viewGridBtn = document.getElementById("view-grid-btn");
  const viewListBtn = document.getElementById("view-list-btn");
  // NEW: Selectors for new elements
  const authContainer = document.getElementById("auth-container");
  const timeFiltersContainer = document.getElementById("time-filters-container");


  // --- HELPER FUNCTIONS ---
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
  
  // NEW: Determines if an event is past, current, or upcoming
  function getEventStatus(event) {
    const now = new Date(); // Simulating current time: 2025-11-16T14:25:56...
    const startDate = new Date(event.date);
    const endDate = new Date(event.endDate);

    if (now > endDate) {
      return "past";
    } else if (now >= startDate && now <= endDate) {
      return "current";
    } else {
      return "upcoming";
    }
  }

  // --- STATE UPDATE & HANDLER FUNCTIONS ---
  
  // NEW: Authentication Handlers
  function handleLogin(email, password) {
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
      state.currentUser = user;
      state.authMode = null; // Close modal
      alert(`Welcome, ${user.role} ${user.email}!`);
      renderAll(); // Full re-render
    } else {
      const errorEl = document.getElementById("auth-error-msg");
      if (errorEl) {
        errorEl.textContent = "Invalid email or password.";
        errorEl.style.display = 'block';
      }
    }
  }

  function handleSignup(email, password, role) {
    if (state.users.some(u => u.email === email)) {
      const errorEl = document.getElementById("auth-error-msg");
      if (errorEl) {
        errorEl.textContent = "Email already in use.";
        errorEl.style.display = 'block';
      }
      return;
    }
    const newUser = {
      id: state.users.length + 1,
      email,
      password,
      role
    };
    state.users.push(newUser);
    state.currentUser = newUser;
    state.authMode = null; // Close modal
    alert("Account created successfully!");
    renderAll(); // Full re-render
  }

  function handleLogout() {
    state.currentUser = null;
    state.authMode = 'login'; // Show login modal on logout
    renderAll();
  }

  function handleRemindMe(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (event) {
      event.reminded = !event.reminded;
      alert(event.reminded ? "You'll be reminded about this event!" : "Reminder removed!");
      renderEventList();
      renderModals(); 
    }
  }

  function handleCheckIn(eventId) {
    state.checkedIn[eventId] = true;
    alert("Checked in successfully! Certificate will be emailed to you.");
    renderModals(); 
  }

  function handleAddRating(eventId, rating) {
    const event = state.events.find(e => e.id === eventId);
    if (event) {
      event.ratings.push(rating);
      alert("Thank you for your feedback!");
      renderEventList();
      renderModals();
    }
  }
  
  function handleAddEvent(formData) {
    const newEvent = {
      ...formData,
      id: state.events.length + 1,
      // endDate: new Date(new Date(formData.date).getTime() + 2 * 60 * 60 * 1000).toISOString(), // Assume 2h duration
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
      attendees: 0,
      ratings: [],
      reminded: false,
      winners: null,
    };
    state.events.push(newEvent);
    state.showAddEvent = false;
    alert("Event added successfully!");
    
    updateFilteredEvents();
    renderEventList();
    renderModals();
  }

  // --- CORE RENDER FUNCTIONS ---
  
  /**
   * NEW: Renders all dynamic parts of the UI
   * This is the main function to call after state changes
   */
  function renderAll() {
    // Render auth status in navbar
    renderAuthContainer();
    // Render modals (Auth modal or Event modal)
    renderModals();
    
    // If logged in, render the page content
    if (state.currentUser) {
      // Update filters and event list
      updateFilteredEvents();
      renderCategoryFilters();
      renderTimeFilters();
      renderEventList();
      // Show/hide 'Add Event' btn based on role
      if (state.currentUser.role === 'organizer') {
        addEventBtn.classList.add("visible");
      } else {
        addEventBtn.classList.remove("visible");
      }
    } else {
      // If logged out, clear the main content
      eventListContainer.innerHTML = "";
      categoryFiltersContainer.innerHTML = "";
      timeFiltersContainer.innerHTML = "";
      addEventBtn.classList.remove("visible");
    }
    
    // Update icons
    lucide.createIcons();
  }

  /**
   * Updates the state.filteredEvents array based on
   * current filters, search term, and NEW time filter.
   */
  function updateFilteredEvents() {
    let filtered = [...state.events];
    
    // 1. Filter by Time (NEW)
    if (state.selectedTimeFilter !== "all") {
      filtered = filtered.filter(e => getEventStatus(e) === state.selectedTimeFilter);
    }
    
    // 2. Filter by Category
    if (state.selectedCategory !== "All") {
      filtered = filtered.filter(e => e.category === state.selectedCategory);
    }
    
    // 3. Filter by Search Term
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
   * NEW: Renders the time filter buttons
   */
  function renderTimeFilters() {
    timeFiltersContainer.innerHTML = `
      <div class="time-filters">
        <button class="time-filter-btn ${state.selectedTimeFilter === 'upcoming' ? 'active' : ''}" data-filter="upcoming">
          Upcoming
        </button>
        <button class="time-filter-btn ${state.selectedTimeFilter === 'current' ? 'active' : ''}" data-filter="current">
          Current
        </button>
        <button class="time-filter-btn ${state.selectedTimeFilter === 'past' ? 'active' : ''}" data-filter="past">
          Past
        </button>
        <button class="time-filter-btn ${state.selectedTimeFilter === 'all' ? 'active' : ''}" data-filter="all">
          All Events
        </button>
      </div>
    `;
  }
  
  /**
   * NEW: Renders the auth state in the navbar
   */
  function renderAuthContainer() {
    if (state.currentUser) {
      authContainer.innerHTML = `
        <span class="welcome-msg">Welcome, ${state.currentUser.email} (${state.currentUser.role})</span>
        <button class="auth-btn logout-btn" data-action="logout">Logout</button>
      `;
    } else {
      authContainer.innerHTML = `
        <button class="auth-btn" data-action="show-login">Login</button>
        <button class="auth-btn" data-action="show-signup">Sign Up</button>
      `;
    }
  }

  /**
   * Renders the list of category filter buttons.
   */
  function renderCategoryFilters() {
    categoryFiltersContainer.innerHTML = '<i data-lucide="filter"></i>';
    state.categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = `category-btn ${state.selectedCategory === cat ? 'active' : ''}`;
      btn.textContent = cat;
      btn.dataset.category = cat;
      categoryFiltersContainer.appendChild(btn);
    });
    lucide.createIcons();
  }
  
  /**
   * Renders the event cards in the main list.
   * NEW: Adds status classes to cards.
   */
  function renderEventList() {
    eventListContainer.innerHTML = ""; // Clear existing list
    
    if (state.filteredEvents.length === 0) {
      eventListContainer.innerHTML = `
        <div class="no-events-found">
          <i data-lucide="calendar-off"></i>
          <h3>No events found</h3>
          <p>Try adjusting your filters or search term</p>
        </div>
      `;
    } else {
      state.filteredEvents.forEach(event => {
        const avgRating = getAverageRating(event.ratings);
        const status = getEventStatus(event); // NEW
        
        // NEW: Add status class to card
        const cardClasses = `event-card ${status}-event`; 
        
        const cardHTML = `
          <div class="${cardClasses}" data-event-id="${event.id}">
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
    
    lucide.createIcons();
  }

  /**
   * Renders ALL modals: Auth, Add Event, or Event Detail
   * NEW: Renders Auth modal. Updates Detail modal.
   */
  function renderModals() {
    modalContainer.innerHTML = ""; // Clear any existing modals
    
    // NEW: Handle blur effect on body
    if (state.authMode || state.showAddEvent || state.selectedEvent) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    // NEW: Render Auth Modal
    if (state.authMode) {
      const isLogin = state.authMode === 'login';
      modalContainer.innerHTML = `
        <div class="modal-overlay" id="auth-modal-overlay">
          <div class="modal-content modal-content-sm">
            <form id="auth-form">
              <div class="modal-header">
                <h2>${isLogin ? 'Login' : 'Sign Up'}</h2>
                </div>
              <div class="modal-body">
                <div class="modal-form">
                  <div class="form-field">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" class="form-input" required>
                  </div>
                  <div class="form-field">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" class="form-input" required>
                  </div>
                  ${!isLogin ? `
                    <div class="form-field">
                      <label>Register as:</label>
                      <div class="form-field-row">
                        <input type="radio" id="role-student" name="role" value="student" checked>
                        <label for="role-student">Student</label>
                      </div>
                      <div class="form-field-row">
                        <input type="radio" id="role-organizer" name="role" value="organizer">
                        <label for="role-organizer">Organizer</label>
                      </div>
                    </div>
                  ` : ''}
                  <div id="auth-error-msg" class="auth-error" style="display:none;"></div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="submit" class="btn btn-primary">${isLogin ? 'Login' : 'Create Account'}</button>
              </div>
            </form>
            <div class="auth-form-toggle">
              ${isLogin ? `
                Don't have an account? 
                <button data-action="toggle-auth-mode">Sign Up</button>
              ` : `
                Already have an account? 
                <button data-action="toggle-auth-mode">Login</button>
              `}
            </div>
          </div>
        </div>
      `;
    
    // Render Add Event Modal
    } else if (state.showAddEvent) {
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
                      <label for="date">Start Date & Time</label>
                      <input type="datetime-local" id="date" name="date" class="form-input" required>
                    </div>
                  </div>
                  <div class="form-grid">
                    <div class="form-field">
                      <label for="location">Location</label>
                      <input type="text" id="location" name="location" class="form-input" required>
                    </div>
                     <div class="form-field">
                      <label for="endDate">End Date & Time</label>
                      <input type="datetime-local" id="endDate" name="endDate" class="form-input" required>
                    </div>
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
                    <label for="prizes">Prizes Info</label>
                    <input type="text" id="prizes" name="prizes" class="form-input">
                  </div>
                  <div class="form-field">
                    <label for="winners">Winners Info (optional)</label>
                    <input type="text" id="winners" name="winners" class="form-input">
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
    
    // Render Event Detail Modal
    } else if (state.selectedEvent) {
      const event = state.selectedEvent;
      const avgRating = getAverageRating(event.ratings);
      const status = getEventStatus(event); // NEW
      
      // NEW: Create status badge
      let statusBadge = '';
      if (status === 'upcoming') {
        statusBadge = '<span class="detail-modal-status detail-modal-status-upcoming">Upcoming</span>';
      } else if (status === 'current') {
        statusBadge = '<span class="detail-modal-status detail-modal-status-current">Live Now</span>';
      } else {
        statusBadge = '<span class="detail-modal-status detail-modal-status-past">Past</span>';
      }
      
      // NEW: Show Winners or Prizes based on status
      let prizesOrWinnersHTML = '';
      if (status === 'past' && event.winners) {
        prizesOrWinnersHTML = `
          <div class="detail-modal-section prizes-box">
            <h3><i data-lucide="award"></i> Winners</h3>
            <p>${event.winners}</p>
          </div>
        `;
      } else if (event.prizes) {
         prizesOrWinnersHTML = `
          <div class="detail-modal-section prizes-box">
            <h3><i data-lucide="gift"></i> Prizes</h3>
            <p>${event.prizes}</p>
          </div>
        `;
      }
      
      // NEW: Disable buttons for past events
      const isPast = status === 'past';
      
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
                  ${statusBadge} 
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
              
              ${prizesOrWinnersHTML} <div class="detail-modal-actions">
                <a href="${event.registrationLink}" target="_blank" rel="noopener noreferrer" 
                   class="btn btn-primary ${isPast ? 'disabled' : ''}"> <i data-lucide="external-link"></i>
                  Register Now
                </a>
                <button class="btn btn-remind ${event.reminded ? 'active' : ''} ${isPast ? 'disabled' : ''}" 
                        data-action="remind-me" data-event-id="${event.id}"> <i data-lucide="bell"></i>
                  <span>${event.reminded ? 'Reminder Set' : 'Remind Me'}</span>
                </button>
              </div>
              
              ${state.currentUser.role === 'organizer' && !isPast ? `
                <div class="detail-modal-section qr-code-box">
                  <h3><i data-lucide="qr-code"></i> Event Check-in QR Code</h3>
                  <div class="qr-code-box-inner">
                    <div class="qr-placeholder"><i data-lucide="qr-code"></i></div>
                  </div>
                </div>
              ` : ''}
              
              ${state.currentUser.role === 'student' && status === 'current' && !state.checkedIn[event.id] ? `
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
              
              ${status !== 'upcoming' ? `
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
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }
    
    lucide.createIcons();
  }

  // --- EVENT LISTENERS ---
  
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
      renderCategoryFilters(); 
      renderEventList();
    }
  });
  
  // NEW: Time Filters
  timeFiltersContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".time-filter-btn");
    if (btn) {
      state.selectedTimeFilter = btn.dataset.filter;
      updateFilteredEvents();
      renderTimeFilters();
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
  
  // NEW: Auth buttons in Navbar
  authContainer.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]");
    if (!action) return;

    switch (action.dataset.action) {
      case "logout":
        handleLogout();
        break;
      case "show-login":
        state.authMode = 'login';
        renderModals();
        break;
      case "show-signup":
        state.authMode = 'signup';
        renderModals();
        break;
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
        // Don't close auth modal this way
        renderModals();
        break;
      case "toggle-auth-mode":
        state.authMode = state.authMode === 'login' ? 'signup' : 'login';
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
        
        const stars = e.target.closest(".rating-stars").querySelectorAll("i");
        stars.forEach((star, i) => {
          star.classList.toggle("active", i < rating);
        });
        
        handleAddRating(starEventId, rating);
        break;
    }
  });
  
  // Handle Form Submissions (Auth and Add Event)
  modalContainer.addEventListener("submit", (e) => {
    e.preventDefault();
    
    if (e.target.id === "auth-form") {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      if (state.authMode === 'login') {
        handleLogin(data.email, data.password);
      } else {
        handleSignup(data.email, data.password, data.role);
      }
    }
    
    if (e.target.id === "add-event-form") {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      if (!data.title || !data.date || !data.endDate || !data.location || !data.description || !data.organizer || !data.registrationLink) {
        alert("Please fill in all required fields");
        return;
      }
      
      handleAddEvent(data);
    }
  });

  // --- INITIALIZATION ---
  function initializeApp() {
    // On load, show the login modal and render the page
    renderAll();
  }

  initializeApp();
});