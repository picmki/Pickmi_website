// PickMi Cab Booking Website - Main Application Controller
// Aligned with Product & UX Documentation v1.0

import { LOCATION_MASTER, VEHICLE_CATEGORIES, RENTAL_PACKAGES, PROMO_CODES, FAQS } from './data.js';
import { store } from './store.js';

class PickMiApp {
  constructor() {
    this.currentView = 'home';
    this.activeTripDetail = null;
    this.otpTimerInterval = null;
    this.generatedOtp = '4829';
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupServiceTabs();
    this.setupAutocomplete();
    this.setupSearchForm();
    this.setupModals();
    this.setupStoreListeners();
    this.updateUserUI();
    this.setupHeaderScroll();
    this.setupDrivePartnerPage();

    // Handle browser hash routing
    window.addEventListener('hashchange', () => this.handleHashChange());
    if (window.location.hash) {
      this.handleHashChange();
    } else {
      this.showView('home');
    }
  }

  setupHeaderScroll() {
    const header = document.querySelector('.app-header');
    if (!header) return;
    const handleScroll = () => {
      if (window.scrollY > 8) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  setupStoreListeners() {
    store.subscribe((event, data) => {
      if (event === 'user_logged_in' || event === 'user_logged_out' || event === 'user_updated') {
        this.updateUserUI();
      }
      if (event === 'booking_created') {
        this.showToast(`Booking ${data.id} Confirmed! Driver assigned.`);
      }
      if (event === 'booking_cancelled') {
        this.showToast(`Booking ${data.id} cancelled. Refund of ₹${data.refundAmount} initiated.`);
      }
    });
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  updateUserUI() {
    const userWrap = document.getElementById('header-user-wrap');
    const userBadge = document.getElementById('header-user-badge');
    const userNameSpan = document.getElementById('header-user-name');
    const userAvatarCircle = document.getElementById('header-user-avatar');
    const myBookingsBtn = document.getElementById('btn-my-bookings-header');
    const desktopNav = document.querySelector('.desktop-nav');
    const userDropdown = document.getElementById('user-profile-dropdown');

    if (store.user && store.user.isLoggedIn) {
      document.body.classList.add('user-logged-in');
      if (desktopNav) desktopNav.style.display = 'flex';

      const initials = (store.user.name || 'KP').split(' ').map(n => n[0]).join('').slice(0, 2);
      if (userNameSpan) userNameSpan.textContent = store.user.name;
      if (userAvatarCircle) userAvatarCircle.textContent = initials;

      const dropdownName = document.getElementById('dropdown-user-name');
      const dropdownPhone = document.getElementById('dropdown-user-phone');
      if (dropdownName) dropdownName.textContent = store.user.name;
      if (dropdownPhone) dropdownPhone.textContent = store.user.mobile || '+91 98401 23456';

      // Toggle dropdown on user profile click
      if (userBadge) {
        userBadge.onclick = (e) => {
          e.stopPropagation();
          const isOpen = userDropdown && userDropdown.style.display === 'block';
          if (userDropdown) {
            userDropdown.style.display = isOpen ? 'none' : 'block';
          }
          if (userWrap) {
            userWrap.classList.toggle('open', !isOpen);
          }
        };
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (userWrap && !userWrap.contains(e.target)) {
          if (userDropdown) userDropdown.style.display = 'none';
          userWrap.classList.remove('open');
        }
      });

      // Show "My Bookings" button only when logged in (Requested by user)
      if (myBookingsBtn) {
        myBookingsBtn.style.display = 'inline-flex';
      }
    } else {
      document.body.classList.remove('user-logged-in');
      if (desktopNav) desktopNav.style.display = 'flex';
      if (userDropdown) userDropdown.style.display = 'none';
      if (userWrap) userWrap.classList.remove('open');

      if (userNameSpan) userNameSpan.textContent = 'Login / Sign Up';
      if (userAvatarCircle) userAvatarCircle.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      `;
      if (userBadge) {
        userBadge.onclick = () => this.openLoginModal();
      }
      // Hide "My Bookings" button when logged out (Requested by user)
      if (myBookingsBtn) {
        myBookingsBtn.style.display = 'none';
      }
    }

    // Wire dropdown menu items
    document.getElementById('item-manage-account')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (userDropdown) userDropdown.style.display = 'none';
      if (userWrap) userWrap.classList.remove('open');
      this.navigateTo('account', 'profile');
    });

    document.getElementById('item-my-bookings')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (userDropdown) userDropdown.style.display = 'none';
      if (userWrap) userWrap.classList.remove('open');
      this.navigateTo('account', 'trips');
    });

    document.getElementById('item-dropdown-help')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (userDropdown) userDropdown.style.display = 'none';
      if (userWrap) userWrap.classList.remove('open');
      this.navigateTo('account', 'support');
    });

    document.getElementById('item-pickmi-business')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (userDropdown) userDropdown.style.display = 'none';
      if (userWrap) userWrap.classList.remove('open');
      document.getElementById('business-modal')?.classList.add('open');
    });
  }

  // Navigation & Routing
  navigateTo(viewId, param = null) {
    window.location.hash = param ? `#${viewId}/${param}` : `#${viewId}`;
  }

  handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    const [view, param] = hash.split('/');

    if (view === 'trip-detail' && param) {
      this.showTripDetailView(param);
    } else if (['home', 'results', 'checkout', 'confirmation', 'trips', 'account', 'offers', 'support', 'drive', 'policy'].includes(view)) {
      this.showView(view, param);
    } else {
      this.showView('home');
    }
  }

  showView(viewName, param = null) {
    this.currentView = viewName;
    document.querySelectorAll('.app-view').forEach(el => el.style.display = 'none');

    const targetEl = document.getElementById(`view-${viewName}`);
    if (targetEl) {
      targetEl.style.display = 'block';
      window.scrollTo(0, 0);
    }

    // Toggle dedicated results header state (replaces app-header on results view)
    if (viewName === 'results') {
      document.body.classList.add('results-view-active');
    } else {
      document.body.classList.remove('results-view-active');
    }

    // Toggle checkout view state for fixed bottom bar & hiding mobile bottom nav
    if (viewName === 'checkout') {
      document.body.classList.add('checkout-view-active');
    } else {
      document.body.classList.remove('checkout-view-active');
    }

    // Toggle trip-detail view state to hide footer
    if (viewName === 'trip-detail') {
      document.body.classList.add('trip-detail-view-active');
    } else {
      document.body.classList.remove('trip-detail-view-active');
    }

    // Update nav links active states
    document.querySelectorAll('.nav-link, .mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    if (viewName === 'results') {
      this.renderVehicleResults();
    } else if (viewName === 'checkout') {
      this.renderCheckoutPage();
    } else if (viewName === 'confirmation') {
      this.renderConfirmationPage(this.lastBooking || store.getLastBooking());
    } else if (viewName === 'trips') {
      this.renderAccountPage('trips');
    } else if (viewName === 'account') {
      this.renderAccountPage(param || 'profile');
    } else if (viewName === 'offers') {
      this.renderOffersPage();
    } else if (viewName === 'support') {
      this.renderSupportPage();
    } else if (viewName === 'drive') {
      this.setupDrivePartnerPage();
    }
  }

  setupNavigation() {
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = el.dataset.nav;
        this.navigateTo(targetView);
      });
    });

    // Mobile drawer toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');

    if (mobileMenuBtn && mobileDrawer) {
      mobileMenuBtn.onclick = () => mobileDrawer.classList.add('open');
      if (closeDrawerBtn) closeDrawerBtn.onclick = () => mobileDrawer.classList.remove('open');
      mobileDrawer.querySelectorAll('a').forEach(link => {
        link.onclick = () => mobileDrawer.classList.remove('open');
      });
    }
  }

  // Trip Mode Pill Switcher (One-way, Round-trip, Rental - Matching Benchmark)
  setupServiceTabs() {
    const tripPills = document.querySelectorAll('.hero-trip-pill');
    const dynamicHeading = document.getElementById('hero-dynamic-heading');
    const rentalWrap = document.getElementById('hero-rental-package-wrap');
    const returnDateWrapper = document.getElementById('return-date-wrapper');
    const inputsGrid = document.querySelector('.booking-card-inputs-grid');
    const inputPickup = document.getElementById('input-pickup');
    const inputDrop = document.getElementById('input-drop');
    const swapBtn = document.getElementById('swap-locations-btn');
    const clearFromBtn = document.getElementById('btn-clear-from');
    const clearToBtn = document.getElementById('btn-clear-to');
    const rentalSelect = document.getElementById('hero-rental-package-select');
    const cabTypePills = document.querySelectorAll('.cab-type-pill');

    const modeHeadings = {
      oneway: 'Book outstation cabs',
      round: 'Book round trip outstation cabs',
      rental: 'Book hourly rental cabs'
    };

    tripPills.forEach(pill => {
      pill.addEventListener('click', () => {
        tripPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const mode = pill.dataset.tripMode;
        if (dynamicHeading) {
          dynamicHeading.textContent = modeHeadings[mode] || 'Book outstation cabs';
        }

        if (mode === 'rental') {
          store.setSearchParams({ serviceType: 'rental', tripType: 'rental', returnDate: '' });
          if (rentalWrap) rentalWrap.style.display = 'flex';
          if (returnDateWrapper) returnDateWrapper.style.display = 'none';
          if (inputsGrid) inputsGrid.classList.remove('has-roundtrip');
          if (inputDrop) {
            inputDrop.value = 'Local Rental Service';
            inputDrop.disabled = true;
          }
          if (swapBtn) swapBtn.style.opacity = '0.3';
        } else if (mode === 'round') {
          store.setSearchParams({ serviceType: 'intercity', tripType: 'round' });
          if (rentalWrap) rentalWrap.style.display = 'none';
          if (returnDateWrapper) returnDateWrapper.style.display = 'block';
          if (inputsGrid) inputsGrid.classList.add('has-roundtrip');
          if (inputDrop) {
            if (inputDrop.value === 'Local Rental Service') inputDrop.value = 'Chennai';
            inputDrop.disabled = false;
          }
          if (swapBtn) swapBtn.style.opacity = '1';
        } else {
          store.setSearchParams({ serviceType: 'intercity', tripType: 'oneway', returnDate: '' });
          if (rentalWrap) rentalWrap.style.display = 'none';
          if (returnDateWrapper) returnDateWrapper.style.display = 'none';
          if (inputsGrid) inputsGrid.classList.remove('has-roundtrip');
          if (inputDrop) {
            if (inputDrop.value === 'Local Rental Service') inputDrop.value = 'Chennai';
            inputDrop.disabled = false;
          }
          if (swapBtn) swapBtn.style.opacity = '1';
        }
      });
    });

    // Rental package selector
    if (rentalSelect) {
      rentalSelect.addEventListener('change', (e) => {
        store.setSearchParams({ packageId: e.target.value });
      });
    }

    // Clear buttons (✕)
    if (clearFromBtn && inputPickup) {
      clearFromBtn.onclick = () => {
        inputPickup.value = '';
        inputPickup.focus();
        store.setSearchParams({ pickup: '' });
      };
    }

    if (clearToBtn && inputDrop) {
      clearToBtn.onclick = () => {
        inputDrop.value = '';
        inputDrop.focus();
        store.setSearchParams({ drop: '' });
      };
    }

    // Swap locations button
    if (swapBtn && inputPickup && inputDrop) {
      swapBtn.onclick = () => {
        const temp = inputPickup.value;
        inputPickup.value = inputDrop.value;
        inputDrop.value = temp;
        store.setSearchParams({
          pickup: inputPickup.value,
          drop: inputDrop.value
        });
      };
    }

    // Dynamic Date Selector Pills
    this.setupQuickDates();

    // Cab Type Filter Pills (Hatchback, Sedan, SUV)
    cabTypePills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        cabTypePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const selectedType = pill.dataset.cabType;
        store.setSearchParams({ cabType: selectedType });
      });
    });
  }

  // Setup Dynamic 5-day Date Pills + Calendar
  setupQuickDates() {
    const container = document.getElementById('quick-dates-container');
    const dateInput = document.getElementById('input-date');
    if (!container) return;

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();

    const dateCards = container.querySelectorAll('.date-pill-card');
    dateCards.forEach((card, index) => {
      const d = new Date(now);
      d.setDate(now.getDate() + index);

      const dayNum = d.getDate();
      const dayName = index === 0 ? 'Today' : daysOfWeek[d.getDay()];
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const isoDate = `${yyyy}-${mm}-${dd}`;

      card.dataset.date = isoDate;
      const numSpan = card.querySelector('.date-pill-day');
      const subSpan = card.querySelector('.date-pill-sub');
      if (numSpan) numSpan.textContent = dayNum;
      if (subSpan) subSpan.textContent = dayName;

      card.onclick = () => {
        dateCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        if (dateInput) dateInput.value = isoDate;
        store.setSearchParams({ departureDate: isoDate });
      };
    });

    // Calendar Picker Event (Requested by user: display selected date in calendar card)
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        const chosenVal = e.target.value;
        if (!chosenVal) return;
        store.setSearchParams({ departureDate: chosenVal });

        const calendarPillText = document.getElementById('calendar-pill-text');
        const calCard = document.getElementById('btn-calendar-trigger');

        // Check if chosenVal matches one of the 3 quick pills
        let matched = false;
        dateCards.forEach(c => {
          if (c.dataset.date === chosenVal) {
            c.classList.add('active');
            matched = true;
          } else {
            c.classList.remove('active');
          }
        });

        if (calendarPillText) {
          const parts = chosenVal.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          if (parts.length === 3) {
            const day = parseInt(parts[2], 10);
            const month = monthNames[parseInt(parts[1], 10) - 1] || '';
            calendarPillText.textContent = `${day} ${month}`;
          } else {
            calendarPillText.textContent = chosenVal;
          }
        }

        if (calCard) {
          calCard.classList.toggle('active', true);
        }
      });
    }

    // Return Date Calendar Picker Event (Round-trip)
    const returnDateInput = document.getElementById('input-return-date-picker');
    const hiddenReturnDate = document.getElementById('input-return-date');
    const returnCalendarPillText = document.getElementById('return-calendar-pill-text');
    const returnCalCard = document.getElementById('btn-return-calendar-trigger');

    if (returnDateInput) {
      const todayIso = new Date().toISOString().split('T')[0];
      returnDateInput.min = todayIso;

      returnDateInput.addEventListener('change', (e) => {
        const chosenVal = e.target.value;
        if (!chosenVal) return;
        if (hiddenReturnDate) hiddenReturnDate.value = chosenVal;
        store.setSearchParams({ returnDate: chosenVal });

        if (returnCalendarPillText) {
          const parts = chosenVal.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          if (parts.length === 3) {
            const day = parseInt(parts[2], 10);
            const month = monthNames[parseInt(parts[1], 10) - 1] || '';
            returnCalendarPillText.textContent = `${day} ${month}`;
          } else {
            returnCalendarPillText.textContent = chosenVal;
          }
        }

        if (returnCalCard) {
          returnCalCard.classList.add('active');
        }
      });
    }
  }

  toggleReturnDateField() {
    const returnDateFieldWrap = document.getElementById('return-date-wrapper');
    const isRoundTrip = store.searchParams.serviceType === 'intercity' && store.searchParams.tripType === 'round';
    if (returnDateFieldWrap) {
      returnDateFieldWrap.style.display = isRoundTrip ? 'block' : 'none';
    }
  }

  // Location Autocomplete
  setupAutocomplete() {
    const pickupInput = document.getElementById('input-pickup');
    const dropInput = document.getElementById('input-drop');
    const pickupDropdown = document.getElementById('pickup-autocomplete-list');
    const dropDropdown = document.getElementById('drop-autocomplete-list');

    this.bindAutocomplete(pickupInput, pickupDropdown, (selected) => {
      pickupInput.value = selected.label;
      store.setSearchParams({ pickup: selected.label });
    });

    this.bindAutocomplete(dropInput, dropDropdown, (selected) => {
      dropInput.value = selected.label;
      store.setSearchParams({ drop: selected.label });
    });
  }

  bindAutocomplete(inputEl, dropdownEl, onSelect) {
    if (!inputEl || !dropdownEl) return;

    inputEl.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (query.length < 2) {
        dropdownEl.classList.remove('open');
        dropdownEl.innerHTML = '';
        return;
      }

      const matches = LOCATION_MASTER.filter(loc => 
        loc.label.toLowerCase().includes(query) ||
        loc.area.toLowerCase().includes(query) ||
        loc.city.toLowerCase().includes(query) ||
        (loc.code && loc.code.toLowerCase().includes(query))
      );

      if (matches.length === 0) {
        dropdownEl.innerHTML = `<div class="autocomplete-item"><div class="autocomplete-sub">No matching location found in PickMi service area.</div></div>`;
        dropdownEl.classList.add('open');
        return;
      }

      dropdownEl.innerHTML = matches.map(loc => `
        <div class="autocomplete-item" data-id="${loc.id}">
          <div class="autocomplete-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div>
            <div class="autocomplete-primary">${loc.area}, ${loc.city}</div>
            <div class="autocomplete-sub">${loc.label}</div>
          </div>
        </div>
      `).join('');

      dropdownEl.classList.add('open');

      dropdownEl.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
          const locId = item.dataset.id;
          const selected = LOCATION_MASTER.find(l => l.id === locId);
          if (selected) {
            onSelect(selected);
          }
          dropdownEl.classList.remove('open');
        });
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target)) {
        dropdownEl.classList.remove('open');
      }
    });
  }

  setupSearchForm() {
    const form = document.getElementById('hero-cab-search-form') || document.getElementById('cab-search-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const pickup = document.getElementById('input-pickup')?.value.trim();
      const drop = document.getElementById('input-drop')?.value.trim();
      const date = document.getElementById('input-date')?.value;
      const time = document.getElementById('input-time')?.value;
      const returnDate = document.getElementById('input-return-date')?.value;
      const returnTime = document.getElementById('input-return-time')?.value;

      if (!pickup) {
        this.showToast('Please enter a pickup location', 'error');
        return;
      }

      if (store.searchParams.serviceType !== 'rental' && !drop) {
        this.showToast('Please enter a destination', 'error');
        return;
      }

      // Selected cab type and trip mode from hero pills
      const activeCabPill = document.querySelector('.cab-type-pill.active');
      const cabType = activeCabPill ? activeCabPill.dataset.cabType : (store.searchParams.cabType || 'sedan');
      const activeTripPill = document.querySelector('.hero-trip-pill.active');
      const tripMode = activeTripPill ? activeTripPill.dataset.tripMode : (store.searchParams.tripType || 'oneway');

      store.setSearchParams({
        tripType: tripMode === 'round' ? 'round' : (tripMode === 'rental' ? 'rental' : 'oneway'),
        pickup,
        drop: store.searchParams.serviceType === 'rental' ? 'Local Rental Service' : drop,
        departureDate: date || store.searchParams.departureDate,
        departureTime: time || store.searchParams.departureTime,
        returnDate: tripMode === 'round' ? (returnDate || store.searchParams.returnDate) : '',
        returnTime: returnTime || store.searchParams.returnTime,
        cabType
      });

      this.navigateTo('results');
    });
  }

  // Calculate Fare Algorithm based on distance and service type
  calculateVehicleFare(vehicle) {
    const params = store.searchParams;
    let distanceKm = 40; // Default estimate

    if (params.serviceType === 'intercity') {
      distanceKm = params.tripType === 'round' ? 320 : 160;
    } else if (params.serviceType === 'airport') {
      distanceKm = 36;
    } else if (params.serviceType === 'rental') {
      const pkg = RENTAL_PACKAGES.find(p => p.id === params.packageId) || RENTAL_PACKAGES[1];
      distanceKm = pkg.km;
    } else {
      // InCity
      distanceKm = 24;
    }

    let baseRate = 16;
    let minFare = 300;

    if (params.serviceType === 'intercity') {
      baseRate = params.tripType === 'round' ? vehicle.baseRatePerKm.intercity_round : vehicle.baseRatePerKm.intercity_oneway;
      minFare = params.tripType === 'round' ? vehicle.baseFareMin.intercity_round : vehicle.baseFareMin.intercity_oneway;
    } else if (params.serviceType === 'airport') {
      baseRate = vehicle.baseRatePerKm.airport;
      minFare = vehicle.baseFareMin.airport;
    } else if (params.serviceType === 'rental') {
      const pkg = RENTAL_PACKAGES.find(p => p.id === params.packageId) || RENTAL_PACKAGES[1];
      baseRate = vehicle.baseRatePerKm.rental_extra_km;
      minFare = Math.round(vehicle.baseFareMin.incity * pkg.multiplier * 2.2);
    } else {
      baseRate = vehicle.baseRatePerKm.incity;
      minFare = vehicle.baseFareMin.incity;
    }

    const calculatedBase = Math.max(minFare, Math.round(distanceKm * baseRate));
    const tolls = params.serviceType === 'intercity' ? (params.tripType === 'round' ? 360 : 180) : (params.serviceType === 'airport' ? 110 : 0);
    const driverAllowance = params.serviceType === 'intercity' ? (params.tripType === 'round' ? 500 : 250) : 0;
    const gstTax = Math.round((calculatedBase + driverAllowance) * 0.05);

    let discount = 0;
    if (store.appliedCoupon) {
      if (store.appliedCoupon.discount) {
        discount = store.appliedCoupon.discount;
      } else if (store.appliedCoupon.discountPercent) {
        discount = Math.min(store.appliedCoupon.maxDiscount || 200, Math.round(calculatedBase * (store.appliedCoupon.discountPercent / 100)));
      }
    }

    const total = Math.max(100, calculatedBase + tolls + driverAllowance + gstTax - discount);

    return {
      distanceKm,
      base: calculatedBase,
      tolls,
      driverAllowance,
      tax: gstTax,
      discount,
      total,
      ratePerKm: baseRate
    };
  }

  // Render Vehicle Results Page (Benchmark RedBus / MakeMyTrip Styled)
  renderVehicleResults() {
    const params = store.searchParams;
    const pillBarContainer = document.getElementById('results-search-pill-bar');
    const cabsListContainer = document.getElementById('cabs-list-container');
    const resultsCountHeading = document.getElementById('results-count-heading');

    // Breadcrumb navigation
    document.getElementById('breadcrumb-home-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.navigateTo('home');
    });

    document.getElementById('breadcrumb-home-link2')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.navigateTo('home');
    });

    // Helper for formatting date "11 October 2026"
    const formatDatePretty = (isoStr) => {
      if (!isoStr) return '';
      const parts = isoStr.split('-');
      if (parts.length !== 3) return isoStr;
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const day = parseInt(parts[2], 10);
      const month = monthNames[parseInt(parts[1], 10) - 1] || '';
      const year = parts[0];
      return `${day} ${month} ${year}`;
    };

    const formatShortDate = (isoStr) => {
      if (!isoStr) return '';
      const parts = isoStr.split('-');
      if (parts.length !== 3) return isoStr;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = parseInt(parts[2], 10);
      const month = monthNames[parseInt(parts[1], 10) - 1] || '';
      return `${day} ${month}`;
    };

    const isRoundTrip = params.tripType === 'round';
    const pickupCity = (params.pickup || 'Bengaluru').split(',')[0].trim();
    const dropCity = (params.drop || 'Chennai').split(',')[0].trim();
    const formattedDepDate = formatDatePretty(params.departureDate) || '11 October 2026';
    const formattedRetDate = params.returnDate ? formatDatePretty(params.returnDate) : '';

    // Render Sticky Search Header Bar (Paytm Travel Reference Style)
    if (pillBarContainer) {
      pillBarContainer.innerHTML = `
        <div class="results-search-header-inner">
          <!-- Left: Brand Logo (Navigates to Home) -->
          <div class="results-header-brand" id="results-header-logo-btn" title="Back to PickMi Home">
            <div class="brand-badge-icon">P</div>
            <div class="brand-text-box">
              <div class="brand-title">Pick<span>Mi</span></div>
            </div>
          </div>

          <!-- Trip Type Selector (One-way / Round-trip) -->
          <div class="results-header-trip-toggle" id="results-header-trip-toggle">
            <button type="button" class="results-header-trip-btn ${isRoundTrip ? '' : 'active'}" data-trip="oneway">One-way</button>
            <button type="button" class="results-header-trip-btn ${isRoundTrip ? 'active' : ''}" data-trip="round">Round-trip</button>
          </div>

          <!-- Center Fields: From, Swap, To, Departure, Return (Conditional) -->
          <div class="results-header-fields-group">
            <!-- From Location -->
            <div class="search-header-field search-header-field-location" id="header-from-wrapper">
              <span class="search-header-label">From</span>
              <div class="search-header-input-wrap">
                <input type="text" class="search-header-input" id="pill-input-pickup" value="${pickupCity}" placeholder="Pickup city" autocomplete="off">
                <button type="button" class="btn-header-clear" id="btn-pill-clear-from" title="Clear">✕</button>
              </div>
              <div id="header-pickup-autocomplete" class="autocomplete-dropdown"></div>
            </div>

            <!-- Swap Cities Button -->
            <button type="button" class="search-header-swap" id="btn-pill-swap-cities" title="Swap Cities">⇄</button>

            <!-- To Location -->
            <div class="search-header-field search-header-field-location" id="header-to-wrapper">
              <span class="search-header-label">To</span>
              <div class="search-header-input-wrap">
                <input type="text" class="search-header-input" id="pill-input-drop" value="${dropCity}" placeholder="Destination city" autocomplete="off">
                <button type="button" class="btn-header-clear" id="btn-pill-clear-to" title="Clear">✕</button>
              </div>
              <div id="header-drop-autocomplete" class="autocomplete-dropdown"></div>
            </div>

            <!-- Departure Date -->
            <div class="search-header-field search-header-field-date" id="header-dep-date-wrapper">
              <span class="search-header-label">Departure Date</span>
              <div class="search-header-input-wrap search-header-date-wrap">
                <span class="search-header-date-display" id="header-dep-date-display">${formattedDepDate}</span>
                <input type="date" class="search-header-date-picker" id="pill-input-departure-date" value="${params.departureDate || ''}">
              </div>
            </div>

            <!-- Return Date (Only shown if Round-trip is selected) -->
            <div class="search-header-field search-header-field-date" id="header-return-date-block" style="${isRoundTrip ? 'display:flex;' : 'display:none;'}">
              <span class="search-header-label">Return date</span>
              <div class="search-header-input-wrap search-header-date-wrap">
                <span class="search-header-date-display ${params.returnDate ? '' : 'placeholder'}" id="header-ret-date-display">${formattedRetDate || 'Add Date'}</span>
                <input type="date" class="search-header-date-picker" id="pill-input-return-date" value="${params.returnDate || ''}">
              </div>
            </div>
          </div>

          <!-- Right: Search CTA Button (Pill shaped outline/solid) -->
          <button type="button" class="btn-header-search" id="btn-pill-search">Search</button>
        </div>
      `;

      // Brand Logo click -> navigate to home
      document.getElementById('results-header-logo-btn')?.addEventListener('click', () => {
        this.navigateTo('home');
      });

      // Trip type toggle buttons (One-way / Round-trip)
      const tripBtns = pillBarContainer.querySelectorAll('.results-header-trip-btn');
      const retDateBlock = document.getElementById('header-return-date-block');
      tripBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tripBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const tripMode = btn.dataset.trip;
          store.setSearchParams({ tripType: tripMode });

          if (tripMode === 'round') {
            if (retDateBlock) retDateBlock.style.display = 'flex';
            if (!store.searchParams.returnDate) {
              store.setSearchParams({ returnDate: store.searchParams.departureDate });
            }
            const retDateInput = document.getElementById('pill-input-return-date');
            const retDateDisplay = document.getElementById('header-ret-date-display');
            if (retDateInput && store.searchParams.returnDate) retDateInput.value = store.searchParams.returnDate;
            if (retDateDisplay) {
              retDateDisplay.textContent = formatDatePretty(store.searchParams.returnDate || store.searchParams.departureDate);
              retDateDisplay.classList.remove('placeholder');
            }
          } else {
            if (retDateBlock) retDateBlock.style.display = 'none';
          }
        });
      });

      // Date Pickers live formatted display updates
      const depDateInput = document.getElementById('pill-input-departure-date');
      const depDateDisplay = document.getElementById('header-dep-date-display');
      depDateInput?.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          depDateDisplay.textContent = formatDatePretty(val);
          store.setSearchParams({ departureDate: val });
        }
      });

      const retDateInput = document.getElementById('pill-input-return-date');
      const retDateDisplay = document.getElementById('header-ret-date-display');
      retDateInput?.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          retDateDisplay.textContent = formatDatePretty(val);
          retDateDisplay.classList.remove('placeholder');
          store.setSearchParams({ returnDate: val });
        }
      });

      // Autocomplete bindings for header fields
      const fromInput = document.getElementById('pill-input-pickup');
      const fromDropdown = document.getElementById('header-pickup-autocomplete');
      if (fromInput && fromDropdown) {
        this.bindAutocomplete(fromInput, fromDropdown, (loc) => {
          fromInput.value = loc.city || loc.area;
          store.setSearchParams({ pickup: loc.city || loc.area });
        });
      }

      const toInput = document.getElementById('pill-input-drop');
      const toDropdown = document.getElementById('header-drop-autocomplete');
      if (toInput && toDropdown) {
        this.bindAutocomplete(toInput, toDropdown, (loc) => {
          toInput.value = loc.city || loc.area;
          store.setSearchParams({ drop: loc.city || loc.area });
        });
      }

      // Handlers for search button
      document.getElementById('btn-pill-search')?.addEventListener('click', () => {
        const newFrom = document.getElementById('pill-input-pickup')?.value.trim();
        const newTo = document.getElementById('pill-input-drop')?.value.trim();
        const newDate = document.getElementById('pill-input-departure-date')?.value;
        const newReturnDate = document.getElementById('pill-input-return-date')?.value;
        const activeTripBtn = pillBarContainer.querySelector('.results-header-trip-btn.active');
        const newTripType = activeTripBtn ? activeTripBtn.dataset.trip : store.searchParams.tripType;

        if (newFrom) store.setSearchParams({ pickup: newFrom });
        if (newTo) store.setSearchParams({ drop: newTo });
        if (newDate) store.setSearchParams({ departureDate: newDate });
        if (newTripType) store.setSearchParams({ tripType: newTripType });
        if (newTripType === 'round' && newReturnDate) {
          store.setSearchParams({ returnDate: newReturnDate });
        }

        this.showToast('Searching updated cabs...');
        this.renderVehicleResults();
      });

      // Swap button
      document.getElementById('btn-pill-swap-cities')?.addEventListener('click', () => {
        const fromEl = document.getElementById('pill-input-pickup');
        const toEl = document.getElementById('pill-input-drop');
        if (fromEl && toEl) {
          const tmp = fromEl.value;
          fromEl.value = toEl.value;
          toEl.value = tmp;
          store.setSearchParams({ pickup: fromEl.value, drop: toEl.value });
          this.renderVehicleResults();
        }
      });

      // Clear buttons
      document.getElementById('btn-pill-clear-from')?.addEventListener('click', () => {
        const fromEl = document.getElementById('pill-input-pickup');
        if (fromEl) {
          fromEl.value = '';
          fromEl.focus();
        }
      });

      document.getElementById('btn-pill-clear-to')?.addEventListener('click', () => {
        const toEl = document.getElementById('pill-input-drop');
        if (toEl) {
          toEl.value = '';
          toEl.focus();
        }
      });
    }

    if (resultsCountHeading) {
      resultsCountHeading.textContent = 'Available Cabs';
    }

    // Departure time and duration calculation
    const depTimeStr = params.departureTime || '08:00 AM';
    const depShortDate = formatShortDate(params.departureDate) || '12 Oct';

    // Calculate duration and arrival time based on distance & departure
    const getTripTiming = (distKm) => {
      let totalMinutes = Math.max(45, Math.round((distKm / 55) * 60));
      if (params.serviceType === 'rental') {
        const pkg = RENTAL_PACKAGES.find(p => p.id === params.packageId) || RENTAL_PACKAGES[1];
        totalMinutes = (pkg.hours || 4) * 60;
      } else if (distKm <= 75) {
        totalMinutes = 74; // Exactly 01h 14m matching benchmark
      }

      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      const durationStr = `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;

      const [timePart, meridiem] = (depTimeStr || '08:00 AM').split(' ');
      let [h, m] = (timePart || '08:00').split(':').map(Number);
      if (meridiem === 'PM' && h < 12) h += 12;
      if (meridiem === 'AM' && h === 12) h = 0;

      const depDateObj = params.departureDate ? new Date(params.departureDate) : new Date();
      depDateObj.setHours(h, m || 0, 0, 0);

      const arrDateObj = new Date(depDateObj.getTime() + totalMinutes * 60000);
      const arrHours = arrDateObj.getHours();
      const arrMins = arrDateObj.getMinutes();
      const arrMeridiem = arrHours >= 12 ? 'PM' : 'AM';
      const arrH12 = arrHours % 12 || 12;
      const arrTimeStr = `${arrH12.toString().padStart(2, '0')}:${arrMins.toString().padStart(2, '0')} ${arrMeridiem}`;

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const arrDateStr = `${arrDateObj.getDate()} ${monthNames[arrDateObj.getMonth()]}`;

      return {
        depTimeStr,
        depShortDate,
        durationStr,
        arrTimeStr,
        arrDateStr
      };
    };

    // Reference timing for route banner
    const defaultTiming = getTripTiming(68);

    // Render OpenStreetMap Live Route Preview Card
    const osmCardContainer = document.getElementById('osm-route-card-container');
    if (osmCardContainer) {
      osmCardContainer.innerHTML = `<div id="osm-map-container" class="osm-map-container"></div>`;

      // Initialize OpenStreetMap tiles & route
      setTimeout(() => {
        const CITY_COORDS = {
          'Bengaluru': [12.9716, 77.5946],
          'Bangalore': [12.9716, 77.5946],
          'Chennai': [13.0827, 80.2707],
          'Pondicherry': [11.9416, 79.8083],
          'Puducherry': [11.9416, 79.8083],
          'Coimbatore': [11.0168, 76.9558],
          'Madurai': [9.9252, 78.1198],
          'Mysuru': [12.2958, 76.6394],
          'Mysore': [12.2958, 76.6394],
          'Coorg': [12.4244, 75.7382],
          'Mahabalipuram': [12.6269, 80.1927],
          'Mumbai': [19.0760, 72.8777],
          'Pune': [18.5204, 73.8567],
          'Lonavala': [18.7557, 73.4091],
          'New Delhi': [28.6139, 77.2090],
          'Delhi': [28.6139, 77.2090],
          'Gurugram': [28.4595, 77.0266],
          'Noida': [28.5355, 77.3910],
          'Agra': [27.1767, 78.0081],
          'Jaipur': [26.9124, 75.7873],
          'Hyderabad': [17.3850, 78.4867],
          'Vijayawada': [16.5062, 80.6480]
        };

        const mapEl = document.getElementById('osm-map-container');
        if (mapEl && window.L) {
          if (this.osmMapInstance) {
            try { this.osmMapInstance.remove(); } catch (err) {}
            this.osmMapInstance = null;
          }

          const fromCoords = CITY_COORDS[pickupCity] || [12.9716, 77.5946];
          const toCoords = CITY_COORDS[dropCity] || (params.serviceType === 'rental' ? [12.9352, 77.6245] : [13.0827, 80.2707]);

          const map = L.map('osm-map-container', {
            zoomControl: false,
            attributionControl: true,
            scrollWheelZoom: false
          });
          this.osmMapInstance = map;

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          L.circleMarker(fromCoords, {
            radius: 8,
            fillColor: '#0056d6',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 1
          }).addTo(map).bindPopup(`<b>Pickup:</b> ${pickupCity}`);

          L.circleMarker(toCoords, {
            radius: 8,
            fillColor: '#10b981',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 1
          }).addTo(map).bindPopup(`<b>Drop:</b> ${dropCity}`);

          L.polyline([fromCoords, toCoords], {
            color: '#0056d6',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 8'
          }).addTo(map);

          const bounds = L.latLngBounds([fromCoords, toCoords]);
          map.fitBounds(bounds, { padding: [40, 40] });
          setTimeout(() => { map.invalidateSize(); }, 100);
        }
      }, 50);
    }

    // Render 5 Vehicle cards
    if (cabsListContainer) {
      let cardsHtml = '';

      let displayVehicles = [...VEHICLE_CATEGORIES];
      if (params.cabType) {
        displayVehicles.sort((a, b) => {
          if (a.id === params.cabType) return -1;
          if (b.id === params.cabType) return 1;
          return 0;
        });
      }

      displayVehicles.forEach((vehicle, index) => {
        const fare = this.calculateVehicleFare(vehicle);
        const timing = getTripTiming(fare.distanceKm);
        const origPrice = Math.round(fare.total * 1.15);
        const discountAmount = origPrice - fare.total;

        // Custom ratings & tags matching benchmark
        const ratingScore = vehicle.id === 'innova_crysta' ? '4.9' : (vehicle.id === 'innova' ? '4.8' : (vehicle.id === 'suv' ? '4.7' : '4.6'));
        const reviewCount = vehicle.id === 'hatchback' ? '2,840' : (vehicle.id === 'sedan' ? '3,120' : (vehicle.id === 'suv' ? '1,950' : (vehicle.id === 'innova' ? '1,420' : '980')));
        const isSelectedChoice = params.cabType === vehicle.id;

        cardsHtml += `
          <div class="cab-result-card ${isSelectedChoice ? 'selected-cab-type' : ''}" data-vehicle-id="${vehicle.id}">
            <div class="cab-card-top-grid">
              <!-- Left Column: Rating, Title & Models -->
              <div class="cab-info-col">
                <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
                  <span class="cab-rating-badge">★ ${ratingScore} <span style="font-weight:500;color:#047857;">(${reviewCount})</span></span>
                  ${isSelectedChoice ? '<span style="font-size:0.68rem;background:#0056d6;color:#ffffff;font-weight:700;padding:2px 8px;border-radius:4px;">Your Selected Cab Type</span>' : ''}
                  ${index === 0 && !isSelectedChoice ? '<span style="font-size:0.68rem;background:#f1f5f9;color:#64748b;font-weight:700;padding:2px 6px;border-radius:4px;">Ad</span>' : ''}
                  ${vehicle.id.includes('innova') ? '<span style="font-size:0.68rem;background:#eff6ff;color:#0056d6;font-weight:700;padding:2px 6px;border-radius:4px;">PickMi Assured</span>' : ''}
                </div>
                <div class="cab-card-heading">${vehicle.categoryName}</div>
                <div class="cab-card-models">${vehicle.models}</div>
              </div>

              <!-- Center Column: Route Pickup, Duration & Drop Timing -->
              <div class="cab-timing-col">
                <div class="time-box">
                  <span class="time-val">${timing.depTimeStr}</span>
                  <span class="time-date">${timing.depShortDate}</span>
                </div>

                <div class="duration-line-pill">
                  <span class="duration-pill">${timing.durationStr}</span>
                  <div class="duration-line"></div>
                </div>

                <div class="time-box">
                  <span class="time-val">${timing.arrTimeStr}</span>
                  <span class="time-date">${timing.arrDateStr}</span>
                </div>
              </div>

              <!-- Right Column: Pricing & Flash Sale -->
              <div class="cab-pricing-col">
                <div class="crossed-price-row">
                  <span class="crossed-price">₹${origPrice.toLocaleString('en-IN')}</span>
                  <span class="discount-tag">₹${discountAmount.toLocaleString('en-IN')} off</span>
                </div>
                <div class="final-fare-amount">₹${fare.total.toLocaleString('en-IN')}</div>
                <div class="flash-sale-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  <span>FLASH SALE</span>
                </div>
              </div>
            </div>

            <!-- Bottom Row: Live Tracking, View Details, Seats & CTA -->
            <div class="cab-card-bottom-bar">
              <div class="card-bottom-left-links">
                <div class="live-tracking-pill">
                  <span></span> Live Tracking
                </div>
                <button type="button" class="view-fare-details-btn" data-breakdown-id="${vehicle.id}">
                  <span>View fare details</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>

              <div class="card-bottom-right-actions">
                <span class="card-capacity-text">${vehicle.seats} seats (${vehicle.luggage} bags, AC)</span>
                <button class="btn-select-cab-pill" data-select-vehicle="${vehicle.id}">Select Cab</button>
              </div>
            </div>

            <!-- Inline Expandable Fare Breakdown Drawer -->
            <div class="cab-card-fare-breakdown" id="fare-breakdown-${vehicle.id}" style="display:none;">
              <div class="breakdown-inner">
                <div class="breakdown-col">
                  <div class="breakdown-title">Fare Inclusions & Taxes</div>
                  <div class="breakdown-row">
                    <span>Base Vehicle Fare (${fare.distanceKm} km included)</span>
                    <strong>₹${fare.base.toLocaleString('en-IN')}</strong>
                  </div>
                  ${fare.tolls > 0 ? `
                  <div class="breakdown-row">
                    <span>Tolls & Highway Charges</span>
                    <strong>₹${fare.tolls.toLocaleString('en-IN')}</strong>
                  </div>` : ''}
                  ${fare.driverAllowance > 0 ? `
                  <div class="breakdown-row">
                    <span>Chauffeur Allowance</span>
                    <strong>₹${fare.driverAllowance.toLocaleString('en-IN')}</strong>
                  </div>` : ''}
                  <div class="breakdown-row">
                    <span>GST (5%)</span>
                    <strong>₹${fare.tax.toLocaleString('en-IN')}</strong>
                  </div>
                  ${fare.discount > 0 ? `
                  <div class="breakdown-row discount">
                    <span>Coupon Discount</span>
                    <strong>- ₹${fare.discount.toLocaleString('en-IN')}</strong>
                  </div>` : ''}
                  <div class="breakdown-row total-row">
                    <span>Total Amount Payable</span>
                    <strong class="total-price">₹${fare.total.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div class="breakdown-col trip-specs-col">
                  <div class="breakdown-title">Trip & Route Details</div>
                  <div class="spec-item">
                    <span class="spec-label">Pickup Schedule:</span>
                    <span class="spec-val">${timing.depTimeStr}, ${timing.depShortDate}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Estimated Drop:</span>
                    <span class="spec-val">${timing.arrTimeStr}, ${timing.arrDateStr}</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Journey Duration:</span>
                    <span class="spec-val">${timing.durationStr} (${fare.distanceKm} km)</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">Vehicle Capacity:</span>
                    <span class="spec-val">${vehicle.seats} Seats · ${vehicle.luggage} Bags</span>
                  </div>
                  <div class="spec-item policy-note">
                    <span>🛡️ Free cancellation up to 2 hours before pickup. Zero hidden charges.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

      });

      cabsListContainer.innerHTML = cardsHtml;

      // Event Listeners for Select Cab
      cabsListContainer.querySelectorAll('[data-select-vehicle]').forEach(btn => {
        btn.addEventListener('click', () => {
          const vehicleId = btn.dataset.selectVehicle;
          const vehicle = VEHICLE_CATEGORIES.find(v => v.id === vehicleId);
          if (vehicle) {
            store.setVehicleSelection(vehicle);
            this.proceedToCheckout(vehicle);
          }
        });
      });

      // Expand / Collapse Fare Details inside Card
      cabsListContainer.querySelectorAll('.view-fare-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const vehicleId = btn.dataset.breakdownId;
          const breakdownEl = document.getElementById(`fare-breakdown-${vehicleId}`);
          if (breakdownEl) {
            const isHidden = breakdownEl.style.display === 'none';
            breakdownEl.style.display = isHidden ? 'block' : 'none';
            btn.classList.toggle('expanded', isHidden);
            const textSpan = btn.querySelector('span');
            if (textSpan) {
              textSpan.textContent = isHidden ? 'Hide fare details' : 'View fare details';
            }
          }
        });
      });

      // Event Listeners for Mini Offers click
      cabsListContainer.querySelectorAll('.offer-mini-card').forEach(card => {
        card.addEventListener('click', () => {
          const code = card.dataset.coupon;
          const discountPct = card.dataset.discount ? parseInt(card.dataset.discount, 10) : null;
          const flatDisc = card.dataset.flat ? parseInt(card.dataset.flat, 10) : null;

          if (discountPct) {
            store.applyCoupon({ code, discountPercent: discountPct, maxDiscount: 350 });
          } else if (flatDisc) {
            store.applyCoupon({ code, discount: flatDisc });
          }
          this.showToast(`Coupon "${code}" applied successfully! 🎉`);
          this.renderVehicleResults();
        });
      });
    }
  }

  // Fare Breakdown Modal
  openFareBreakdownModal(vehicle) {
    const modal = document.getElementById('fare-breakdown-modal');
    const content = document.getElementById('fare-breakdown-modal-content');
    if (!modal || !content) return;

    const fare = this.calculateVehicleFare(vehicle);

    content.innerHTML = `
      <h3 style="font-size:1.3rem;font-weight:700;margin-bottom:0.5rem;color:var(--text-main);">
        Fare Breakdown: ${vehicle.categoryName}
      </h3>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.5rem;">
        Transparent, all-inclusive pricing as per PickMi policy. No hidden surcharges.
      </p>

      <div class="fare-summary-table">
        <div class="fare-summary-row">
          <span>Base Vehicle Fare (Includes ${fare.distanceKm} km)</span>
          <span>₹${fare.base.toLocaleString('en-IN')}</span>
        </div>
        ${fare.tolls > 0 ? `
          <div class="fare-summary-row">
            <span>Toll & State Taxes (Estimated)</span>
            <span>₹${fare.tolls.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}
        ${fare.driverAllowance > 0 ? `
          <div class="fare-summary-row">
            <span>Driver Allowance / Night Charge</span>
            <span>₹${fare.driverAllowance.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}
        <div class="fare-summary-row">
          <span>GST (5%)</span>
          <span>₹${fare.tax.toLocaleString('en-IN')}</span>
        </div>
        ${fare.discount > 0 ? `
          <div class="fare-summary-row discount">
            <span>Promo Coupon (${store.appliedCoupon?.code})</span>
            <span>- ₹${fare.discount.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}
        <div class="fare-summary-row bold">
          <span>Total Payable Amount</span>
          <span>₹${fare.total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div style="margin-top:1.5rem;padding:1rem;background:#f8fafc;border-radius:var(--border-radius-md);font-size:0.82rem;color:var(--text-muted);">
        <strong style="color:var(--text-main);">Inclusions:</strong>
        ${vehicle.inclusions.join(', ')}.<br><br>
        <strong style="color:var(--text-main);">Exclusions:</strong>
        ${vehicle.exclusions.join(', ')}.
      </div>

      <button id="modal-confirm-select-btn" class="btn-primary-search" style="width:100%;margin-top:1.5rem;">
        Proceed with ${vehicle.categoryName}
      </button>
    `;

    modal.classList.add('open');

    document.getElementById('modal-confirm-select-btn')?.addEventListener('click', () => {
      modal.classList.remove('open');
      store.setVehicleSelection(vehicle);
      this.proceedToCheckout(vehicle);
    });
  }

  // Proceed to Checkout / Guest to Login Handshake (Section 3 & 8)
  proceedToCheckout(vehicle) {
    if (!store.user.isLoggedIn) {
      // Save draft booking so state is seamlessly preserved after OTP login
      store.saveDraft({
        vehicleId: vehicle.id,
        serviceType: store.searchParams.serviceType,
        tripType: store.searchParams.tripType,
        pickup: store.searchParams.pickup,
        drop: store.searchParams.drop
      });
      this.openLoginModal(() => {
        this.navigateTo('checkout');
      });
    } else {
      this.navigateTo('checkout');
    }
  }

  // Login & OTP Modal (Section 8)
  openLoginModal(onSuccessCallback = null) {
    const modal = document.getElementById('login-otp-modal');
    const phoneStep = document.getElementById('otp-step-phone');
    const verifyStep = document.getElementById('otp-step-verify');
    if (!modal || !phoneStep || !verifyStep) return;

    phoneStep.style.display = 'block';
    verifyStep.style.display = 'none';
    modal.classList.add('open');

    const phoneInput = document.getElementById('login-phone-input');
    const sendOtpBtn = document.getElementById('btn-send-otp');
    const otpInput = document.getElementById('login-otp-input');
    const verifyOtpBtn = document.getElementById('btn-verify-otp');
    const resendBtn = document.getElementById('btn-resend-otp');
    const resendTimerSpan = document.getElementById('otp-timer-count');

    sendOtpBtn.onclick = () => {
      const phoneVal = phoneInput.value.trim().replace(/\D/g, '');
      if (phoneVal.length < 10) {
        this.showToast('Please enter a valid 10-digit mobile number', 'error');
        return;
      }

      this.generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
      phoneStep.style.display = 'none';
      verifyStep.style.display = 'block';
      otpInput.value = '';

      // Mock instant SMS notification toast
      this.showToast(`📩 PickMi SMS: Your verification code is ${this.generatedOtp}`);

      // Start 30s resend timer
      let timeLeft = 30;
      if (resendTimerSpan) resendTimerSpan.textContent = `${timeLeft}s`;
      if (resendBtn) resendBtn.disabled = true;

      clearInterval(this.otpTimerInterval);
      this.otpTimerInterval = setInterval(() => {
        timeLeft -= 1;
        if (resendTimerSpan) resendTimerSpan.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) {
          clearInterval(this.otpTimerInterval);
          if (resendBtn) resendBtn.disabled = false;
        }
      }, 1000);
    };

    verifyOtpBtn.onclick = () => {
      const enteredOtp = otpInput.value.trim();
      if (enteredOtp !== this.generatedOtp && enteredOtp !== '1234') {
        this.showToast("That code doesn't match. Check the code and try again.", 'error');
        return;
      }

      store.loginWithOtp(phoneInput.value);
      this.showToast('Login successful! Welcome to PickMi.');
      modal.classList.remove('open');

      if (onSuccessCallback) {
        onSuccessCallback();
      } else if (store.bookingDraft) {
        this.navigateTo('checkout');
      }
    };

    if (resendBtn) {
      resendBtn.onclick = () => {
        this.generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
        this.showToast(`📩 PickMi SMS: Your new verification code is ${this.generatedOtp}`);
        sendOtpBtn.click();
      };
    }
  }

  // Render Checkout Page
  renderCheckoutPage() {
    const vehicle = store.selectedVehicle || VEHICLE_CATEGORIES[1];
    const params = store.searchParams;
    const fare = this.calculateVehicleFare(vehicle);

    const vehicleSummaryBox = document.getElementById('checkout-vehicle-summary');
    const priceTableBox = document.getElementById('checkout-fare-summary-table');
    const passengerNameInput = document.getElementById('checkout-passenger-name');
    const passengerPhoneInput = document.getElementById('checkout-passenger-phone');
    const passengerEmailInput = document.getElementById('checkout-passenger-email');

    if (passengerNameInput) passengerNameInput.value = store.user.name || 'Karthik Prabhu';
    if (passengerPhoneInput) passengerPhoneInput.value = store.user.mobile || '+91 98401 23456';
    if (passengerEmailInput) passengerEmailInput.value = store.user.email || 'karthik@example.com';

    if (vehicleSummaryBox) {
      vehicleSummaryBox.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
          <div>
            <h4 style="font-size:1.15rem;font-weight:700;color:var(--text-main);">${vehicle.categoryName}</h4>
            <div style="font-size:0.85rem;color:var(--text-muted);">${vehicle.models}</div>
          </div>
          <span style="background:var(--primary-light);color:var(--primary);font-weight:700;font-size:0.82rem;padding:0.3rem 0.8rem;border-radius:var(--border-radius-pill);">
            ${params.serviceType.toUpperCase()}
          </span>
        </div>
        <div style="background:#f8fafc;padding:0.85rem;border-radius:var(--border-radius-md);font-size:0.85rem;display:flex;flex-direction:column;gap:0.4rem;">
          <div>📍 <strong>Pickup:</strong> ${params.pickup}</div>
          <div>🏁 <strong>Drop:</strong> ${params.drop}</div>
          <div>🕒 <strong>Time:</strong> ${params.departureDate} at ${params.departureTime}</div>
        </div>
      `;
    }

    if (priceTableBox) {
      priceTableBox.innerHTML = `
        <div class="fare-summary-row">
          <span>Base Cab Fare (${fare.distanceKm} km included)</span>
          <span>₹${fare.base.toLocaleString('en-IN')}</span>
        </div>
        ${fare.tolls > 0 ? `
          <div class="fare-summary-row">
            <span>Tolls & Highway Charges</span>
            <span>₹${fare.tolls.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}
        ${fare.driverAllowance > 0 ? `
          <div class="fare-summary-row">
            <span>Driver Allowance</span>
            <span>₹${fare.driverAllowance.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}
        <div class="fare-summary-row">
          <span>GST (5%)</span>
          <span>₹${fare.tax.toLocaleString('en-IN')}</span>
        </div>
        ${fare.discount > 0 ? `
          <div class="fare-summary-row discount">
            <span>Coupon Discount (${store.appliedCoupon?.code})</span>
            <span>- ₹${fare.discount.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}
        <div class="fare-summary-row bold">
          <span>Total Amount Payable</span>
          <span>₹${fare.total.toLocaleString('en-IN')}</span>
        </div>
      `;
    }

    // Coupon Apply Button
    const couponInput = document.getElementById('checkout-coupon-input');
    const applyCouponBtn = document.getElementById('btn-apply-checkout-coupon');
    if (applyCouponBtn && couponInput) {
      applyCouponBtn.onclick = () => {
        const code = couponInput.value.trim();
        if (!code) return;
        const res = store.applyCoupon(code);
        this.showToast(res.message, res.success ? 'info' : 'error');
        if (res.success) {
          this.renderCheckoutPage();
        }
      };
    }

    // Sticky Checkout Header Back Button
    document.getElementById('btn-checkout-back')?.addEventListener('click', () => {
      this.navigateTo('results');
    });

    // Dummy Promo Code Quote Apply Button
    const dummyQuoteBtn = document.getElementById('btn-apply-dummy-quote');
    const dummyQuoteCode = document.getElementById('dummy-quote-code');
    if (couponInput) {
      const applyDummyQuote = () => {
        couponInput.value = 'PICKFIRST';
        if (applyCouponBtn) applyCouponBtn.click();
      };
      if (dummyQuoteBtn) dummyQuoteBtn.onclick = applyDummyQuote;
      if (dummyQuoteCode) dummyQuoteCode.onclick = applyDummyQuote;
    }

    // Fixed Bottom Confirmation Bar Controls
    const paymentDropdown = document.getElementById('checkout-payment-dropdown');
    const fixedConfirmBtn = document.getElementById('btn-fixed-confirm-trip');
    const bottomSubText = document.getElementById('checkout-bottom-sub');

    const updatePaymentDisplay = () => {
      const mode = paymentDropdown ? paymentDropdown.value : 'advance_100';
      const remainingAmount = Math.max(0, fare.total - 100);

      if (mode === 'advance_100') {
        if (bottomSubText) {
          bottomSubText.textContent = `₹100 advance online · Remaining ₹${remainingAmount.toLocaleString('en-IN')} to driver`;
        }
        if (fixedConfirmBtn) {
          fixedConfirmBtn.textContent = 'Pay ₹100 & Confirm';
        }
      } else {
        if (bottomSubText) {
          bottomSubText.textContent = `Pay full ₹${fare.total.toLocaleString('en-IN')} directly to chauffeur at trip end`;
        }
        if (fixedConfirmBtn) {
          fixedConfirmBtn.textContent = 'Confirm Your Trip';
        }
      }
    };

    if (paymentDropdown) {
      paymentDropdown.onchange = updatePaymentDisplay;
      updatePaymentDisplay();
    }

    const executeBookingConfirmation = (triggerBtn) => {
      const pName = passengerNameInput?.value || 'Karthik Prabhu';
      const pPhone = passengerPhoneInput?.value || '+91 98401 23456';
      const pEmail = passengerEmailInput?.value || 'karthik@example.com';
      const notes = document.getElementById('checkout-pickup-notes')?.value || '';
      const mode = paymentDropdown ? paymentDropdown.value : 'advance_100';
      const paymentMethodLabel = mode === 'advance_100'
        ? `Advance ₹100 Paid (₹${Math.max(0, fare.total - 100).toLocaleString('en-IN')} to Driver)`
        : 'Pay Full to Driver (Cash/UPI)';

      if (triggerBtn) {
        triggerBtn.disabled = true;
        triggerBtn.textContent = 'Confirming Trip...';
      }

      setTimeout(() => {
        const newBooking = store.createBooking({
          vehicle: vehicle,
          fare: fare,
          passengerName: pName,
          passengerPhone: pPhone,
          passengerEmail: pEmail,
          pickupNotes: notes,
          paymentMethod: paymentMethodLabel,
          distanceKm: fare.distanceKm
        });

        if (triggerBtn) {
          triggerBtn.disabled = false;
        }
        updatePaymentDisplay();
        this.renderConfirmationPage(newBooking);
        this.navigateTo('confirmation');
      }, 600);
    };

    if (fixedConfirmBtn) {
      fixedConfirmBtn.onclick = () => executeBookingConfirmation(fixedConfirmBtn);
    }

    const confirmBookingBtn = document.getElementById('btn-confirm-booking-pay');
    if (confirmBookingBtn) {
      confirmBookingBtn.onclick = () => executeBookingConfirmation(confirmBookingBtn);
    }
  }

  // Render Confirmation Page (Split Screen Layout Matching Benchmark)
  renderConfirmationPage(booking) {
    if (!booking) {
      booking = this.lastBooking || store.getLastBooking();
    }
    const container = document.getElementById('confirmation-details-box');
    if (!container || !booking) return;

    // Price formatting
    const rawTotal = booking.fare?.total || 474.8;
    const formattedPrice = (typeof rawTotal === 'number' && rawTotal % 1 !== 0)
      ? rawTotal.toFixed(2)
      : (typeof rawTotal === 'number' ? rawTotal.toLocaleString('en-IN') : rawTotal);

    // Date & Time formatting (e.g. 10:10AM | 12 - 12 - 2026)
    let formattedDate = '12 - 12 - 2026';
    if (booking.departureDate && booking.departureDate.includes('-')) {
      const [y, m, d] = booking.departureDate.split('-');
      formattedDate = `${d} - ${m} - ${y}`;
    }

    let formattedTime = '10:10AM';
    if (booking.pickupTime) {
      const timeMatch = booking.pickupTime.match(/\d{1,2}:\d{2}\s*(?:AM|PM)?/i);
      if (timeMatch) {
        formattedTime = timeMatch[0].replace(/\s+/g, '');
      }
    }

    // Service & Vehicle tags
    const serviceTypeStr = booking.serviceType
      ? booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1)
      : 'Intercity';
    const vehicleCatStr = booking.vehicleCategory || 'Sedan';

    // Route Addresses
    const pickupAddress = booking.pickup || '46 7th Cross Rd, 1st Phase, J. P. Nagar, Bengaluru, 560078';
    const dropAddress = booking.drop || 'Marvell India Private Limited, Bangalor Bellandur, Bengaluru, 560103';
    const notesContent = booking.pickupNotes || dropAddress;

    container.innerHTML = `
      <div class="confirm-split-container">
        <!-- Left Side: Fixed -->
        <div class="confirm-fixed-left">
          <button type="button" class="confirm-back-arrow-btn" id="confirm-back-arrow" title="Back to Home" aria-label="Back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div class="confirm-check-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 class="confirm-title">Reservation<br>successfully confirmed.</h2>
          <p class="confirm-cancel-note">You can cancel at any time</p>
        </div>

        <!-- Right Side: Scrollable Details -->
        <div class="confirm-scrollable-right">
          <!-- Top Row: Price & Car Graphic -->
          <div class="confirm-price-car-row">
            <div class="confirm-total-fare">₹${formattedPrice}</div>
            <div class="confirm-car-illustration">
              <svg width="130" height="80" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="80" cy="85" rx="65" ry="7" fill="#e2e8f0"/>
                <path d="M22 66C22 58 28 53 36 51L60 36C68 31 80 29 105 29L125 31C138 33 146 41 148 53L150 66C150 72 145 76 138 76H32C26 76 22 72 22 66Z" fill="#2563eb"/>
                <path d="M26 64C26 57 31 52 38 50L62 36C70 31 82 29 104 29L123 31C135 33 143 40 145 52L147 64C147 70 142 74 135 74H36C30 74 26 70 26 64Z" fill="#ffffff"/>
                <path d="M62 37L42 51H68V37H62Z" fill="#93c5fd" opacity="0.85"/>
                <path d="M74 37V51H112V37H74Z" fill="#93c5fd" opacity="0.85"/>
                <path d="M118 38V51H136C133 44 128 40 121 38H118Z" fill="#93c5fd" opacity="0.85"/>
                <circle cx="48" cy="74" r="13" fill="#0f172a"/>
                <circle cx="48" cy="74" r="6" fill="#cbd5e1"/>
                <circle cx="122" cy="74" r="13" fill="#0f172a"/>
                <circle cx="122" cy="74" r="6" fill="#cbd5e1"/>
                <circle cx="28" cy="60" r="3" fill="#3b82f6"/>
              </svg>
            </div>
          </div>

          <!-- Tags Row -->
          <div class="confirm-tags-row">
            <div class="confirm-info-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${formattedTime} | ${formattedDate}</span>
            </div>
            <div class="confirm-info-pill">${serviceTypeStr}</div>
            <div class="confirm-info-pill">${vehicleCatStr}</div>
          </div>

          <div class="confirm-divider-line"></div>

          <!-- Route Path with connecting line -->
          <div class="confirm-route-block">
            <div class="confirm-route-point">
              <div class="point-marker-dot"></div>
              <div class="point-text">${pickupAddress}</div>
            </div>
            <div class="point-vertical-line"></div>
            <div class="confirm-route-point">
              <div class="point-marker-square"></div>
              <div class="point-text">${dropAddress}</div>
            </div>
          </div>

          <div class="confirm-divider-line"></div>

          <!-- Notes Section -->
          <div class="confirm-notes-block">
            <div class="notes-heading">Notes</div>
            <div class="notes-body">${notesContent}</div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('confirm-back-arrow')?.addEventListener('click', () => {
      this.navigateTo('home');
    });
  }

  // Render My Trips with Status Filter Tabs (Section 10 & 11)
  renderTripsList(statusFilter = 'all') {
    const tripsContainer = document.getElementById('trips-list-container');
    if (!tripsContainer) return;

    // Filter tabs setup
    document.querySelectorAll('.trip-tab-btn').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.status === statusFilter);
      tab.onclick = () => {
        this.renderTripsList(tab.dataset.status);
      };
    });

    const filtered = store.trips.filter(t => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'upcoming') return t.statusBadge === 'Upcoming';
      if (statusFilter === 'ongoing') return t.statusBadge === 'Ongoing';
      if (statusFilter === 'completed') return t.statusBadge === 'Completed';
      if (statusFilter === 'cancelled') return t.statusBadge === 'Cancelled';
      return true;
    });

    if (filtered.length === 0) {
      tripsContainer.innerHTML = `
        <div style="text-align:center;padding:4rem 1rem;background:#fff;border-radius:var(--border-radius-xl);border:1px dashed var(--border-light);">
          <div style="font-size:3rem;margin-bottom:1rem;">🚕</div>
          <h3 style="font-size:1.25rem;font-weight:700;color:var(--text-main);margin-bottom:0.5rem;">No trips found in this category</h3>
          <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1.5rem;">Ready to travel? Book your reliable cab ride with PickMi in seconds.</p>
          <button class="btn-primary-search" id="btn-empty-book-now">Book a Cab</button>
        </div>
      `;
      document.getElementById('btn-empty-book-now')?.addEventListener('click', () => this.navigateTo('home'));
      return;
    }

    tripsContainer.innerHTML = filtered.map(trip => `
      <div class="trip-item-card" data-trip-id="${trip.id}">
        <div class="trip-item-header">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <strong style="font-size:1.05rem;color:var(--primary);">${trip.id}</strong>
            <span style="font-size:0.8rem;color:var(--text-muted);">| ${trip.serviceType.toUpperCase()}</span>
          </div>
          <span class="trip-status-badge ${trip.statusBadge.toLowerCase()}">${trip.status}</span>
        </div>

        <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:1.5rem;align-items:center;">
          <div>
            <div style="font-size:0.95rem;font-weight:700;color:var(--text-main);margin-bottom:0.25rem;">
              📍 ${trip.pickup}
            </div>
            <div style="font-size:0.95rem;font-weight:700;color:var(--text-muted);">
              🏁 ${trip.drop}
            </div>
            <div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.35rem;">
              🕒 Pickup: <strong>${trip.pickupTime}</strong>
            </div>
          </div>

          <div>
            <div style="font-size:0.95rem;font-weight:700;">${trip.vehicleCategory}</div>
            <div style="font-size:0.82rem;color:var(--text-muted);">${trip.vehicleModel || 'Assigned Cab'}</div>
            ${trip.driver ? `
              <div style="font-size:0.82rem;color:var(--text-main);margin-top:0.25rem;">
                Chauffeur: <strong>${trip.driver.name}</strong> (★ ${trip.driver.rating})
              </div>
            ` : ''}
          </div>

          <div style="text-align:right;">
            <div style="font-size:1.35rem;font-weight:800;color:var(--text-main);">₹${trip.fare.total.toLocaleString('en-IN')}</div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.6rem;">${trip.fare.balanceDue > 0 ? `₹${trip.fare.balanceDue} due to driver` : 'Paid in Full'}</div>
            <button class="btn-modify-search" style="padding:0.45rem 1rem;" data-open-trip-id="${trip.id}">View Details</button>
          </div>
        </div>

        ${trip.reservationOtp && trip.statusBadge === 'Upcoming' ? `
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:0.65rem 1rem;border-radius:var(--border-radius-md);display:flex;align-items:center;justify-content:space-between;font-size:0.85rem;">
            <span style="color:#166534;font-weight:600;">🔑 Reservation Trip OTP for Driver:</span>
            <span style="font-size:1.15rem;font-weight:800;letter-spacing:2px;color:#15803d;">${trip.reservationOtp}</span>
          </div>
        ` : ''}
      </div>
    `).join('');

    // Attach click events
    tripsContainer.querySelectorAll('[data-open-trip-id]').forEach(btn => {
      btn.onclick = () => {
        const tripId = btn.dataset.openTripId;
        this.navigateTo('trip-detail', tripId);
      };
    });
  }

  // Show Comprehensive Trip Details (Section 11)
  showTripDetailView(tripId) {
    const trip = store.trips.find(t => t.id === tripId);
    if (!trip) {
      this.showToast('Trip not found', 'error');
      this.navigateTo('trips');
      return;
    }

    this.activeTripDetail = trip;
    this.showView('trip-detail');

    const detailContainer = document.getElementById('trip-detail-content');
    if (!detailContainer) return;

    detailContainer.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
        <div>
          <button class="btn-modify-search" id="btn-back-to-trips" style="margin-bottom:0.75rem;">← Back to My Trips</button>
          <h2 style="font-size:1.6rem;font-weight:800;color:var(--text-main);">Trip Details: ${trip.id}</h2>
          <div style="font-size:0.88rem;color:var(--text-muted);">Service: ${trip.serviceType.toUpperCase()} | Booked on PickMi</div>
        </div>
        <span class="trip-status-badge ${trip.statusBadge.toLowerCase()}" style="font-size:0.95rem;padding:0.5rem 1.25rem;">
          Status: ${trip.status}
        </span>
      </div>

      <div style="display:grid;grid-template-columns:2fr 1fr;gap:2rem;">
        <div>
          <!-- Reservation OTP Card -->
          ${trip.reservationOtp && trip.status !== 'Completed' && trip.status !== 'Cancelled' ? `
            <div class="reservation-otp-card" style="margin-top:0;">
              <div>
                <div style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;">
                  Trip-Start Verification OTP
                </div>
                <div style="font-size:0.88rem;color:#e2e8f0;margin-top:0.25rem;">
                  Share with your driver before starting journey to verify ride.
                </div>
              </div>
              <div class="otp-number-display">${trip.reservationOtp}</div>
            </div>
          ` : ''}

          <!-- Route & Schedule Card -->
          <div class="checkout-card">
            <h4 class="card-heading">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Route & Schedule
            </h4>
            <div style="display:flex;flex-direction:column;gap:1rem;">
              <div style="display:flex;gap:0.75rem;">
                <div style="color:var(--primary);font-size:1.2rem;">📍</div>
                <div>
                  <div style="font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);font-weight:700;">Pickup Location</div>
                  <div style="font-weight:600;font-size:0.95rem;">${trip.pickup}</div>
                  <div style="font-size:0.82rem;color:var(--text-muted);">Scheduled: ${trip.pickupTime}</div>
                </div>
              </div>
              <div style="display:flex;gap:0.75rem;">
                <div style="color:var(--accent-red);font-size:1.2rem;">🏁</div>
                <div>
                  <div style="font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);font-weight:700;">Drop Location</div>
                  <div style="font-weight:600;font-size:0.95rem;">${trip.drop}</div>
                  <div style="font-size:0.82rem;color:var(--text-muted);">Estimated Distance: ${trip.distanceKm || 40} km</div>
                </div>
              </div>
              ${trip.pickupNotes ? `
                <div style="background:#f8fafc;padding:0.75rem 1rem;border-radius:var(--border-radius-md);font-size:0.85rem;color:var(--text-muted);">
                  <strong>Special Instructions:</strong> ${trip.pickupNotes}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Driver & Vehicle Card (Section 12) -->
          ${trip.driver ? `
            <div class="checkout-card">
              <h4 class="card-heading">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Driver & Vehicle Details
              </h4>
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
                <div style="display:flex;align-items:center;gap:1rem;">
                  <div style="width:54px;height:54px;background:#e2e8f0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:var(--primary);font-weight:700;">
                    ${trip.driver.name[0]}
                  </div>
                  <div>
                    <div style="font-size:1.1rem;font-weight:700;color:var(--text-main);">
                      ${trip.driver.name} <span style="font-size:0.85rem;color:var(--accent-gold);background:#fef3c7;padding:0.15rem 0.5rem;border-radius:var(--border-radius-pill);">★ ${trip.driver.rating}</span>
                    </div>
                    <div style="font-size:0.85rem;color:var(--text-muted);">${trip.driver.tripsDone}+ successful trips with PickMi</div>
                    <div style="font-size:0.85rem;font-weight:600;color:var(--primary);margin-top:0.2rem;">
                      ${trip.vehicleModel} • Reg: ${trip.vehicleReg}
                    </div>
                  </div>
                </div>

                <div style="display:flex;flex-direction:column;gap:0.4rem;align-items:flex-end;">
                  <div style="font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                    Chauffeur Mobile: <strong style="color:var(--text-main);">${trip.driver.fullPhone || trip.driver.phone || '+91 98402 88412'}</strong>
                  </div>
                  <a href="tel:${trip.driver.fullPhone || trip.driver.phone || '+919840288412'}" class="btn-modify-search" id="btn-call-driver" style="display:flex;align-items:center;gap:0.4rem;text-decoration:none;font-weight:700;color:var(--primary);border-color:var(--primary);padding:0.55rem 1.25rem;">
                    📞 Call Driver
                  </a>
                </div>
              </div>
            </div>
          ` : `
            <div class="checkout-card" style="background:#fffbeb;border:1.5px solid #fde68a;">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
                <div style="display:flex;align-items:center;gap:0.85rem;">
                  <div style="font-size:1.8rem;">⏳</div>
                  <div>
                    <div style="font-weight:800;color:#92400e;font-size:1rem;">Driver Not Yet Assigned</div>
                    <div style="font-size:0.84rem;color:#78350f;margin-top:0.15rem;">
                      Chauffeur details will be automatically assigned and SMS'd to your phone 2 hours prior to pickup.
                    </div>
                  </div>
                </div>
                <button class="btn-modify-search" id="btn-detail-assign-demo" style="background:#ffffff;border-color:#d97706;color:#92400e;font-weight:700;font-size:0.82rem;padding:0.45rem 0.9rem;">
                  ⚡ Assign Driver (Demo)
                </button>
              </div>
            </div>
          `}

          <!-- Lifecycle Testing Simulator (Interactive Demo) -->
          <div class="checkout-card" style="background:#f8faff;border-color:rgba(0,99,247,0.3);">
            <h4 class="card-heading" style="color:var(--primary);">
              ⚡ Live Trip Status Progression Simulator
            </h4>
            <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem;">
              Test driver assignment, trip start verification, and trip completion lifecycles as specified in documentation.
            </p>
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
              <button class="btn-modify-search" id="sim-en-route">Simulate "Driver Arrived"</button>
              <button class="btn-modify-search" id="sim-start-trip">Simulate "Trip In Progress (OTP Verified)"</button>
              <button class="btn-modify-search" id="sim-complete-trip">Simulate "Trip Completed"</button>
            </div>
          </div>
        </div>

        <!-- Sidebar Actions & Fare Breakdown -->
        <div>
          <div class="checkout-card">
            <h4 class="card-heading">Payment & Fare</h4>
            <div class="fare-summary-table" style="margin-bottom:1.25rem;">
              <div class="fare-summary-row">
                <span>Base Fare</span>
                <span>₹${trip.fare.base.toLocaleString('en-IN')}</span>
              </div>
              ${trip.fare.tolls > 0 ? `
                <div class="fare-summary-row">
                  <span>Tolls & Taxes</span>
                  <span>₹${trip.fare.tolls.toLocaleString('en-IN')}</span>
                </div>
              ` : ''}
              <div class="fare-summary-row">
                <span>GST (5%)</span>
                <span>₹${trip.fare.tax.toLocaleString('en-IN')}</span>
              </div>
              ${trip.fare.discount > 0 ? `
                <div class="fare-summary-row discount">
                  <span>Discount</span>
                  <span>- ₹${trip.fare.discount.toLocaleString('en-IN')}</span>
                </div>
              ` : ''}
              <div class="fare-summary-row bold">
                <span>Total Fare</span>
                <span>₹${trip.fare.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div style="font-size:0.82rem;color:var(--text-muted);background:#f8fafc;padding:0.75rem;border-radius:var(--border-radius-md);margin-bottom:1.5rem;">
              Payment Mode: <strong>${trip.paymentMethod || 'UPI Prepaid'}</strong><br>
              Status: <span style="color:var(--accent-green);font-weight:700;">Paid in Full</span>
            </div>

            <!-- Action buttons -->
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
              <button class="btn-primary-search" id="btn-download-tax-invoice" style="width:100%;font-size:0.9rem;padding:0.75rem;">
                🧾 View / Print Tax Invoice
              </button>

              ${trip.status !== 'Cancelled' && trip.status !== 'Completed' ? `
                <button class="btn-modify-search" id="btn-modify-trip-date" style="width:100%;">
                  ✏️ Reschedule Pickup Time
                </button>
                <button class="btn-modify-search" id="btn-cancel-this-trip" style="width:100%;color:var(--accent-red);border-color:var(--accent-red);">
                  ✕ Cancel Booking
                </button>
              ` : ''}

              <button class="btn-modify-search" id="btn-trip-support" style="width:100%;">
                🎧 Need Help with this Trip
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Event Handlers
    document.getElementById('btn-back-to-trips')?.addEventListener('click', () => {
      this.navigateTo('account', 'trips');
    });

    document.getElementById('btn-call-driver')?.addEventListener('click', () => {
      this.showToast(`Connecting direct call to driver ${trip.driver?.name || 'Chauffeur'} (${trip.driver?.fullPhone || trip.driver?.phone || '+91 98402 88412'})...`);
    });

    document.getElementById('btn-detail-assign-demo')?.addEventListener('click', () => {
      store.assignDriver(trip.id);
      this.showToast('Chauffeur assigned successfully!');
      this.showTripDetailView(trip.id);
    });

    // Invoice Print
    document.getElementById('btn-download-tax-invoice')?.addEventListener('click', () => {
      this.openInvoiceModal(trip);
    });

    // Cancellation
    document.getElementById('btn-cancel-this-trip')?.addEventListener('click', () => {
      this.openCancelModal(trip);
    });

    // Reschedule
    document.getElementById('btn-modify-trip-date')?.addEventListener('click', () => {
      this.openRescheduleModal(trip);
    });

    // Support with prefilled booking ID (Section 13)
    document.getElementById('btn-trip-support')?.addEventListener('click', () => {
      this.navigateTo('support');
      setTimeout(() => {
        const supportRefInput = document.getElementById('support-booking-ref');
        if (supportRefInput) supportRefInput.value = trip.id;
      }, 100);
    });

    // Status Simulators
    document.getElementById('sim-en-route')?.addEventListener('click', () => {
      store.progressTripStatus(trip.id, 'Driver Arrived at Pickup');
      this.showToast('Driver has arrived at pickup location!');
      this.showTripDetailView(trip.id);
    });

    document.getElementById('sim-start-trip')?.addEventListener('click', () => {
      store.progressTripStatus(trip.id, 'In Progress');
      this.showToast('Driver verified OTP. Trip is now In Progress!');
      this.showTripDetailView(trip.id);
    });

    document.getElementById('sim-complete-trip')?.addEventListener('click', () => {
      store.progressTripStatus(trip.id, 'Completed');
      this.showToast('Trip marked Completed. Tax invoice generated!');
      this.showTripDetailView(trip.id);
    });
  }

  // Invoice Modal
  openInvoiceModal(trip) {
    const modal = document.getElementById('invoice-modal');
    const content = document.getElementById('invoice-modal-content');
    if (!modal || !content) return;

    const invNum = trip.invoiceNumber || 'INV-2026-10-' + trip.id.replace('PKM-', '');
    content.innerHTML = `
      <div style="border-bottom:2px solid var(--primary);padding-bottom:1rem;margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h2 style="font-size:1.5rem;font-weight:900;color:var(--primary);">PICKMI CAB SERVICES</h2>
          <div style="font-size:0.8rem;color:var(--text-muted);">GSTIN: 33AAECP8892K1Z9 | CIN: U63090TN2026PTC109823</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:1.1rem;font-weight:800;">TAX INVOICE</div>
          <div style="font-size:0.82rem;color:var(--text-muted);">${invNum}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem;font-size:0.88rem;">
        <div>
          <strong>Billed To:</strong><br>
          ${trip.passengerName}<br>
          ${trip.passengerPhone}<br>
          ${trip.passengerEmail}
        </div>
        <div>
          <strong>Booking Details:</strong><br>
          Booking ID: <strong>${trip.id}</strong><br>
          Service: ${trip.serviceType.toUpperCase()}<br>
          Cab: ${trip.vehicleCategory} (${trip.vehicleReg || 'Standard'})
        </div>
      </div>

      <div style="background:#f8fafc;padding:1rem;border-radius:var(--border-radius-md);margin-bottom:1.5rem;font-size:0.85rem;">
        <div>📍 <strong>Pickup:</strong> ${trip.pickup} (${trip.pickupTime})</div>
        <div>🏁 <strong>Drop:</strong> ${trip.drop}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem;font-size:0.9rem;">
        <thead>
          <tr style="background:#f1f5f9;border-bottom:1px solid #cbd5e1;text-align:left;">
            <th style="padding:0.6rem;">Description</th>
            <th style="padding:0.6rem;text-align:right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:0.6rem;border-bottom:1px solid #f1f5f9;">Base Chauffeur Ride Fare</td>
            <td style="padding:0.6rem;border-bottom:1px solid #f1f5f9;text-align:right;">₹${trip.fare.base}</td>
          </tr>
          ${trip.fare.tolls > 0 ? `
            <tr>
              <td style="padding:0.6rem;border-bottom:1px solid #f1f5f9;">Tolls & Government Charges</td>
              <td style="padding:0.6rem;border-bottom:1px solid #f1f5f9;text-align:right;">₹${trip.fare.tolls}</td>
            </tr>
          ` : ''}
          <tr>
            <td style="padding:0.6rem;border-bottom:1px solid #f1f5f9;">GST (5% SAC Code 9964)</td>
            <td style="padding:0.6rem;border-bottom:1px solid #f1f5f9;text-align:right;">₹${trip.fare.tax}</td>
          </tr>
          ${trip.fare.discount > 0 ? `
            <tr style="color:var(--accent-green);">
              <td style="padding:0.6rem;border-bottom:1px solid #f1f5f9;">Promotional Discount</td>
              <td style="padding:0.6rem;border-bottom:1px solid #f1f5f9;text-align:right;">- ₹${trip.fare.discount}</td>
            </tr>
          ` : ''}
          <tr style="font-weight:800;font-size:1.05rem;">
            <td style="padding:0.8rem 0.6rem;">Total Paid (Net)</td>
            <td style="padding:0.8rem 0.6rem;text-align:right;">₹${trip.fare.total}</td>
          </tr>
        </tbody>
      </table>

      <div style="display:flex;justify-content:space-between;align-items:center;">
        <button class="btn-modify-search" onclick="window.print()">🖨️ Print / Save PDF</button>
        <span style="font-size:0.8rem;color:var(--text-muted);">Computer generated invoice. No signature required.</span>
      </div>
    `;

    modal.classList.add('open');
  }

  // Cancel Booking Modal (Contact Admin / Support to Cancel - Requested by user)
  openCancelModal(trip) {
    const modal = document.getElementById('cancel-trip-modal');
    const content = document.getElementById('cancel-trip-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="text-align:center;margin-bottom:1.25rem;">
        <div style="width:54px;height:54px;background:#fef2f2;color:#dc2626;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:1.6rem;margin-bottom:0.75rem;">
          📞
        </div>
        <h3 style="font-size:1.25rem;font-weight:800;color:var(--text-main);margin-bottom:0.4rem;">
          Contact Support to Cancel Ride
        </h3>
        <p style="font-size:0.88rem;color:var(--text-muted);margin:0;line-height:1.5;">
          Direct cancellation is restricted for confirmed booking <strong>${trip.id}</strong>. Please reach out to our admin / helpline team below to request cancellation.
        </p>
      </div>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:1.25rem;margin-bottom:1.5rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:1px solid #e2e8f0;flex-wrap:wrap;gap:0.75rem;">
          <div>
            <div style="font-size:0.75rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Customer Care Helpline</div>
            <div style="font-size:1.15rem;font-weight:800;color:#111111;margin-top:0.2rem;">1800-209-PICK (7425)</div>
            <div style="font-size:0.78rem;color:#059669;font-weight:600;">Toll-Free &bull; Available 24/7</div>
          </div>
          <a href="tel:18002097425" class="btn-primary-search" style="padding:0.5rem 1.1rem;font-size:0.85rem;text-decoration:none;">
            📞 Call Support
          </a>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;">
          <div>
            <div style="font-size:0.75rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Direct Admin Support</div>
            <div style="font-size:1.15rem;font-weight:800;color:#111111;margin-top:0.2rem;">+91 98401 23456</div>
            <div style="font-size:0.78rem;color:#64748b;">WhatsApp & Direct Line</div>
          </div>
          <div style="display:flex;gap:0.5rem;">
            <a href="tel:+919840123456" class="btn-modify-search" style="padding:0.5rem 0.9rem;font-size:0.85rem;text-decoration:none;">
              📞 Call
            </a>
            <a href="https://wa.me/919840123456?text=Hi%20PickMi%20Support%2C%20I%20would%20like%20to%20cancel%20booking%20${trip.id}" target="_blank" rel="noopener" class="btn-modify-search" style="padding:0.5rem 0.9rem;font-size:0.85rem;text-decoration:none;background:#25d366;color:#ffffff;border-color:#25d366;font-weight:700;">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:1rem;">
        <button class="btn-modify-search" id="btn-close-cancel-modal" style="width:100%;padding:0.7rem;">Keep My Booking</button>
      </div>
    `;

    modal.classList.add('open');

    document.getElementById('btn-close-cancel-modal')?.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  // Reschedule Modal
  openRescheduleModal(trip) {
    const modal = document.getElementById('reschedule-trip-modal');
    const content = document.getElementById('reschedule-trip-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <h3 style="font-size:1.25rem;font-weight:700;color:var(--text-main);margin-bottom:0.75rem;">
        Reschedule Pickup for ${trip.id}
      </h3>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.25rem;">
        Choose a new pickup date and time. Free rescheduling is permitted up to 2 hours before scheduled pickup.
      </p>

      <div class="form-row" style="margin-bottom:1.25rem;">
        <div class="input-group">
          <label>New Date</label>
          <input type="date" id="reschedule-date" value="${trip.departureDate || '2026-10-15'}">
        </div>
        <div class="input-group">
          <label>New Time</label>
          <input type="time" id="reschedule-time" value="09:00">
        </div>
      </div>

      <div style="display:flex;gap:1rem;">
        <button class="btn-modify-search" id="btn-abort-reschedule" style="flex:1;">Cancel</button>
        <button class="btn-primary-search" id="btn-confirm-reschedule" style="flex:1;">Save New Time</button>
      </div>
    `;

    modal.classList.add('open');

    document.getElementById('btn-abort-reschedule')?.addEventListener('click', () => modal.classList.remove('open'));
    document.getElementById('btn-confirm-reschedule')?.addEventListener('click', () => {
      const newD = document.getElementById('reschedule-date')?.value;
      const newT = document.getElementById('reschedule-time')?.value;
      store.modifyBookingTime(trip.id, newD, newT);
      this.showToast(`Pickup updated to ${newD} at ${newT}!`);
      modal.classList.remove('open');
      this.showTripDetailView(trip.id);
    });
  }

  // Comprehensive Customer Account & Trip Management Dashboard (Requested by user)
  // Comprehensive Customer Account & Trip Management Dashboard (Requested by user)
  renderAccountPage(activeTab = 'profile') {
    const user = store.user;
    const trips = store.trips || [];

    // 1. Update Top Profile Hero Banner (Gray section under header)
    const avatarEl = document.getElementById('profile-display-avatar');
    const nameEl = document.getElementById('profile-display-name');
    const contactEl = document.getElementById('profile-display-contact');
    const phoneDisplayEl = document.getElementById('profile-display-phone');
    const emailDisplayEl = document.getElementById('profile-display-email');
    const statUpcoming = document.getElementById('profile-stat-upcoming');
    const statHistory = document.getElementById('profile-stat-history');

    const upcomingCount = trips.filter(t => t.statusBadge === 'Upcoming').length;
    const completedCount = trips.filter(t => t.statusBadge === 'Completed').length;

    if (avatarEl) {
      avatarEl.textContent = (user.name || 'User').split(' ').map(n => n[0]).join('').slice(0, 2);
    }
    if (nameEl) nameEl.textContent = user.name || 'Valued Passenger';
    if (phoneDisplayEl) phoneDisplayEl.textContent = user.mobile || '+91 98401 23456';
    if (emailDisplayEl) emailDisplayEl.textContent = user.email || 'karthik.prabhu@example.com';
    if (contactEl && !phoneDisplayEl) contactEl.textContent = `${user.mobile || ''} • ${user.email || ''}`;
    if (statUpcoming) statUpcoming.textContent = upcomingCount;
    if (statHistory) statHistory.textContent = completedCount;

    // 2. Primary Tabs: Profile | My Bookings | Support
    const tabBtns = document.querySelectorAll('.profile-main-tab-btn');
    const tabSections = {
      profile: document.getElementById('profile-tab-profile-content'),
      trips: document.getElementById('profile-tab-trips-content'),
      support: document.getElementById('profile-tab-support-content')
    };

    const activateTab = (tabName) => {
      tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.profileTab === tabName));
      Object.entries(tabSections).forEach(([name, sec]) => {
        if (sec) sec.style.display = name === tabName ? 'block' : 'none';
      });
    };

    tabBtns.forEach(btn => {
      btn.onclick = () => activateTab(btn.dataset.profileTab);
    });
    activateTab(activeTab);

    // 3. Tab 1: Profile Details (Read-only default view, Edit toggle, Fixed phone, Sign out)
    const dispName = document.getElementById('disp-profile-name');
    const dispPhone = document.getElementById('disp-profile-phone');
    const dispEmail = document.getElementById('disp-profile-email');
    const dispCity = document.getElementById('disp-profile-city');

    if (dispName) dispName.textContent = user.name || 'Valued Passenger';
    if (dispPhone) dispPhone.textContent = user.mobile || '+91 98401 23456';
    if (dispEmail) dispEmail.textContent = user.email || 'karthik.prabhu@example.com';
    if (dispCity) dispCity.textContent = user.city ? `${user.city}, Tamil Nadu` : 'Chennai, Tamil Nadu';

    const readonlyView = document.getElementById('profile-readonly-view');
    const editForm = document.getElementById('profile-edit-form');
    const toggleEditBtn = document.getElementById('btn-toggle-profile-edit');
    const cancelEditBtn = document.getElementById('btn-cancel-profile-edit');

    const nameInput = document.getElementById('profile-name-input');
    const phoneInput = document.getElementById('profile-phone-input');
    const emailInput = document.getElementById('profile-email-input');
    const cityInput = document.getElementById('profile-city-input');

    if (nameInput) nameInput.value = user.name || '';
    if (phoneInput) phoneInput.value = user.mobile || '+91 98401 23456';
    if (emailInput) emailInput.value = user.email || '';
    if (cityInput) cityInput.value = user.city || 'Chennai';

    if (readonlyView && editForm) {
      readonlyView.style.display = 'block';
      editForm.style.display = 'none';

      if (toggleEditBtn) {
        toggleEditBtn.onclick = () => {
          readonlyView.style.display = 'none';
          editForm.style.display = 'block';
        };
      }

      if (cancelEditBtn) {
        cancelEditBtn.onclick = () => {
          editForm.style.display = 'none';
          readonlyView.style.display = 'block';
          if (nameInput) nameInput.value = user.name || '';
          if (emailInput) emailInput.value = user.email || '';
          if (cityInput) cityInput.value = user.city || 'Chennai';
        };
      }
    }

    const saveBtn = document.getElementById('btn-save-profile');
    if (saveBtn) {
      saveBtn.onclick = (e) => {
        e.preventDefault();
        const updatedName = nameInput?.value.trim() || user.name;
        const updatedEmail = emailInput?.value.trim() || user.email;
        const updatedCity = cityInput?.value.trim() || user.city;

        store.updateProfile({
          name: updatedName,
          email: updatedEmail,
          city: updatedCity
        });

        this.showToast('Profile updated successfully! ✓');
        this.updateUserUI();
        if (readonlyView && editForm) {
          editForm.style.display = 'none';
          readonlyView.style.display = 'block';
        }
        this.renderAccountPage('profile');
      };
    }

    const logoutBtn = document.getElementById('btn-account-logout');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        store.logout();
        this.showToast('Signed out of PickMi.');
        this.updateUserUI();
        this.navigateTo('home');
      };
    }

    // 4. Tab 2: My Bookings (Clean card list: Booking ID + City Route: "Chennai → Pondicherry")
    const tripsContainer = document.getElementById('account-trips-list-container');
    if (tripsContainer) {
      if (trips.length === 0) {
        tripsContainer.innerHTML = `
          <div style="text-align:center;padding:3.5rem 1rem;background:#fff;border-radius:16px;border:1px dashed #cbd5e1;">
            <div style="font-size:2.5rem;margin-bottom:0.75rem;">🚕</div>
            <h4 style="font-size:1.15rem;font-weight:700;color:#0f172a;margin-bottom:0.35rem;">No bookings found</h4>
            <p style="color:#64748b;font-size:0.88rem;margin-bottom:1.25rem;">Book your next ride with PickMi in seconds.</p>
            <button class="btn-primary-search" id="btn-empty-book-cab" style="padding:0.6rem 1.5rem;font-size:0.9rem;">Book a Cab</button>
          </div>
        `;
        document.getElementById('btn-empty-book-cab')?.addEventListener('click', () => this.navigateTo('home'));
      } else {
        tripsContainer.innerHTML = trips.map(trip => {
          // Extract city names from pickup & drop
          const pickupCity = (trip.pickup || 'Origin').split(',')[0].trim();
          const dropCity = (trip.drop || 'Destination').split(',')[0].trim();

          return `
            <div class="clean-booking-card" data-trip-id="${trip.id}">
              <div class="booking-card-main-info">
                <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
                  <span class="booking-id-tag">${trip.id}</span>
                  <span class="trip-status-badge ${trip.statusBadge.toLowerCase()}">${trip.status}</span>
                </div>
                <div class="booking-city-route">
                  <span>${pickupCity}</span>
                  <span class="route-arrow">→</span>
                  <span>${dropCity}</span>
                </div>
                <div class="booking-date-sub">
                  📅 ${trip.pickupTime || 'Scheduled'} &bull; 🚗 ${trip.vehicleCategory || trip.vehicleModel || 'Cab'}
                </div>
              </div>
              <div class="booking-card-side-info">
                <div class="booking-price-txt">₹${(trip.fare?.total || 0).toLocaleString('en-IN')}</div>
                <span class="booking-view-detail-hint">View Trip Details &rarr;</span>
              </div>
            </div>
          `;
        }).join('');

        // Wire click on booking card to navigate to full trip detail view
        tripsContainer.querySelectorAll('.clean-booking-card').forEach(card => {
          card.onclick = () => {
            const tripId = card.dataset.tripId;
            this.showTripDetailView(tripId);
          };
        });
      }
    }

    // Wire link in support list to switch to My Bookings tab
    document.getElementById('support-link-to-trips')?.addEventListener('click', (e) => {
      e.preventDefault();
      activateTab('trips');
    });

    // 5. Tab 3: Support Tab Controller
    this.setupSupportTicketChat();
  }

  // Support Tab Controller (Safely handles clean support directory or tickets)
  setupSupportTicketChat() {
    const formCreate = document.getElementById('form-create-ticket');
    if (!formCreate) {
      // Clean Support Directory is active ("just show the list of support that's it")
      return;
    }
    if (!this.supportTickets) {
      this.supportTickets = [
        {
          id: '#TKT-82914',
          name: store.user.name || 'Karthik Prabhu',
          subject: 'Fare & Highway Toll Clarification',
          status: 'Waiting for response',
          statusType: 'waiting',
          time: 'Today at 11:45 AM',
          messages: [
            {
              sender: 'user',
              name: store.user.name || 'Karthik Prabhu',
              text: 'Hi, can you clarify whether toll charges are included in the Prime Sedan round-trip fare?',
              time: '11:45 AM'
            },
            {
              sender: 'agent',
              name: 'PickMi Support Desk (Admin)',
              text: 'Hello Karthik! Toll charges are calculated based on highway toll plazas and billed at actuals unless booked as an All-Inclusive package. Our operations team is available 24/7 if you need assistance on your route.',
              time: '11:46 AM'
            }
          ]
        }
      ];
      this.activeTicketId = '#TKT-82914';
    }

    const inputName = document.getElementById('ticket-input-name');
    const inputSubject = document.getElementById('ticket-input-subject');
    const inputRemarks = document.getElementById('ticket-input-remarks');
    const displayId = document.getElementById('ticket-display-id');
    const displaySubject = document.getElementById('ticket-display-subject');
    const displayMeta = document.getElementById('ticket-display-meta');
    const displayStatus = document.getElementById('ticket-display-status');
    const chatContainer = document.getElementById('ticket-chat-messages');
    const replyInput = document.getElementById('ticket-reply-text');
    const replyBtn = document.getElementById('btn-send-ticket-reply');
    const createAnotherBtn = document.getElementById('btn-create-another-ticket');

    if (inputName) inputName.value = store.user.name || 'Karthik Prabhu';

    const renderChatMessages = () => {
      const activeTicket = this.supportTickets.find(t => t.id === this.activeTicketId) || this.supportTickets[0];
      if (!activeTicket) return;

      if (displayId) displayId.textContent = activeTicket.id;
      if (displaySubject) displaySubject.textContent = activeTicket.subject;
      if (displayMeta) displayMeta.textContent = `Opened by ${activeTicket.name} · ${activeTicket.time}`;
      if (displayStatus) {
        displayStatus.className = `ticket-status-badge ${activeTicket.statusType}`;
        displayStatus.innerHTML = `<span>⏳</span> ${activeTicket.status}`;
      }

      if (chatContainer) {
        chatContainer.innerHTML = activeTicket.messages.map(msg => `
          <div class="chat-msg ${msg.sender}">
            <span class="chat-msg-author">${msg.name}</span>
            <div class="chat-msg-bubble">${msg.text}</div>
            <span class="chat-msg-time">${msg.time}</span>
          </div>
        `).join('');
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    };

    renderChatMessages();

    // Create ticket form submission
    if (formCreate) {
      formCreate.onsubmit = (e) => {
        e.preventDefault();
        const name = (inputName?.value || store.user.name || 'Valued Passenger').trim();
        const subject = (inputSubject?.value || 'Support Request').trim();
        const remarks = (inputRemarks?.value || '').trim();

        if (!subject || !remarks) return;

        const newId = '#TKT-' + Math.floor(10000 + Math.random() * 90000);
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newTicket = {
          id: newId,
          name: name,
          subject: subject,
          status: 'Waiting for response',
          statusType: 'waiting',
          time: 'Just now',
          messages: [
            {
              sender: 'user',
              name: name,
              text: remarks,
              time: timeNow
            }
          ]
        };

        this.supportTickets.unshift(newTicket);
        this.activeTicketId = newId;
        this.showToast(`Support ticket ${newId} logged! Status: Waiting for response.`);

        if (inputSubject) inputSubject.value = '';
        if (inputRemarks) inputRemarks.value = '';

        renderChatMessages();

        // Simulate admin team response message after 1.5s
        setTimeout(() => {
          newTicket.messages.push({
            sender: 'agent',
            name: 'PickMi Support Desk (Admin)',
            text: `Hello ${name}! We have received your query regarding "${subject}". An operations specialist is reviewing your account. Please let us know if you have any booking ID or additional details to share.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          renderChatMessages();
        }, 1500);
      };
    }

    // Reply button handling
    const sendUserReply = () => {
      const activeTicket = this.supportTickets.find(t => t.id === this.activeTicketId) || this.supportTickets[0];
      if (!activeTicket || !replyInput) return;
      const text = replyInput.value.trim();
      if (!text) return;

      activeTicket.messages.push({
        sender: 'user',
        name: store.user.name || 'Karthik Prabhu',
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      replyInput.value = '';
      renderChatMessages();

      // Automated follow-up from admin
      setTimeout(() => {
        activeTicket.messages.push({
          sender: 'agent',
          name: 'PickMi Support Desk (Admin)',
          text: `Thank you for the update. Our support executive has logged this remark and will update you via SMS / WhatsApp promptly.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        renderChatMessages();
      }, 1200);
    };

    if (replyBtn) replyBtn.onclick = sendUserReply;
    if (replyInput) {
      replyInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendUserReply();
        }
      };
    }

    if (createAnotherBtn) {
      createAnotherBtn.onclick = () => {
        const formCard = document.getElementById('support-new-ticket-container');
        if (formCard) {
          formCard.scrollIntoView({ behavior: 'smooth' });
          inputSubject?.focus();
        }
      };
    }
  }

  // Offers Page
  renderOffersPage() {
    const offersContainer = document.getElementById('offers-cards-grid');
    if (!offersContainer) return;

    offersContainer.innerHTML = PROMO_CODES.map(coupon => `
      <div class="feature-box" style="display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="display:inline-block;background:var(--primary-light);color:var(--primary);font-weight:800;padding:0.35rem 0.85rem;border-radius:var(--border-radius-pill);margin-bottom:1rem;font-size:0.9rem;letter-spacing:1px;">
            ${coupon.code}
          </div>
          <h4 style="font-size:1.15rem;font-weight:700;color:var(--text-main);margin-bottom:0.4rem;">
            ${coupon.discount ? `Save ₹${coupon.discount}` : `${coupon.discountPercent}% OFF`}
          </h4>
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem;">
            ${coupon.description}
          </p>
        </div>
        <button class="btn-modify-search" style="width:100%;text-align:center;" data-copy-coupon="${coupon.code}">
          Copy Code
        </button>
      </div>
    `).join('');

    offersContainer.querySelectorAll('[data-copy-coupon]').forEach(btn => {
      btn.onclick = () => {
        const code = btn.dataset.copyCoupon;
        navigator.clipboard?.writeText(code);
        store.applyCoupon(code);
        this.showToast(`Coupon ${code} copied & activated for your next ride!`);
      };
    });
  }

  // Support & FAQ Page (Section 13)
  renderSupportPage() {
    const faqContainer = document.getElementById('faq-accordion-container');
    if (faqContainer) {
      faqContainer.innerHTML = FAQS.map((faq, idx) => `
        <div style="background:#fff;border:1px solid var(--border-light);border-radius:var(--border-radius-md);margin-bottom:0.75rem;overflow:hidden;">
          <div class="faq-question-head" style="padding:1rem 1.25rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:0.98rem;color:var(--text-main);">
            <span>${faq.q}</span>
            <span style="color:var(--primary);font-size:1.2rem;">+</span>
          </div>
          <div class="faq-answer-body" style="padding:0 1.25rem 1rem;font-size:0.88rem;color:var(--text-muted);display:none;line-height:1.5;">
            ${faq.a}
          </div>
        </div>
      `).join('');

      faqContainer.querySelectorAll('.faq-question-head').forEach(head => {
        head.onclick = () => {
          const body = head.nextElementSibling;
          const isVisible = body.style.display === 'block';
          body.style.display = isVisible ? 'none' : 'block';
          head.querySelector('span:last-child').textContent = isVisible ? '+' : '−';
        };
      });
    }

    const supportForm = document.getElementById('support-case-form');
    if (supportForm) {
      supportForm.onsubmit = (e) => {
        e.preventDefault();
        const ref = document.getElementById('support-booking-ref')?.value;
        const msg = document.getElementById('support-message-text')?.value;
        this.showToast(`Support case raised for ${ref || 'Customer Support'}. Our 24/7 team will call within 10 minutes.`);
        supportForm.reset();
      };
    }
  }

  // Modal setup
  setupModals() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-overlay')?.classList.remove('open');
      });
    });

    const bizForm = document.getElementById('form-business-inquiry');
    if (bizForm) {
      bizForm.onsubmit = (e) => {
        e.preventDefault();
        const company = document.getElementById('biz-company-name')?.value || 'Your company';
        this.showToast(`✅ Thank you! Corporate account inquiry for ${company} received. Our sales desk will contact you.`);
        document.getElementById('business-modal')?.classList.remove('open');
        bizForm.reset();
      };
    }
  }

  // Interactive Driver Partner Page (Requested by user)
  setupDrivePartnerPage() {
    const vehData = {
      hatchback: {
        name: 'Hatchback',
        sub: 'Daily city commutes and affordable rides',
        models: ['Swift', 'WagonR', 'Celerio', 'Hyundai i10', 'Tata Tiago'],
        incity: '₹12/km',
        outstation: '₹10/km',
        rental: '₹200/hr'
      },
      sedan: {
        name: 'Sedan',
        sub: 'Comfortable sedan rides for intercity and airport travel',
        models: ['Maruti Dzire', 'Toyota Etios', 'Hyundai Aura', 'Honda Amaze'],
        incity: '₹14/km',
        outstation: '₹12/km',
        rental: '₹250/hr'
      },
      suv: {
        name: 'SUV / Crossover',
        sub: 'Spacious rides for large families, tours, and hill stations',
        models: ['Maruti Ertiga', 'Kia Carens', 'Toyota Innova Crysta', 'Mahindra Marazzo'],
        incity: '₹18/km',
        outstation: '₹15/km',
        rental: '₹350/hr'
      }
    };

    // Category Tabs Switcher
    const tabBtns = document.querySelectorAll('.driver-veh-tab-btn');
    const nameEl = document.getElementById('driver-veh-name');
    const subEl = document.getElementById('driver-veh-sub');
    const modelsList = document.getElementById('driver-models-list');
    const rateIncity = document.getElementById('driver-rate-incity');
    const rateOutstation = document.getElementById('driver-rate-outstation');
    const rateRental = document.getElementById('driver-rate-rental');

    tabBtns.forEach(btn => {
      btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const vtype = btn.dataset.vtype;
        const data = vehData[vtype] || vehData.hatchback;

        if (nameEl) nameEl.textContent = data.name;
        if (subEl) subEl.textContent = data.sub;
        if (modelsList) {
          modelsList.innerHTML = data.models.map(m => `<span class="driver-spec-pill">• ${m}</span>`).join('');
        }
        if (rateIncity) rateIncity.textContent = data.incity;
        if (rateOutstation) rateOutstation.textContent = data.outstation;
        if (rateRental) rateRental.textContent = data.rental;
      };
    });

    // Driver Sign Up Modal wiring
    const modal = document.getElementById('driver-signup-modal');
    const openBtn = document.getElementById('btn-open-driver-signup');
    const closeBtn = document.getElementById('btn-close-driver-modal');
    const form = document.getElementById('form-driver-signup');

    if (openBtn && modal) {
      openBtn.onclick = () => modal.classList.add('open');
    }

    if (closeBtn && modal) {
      closeBtn.onclick = () => modal.classList.remove('open');
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const driverName = document.getElementById('driver-name-input')?.value || 'Partner';
        if (modal) modal.classList.remove('open');
        this.showToast(`Application submitted! Welcome to PickMi Driver Network, ${driverName}!`);
        form.reset();
      };
    }

    // Floating Assistant Pill click
    const chatPill = document.getElementById('driver-chat-pill');
    if (chatPill) {
      chatPill.onclick = () => {
        this.showToast('Connecting with PickMi Driver Support Assistant...');
      };
    }
  }
}

// Instantiate on DOM ready or immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pickmiApp = new PickMiApp();
  });
} else {
  window.pickmiApp = new PickMiApp();
}
