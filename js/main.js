/**
 * Main Application Module
 * Initializes and coordinates the SELN Map Timeline application
 */

class SELNMapApp {
  constructor() {
    this.dataParser = null;
    this.mapController = null;
    this.minYear = 2007;
    this.maxYear = 2026;
    this.currentYear = 2007;
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Show loading state
      this.showLoading();

      // Initialize data parser
      this.dataParser = new DataParser();
      await this.dataParser.loadCSV('data/seln-by-year.csv');

      // Initialize map controller
      this.mapController = new MapController(this.dataParser);
      this.mapController.init('map-container');

      // Setup year slider
      this.setupYearSlider();

      // Hide loading state
      this.hideLoading();

      // Announce to screen readers
      this.announceToScreenReader('Map loaded. Use the year slider to explore SELN membership over time.');

    } catch (error) {
      console.error('Error initializing application:', error);
      this.showError('Failed to load application. Please refresh the page.');
    }
  }

  /**
   * Setup year slider controls
   */
  setupYearSlider() {
    const slider = document.getElementById('year-slider');
    const yearDisplay = document.getElementById('current-year');

    if (!slider || !yearDisplay) {
      console.error('Slider elements not found');
      return;
    }

    // Set slider attributes
    slider.min = this.minYear;
    slider.max = this.maxYear;
    slider.value = this.currentYear;

    // Update display
    yearDisplay.textContent = this.currentYear;

    // Handle slider input
    slider.addEventListener('input', (e) => {
      this.handleYearChange(parseInt(e.target.value));
    });

    // Handle keyboard navigation
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // Let browser handle, but announce change
        setTimeout(() => {
          this.announceToScreenReader(`Year ${this.currentYear}`);
        }, 100);
      }
    });
  }

  /**
   * Handle year change from slider
   * @param {number} year - New year value
   */
  handleYearChange(year) {
    this.currentYear = year;

    // Update display
    const yearDisplay = document.getElementById('current-year');
    if (yearDisplay) {
      yearDisplay.textContent = year;
    }

    // Update map
    if (this.mapController) {
      this.mapController.updateMap(year);
    }

    // Update ARIA live region for screen readers
    this.updateAriaLiveRegion(`Showing data for ${year}`);
  }

  /**
   * Show loading state
   */
  showLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'block';
      loadingElement.setAttribute('aria-live', 'polite');
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorElement = document.getElementById('error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      errorElement.setAttribute('role', 'alert');
    }
  }

  /**
   * Update ARIA live region for screen reader announcements
   * @param {string} message - Message to announce
   */
  updateAriaLiveRegion(message) {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   */
  announceToScreenReader(message) {
    this.updateAriaLiveRegion(message);
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new SELNMapApp();
  app.init();
});
