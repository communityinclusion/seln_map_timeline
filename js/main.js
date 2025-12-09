/**
 * Main Application Module
 * SELN Map Timeline with D3.js Choropleth Map
 */

class SELNMapApp {
  constructor() {
    this.dataParser = null;
    this.usStates = null;
    this.svg = null;
    this.path = null;
    this.minYear = 2007;
    this.maxYear = 2026;
    this.currentYear = 2007;
    this.memberColor = '#5D9632';
    this.nonMemberColor = '#CCCCCC';
    this.width = 975;
    this.height = 610;

    // Small states that need external labels with leader lines
    this.smallStates = {
      'Maine': { offset: [80, -50] },
      'Vermont': { offset: [80, -40] },
      'New Hampshire': { offset: [80, -30] },
      'Massachusetts': { offset: [80, -15] },
      'Rhode Island': { offset: [80, 0] },
      'Connecticut': { offset: [80, 15] },
      'New Jersey': { offset: [80, 30] },
      'Delaware': { offset: [80, 45] },
      'Maryland': { offset: [80, 60] },
      'District of Columbia': { offset: [80, 75] }
    };
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

      // Load US states TopoJSON
      await this.loadGeoData();

      // Initialize the map
      this.initializeMap();

      // Setup year slider
      this.setupYearSlider();

      // Render initial map
      this.updateMap(this.currentYear);

      // Initialize and render bar chart
      this.initializeBarChart();
      this.updateBarChart(this.currentYear);

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
   * Load US states TopoJSON data
   */
  async loadGeoData() {
    try {
      // Load TopoJSON from US Atlas
      const us = await d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json');

      // Convert TopoJSON to GeoJSON
      this.usStates = topojson.feature(us, us.objects.states).features;

      console.log('Loaded US states:', this.usStates.length, 'states');

      // Debug: Log all state names from TopoJSON
      console.log('State names in TopoJSON:', this.usStates.map(d => d.properties.name));

      // Debug: Check which states we can match
      const matched = [];
      const unmatched = [];
      this.usStates.forEach(d => {
        const stateCode = this.getStateCodeFromName(d.properties.name);
        if (stateCode) {
          matched.push(d.properties.name);
        } else {
          unmatched.push(d.properties.name);
        }
      });
      console.log('Matched states:', matched.length, matched);
      console.log('Unmatched states:', unmatched.length, unmatched);

    } catch (error) {
      console.error('Error loading geo data:', error);
      throw new Error('Failed to load map data');
    }
  }

  /**
   * Initialize D3.js SVG and projection
   */
  initializeMap() {
    // Select the SVG element
    // Use a larger viewBox to accommodate external labels
    this.svg = d3.select('#map-svg')
      .attr('viewBox', `0 0 1100 ${this.height}`)
      .attr('width', '100%')
      .attr('height', 'auto')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create path generator (data is pre-projected in Albers USA)
    this.path = d3.geoPath();

    // Create group for states
    this.svg.append('g')
      .attr('class', 'states');

    // Create group for leader lines
    this.svg.append('g')
      .attr('class', 'leader-lines');

    // Create group for labels
    this.svg.append('g')
      .attr('class', 'labels');
  }

  /**
   * Update map for a specific year
   * @param {number} year - Year to display
   */
  updateMap(year) {
    this.currentYear = year;

    // Update states
    const states = this.svg.select('.states')
      .selectAll('path')
      .data(this.usStates)
      .join('path')
      .attr('d', this.path)
      .attr('class', 'state')
      .attr('fill', d => {
        const stateName = d.properties.name;
        const stateCode = this.getStateCodeFromName(stateName);
        const isMember = stateCode ? this.dataParser.isMember(stateCode, year) : false;
        return isMember ? this.memberColor : this.nonMemberColor;
      })
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => this.handleStateHover(event, d))
      .on('mouseout', () => this.handleStateOut());

    // Separate states into regular and small states
    const regularStates = this.usStates.filter(d => !this.smallStates[d.properties.name]);
    const smallStatesData = this.usStates.filter(d => this.smallStates[d.properties.name]);

    // Update regular state labels (centered inside)
    this.svg.select('.labels')
      .selectAll('text.regular-label')
      .data(regularStates)
      .join('text')
      .attr('class', 'state-label regular-label')
      .attr('transform', d => {
        const centroid = this.path.centroid(d);
        return `translate(${centroid[0]}, ${centroid[1]})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-family', 'Verdana')
      .style('font-size', '10px')
      .style('fill', '#000')
      .style('pointer-events', 'none')
      .text(d => {
        const stateName = d.properties.name;
        return this.getStateCodeFromName(stateName) || '';
      });

    // Update leader lines for small states
    this.svg.select('.leader-lines')
      .selectAll('line')
      .data(smallStatesData)
      .join('line')
      .attr('class', 'leader-line')
      .attr('x1', d => this.path.centroid(d)[0])
      .attr('y1', d => this.path.centroid(d)[1])
      .attr('x2', d => {
        const centroid = this.path.centroid(d);
        const offset = this.smallStates[d.properties.name].offset;
        return centroid[0] + offset[0];
      })
      .attr('y2', d => {
        const centroid = this.path.centroid(d);
        const offset = this.smallStates[d.properties.name].offset;
        return centroid[1] + offset[1];
      })
      .attr('stroke', '#666')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Update external labels for small states
    this.svg.select('.labels')
      .selectAll('text.external-label')
      .data(smallStatesData)
      .join('text')
      .attr('class', 'state-label external-label')
      .attr('transform', d => {
        const centroid = this.path.centroid(d);
        const offset = this.smallStates[d.properties.name].offset;
        return `translate(${centroid[0] + offset[0]}, ${centroid[1] + offset[1]})`;
      })
      .attr('text-anchor', d => {
        const offset = this.smallStates[d.properties.name].offset;
        return offset[0] > 0 ? 'start' : 'end';
      })
      .attr('dominant-baseline', 'middle')
      .style('font-family', 'Verdana')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', '#000')
      .style('pointer-events', 'none')
      .text(d => {
        const stateName = d.properties.name;
        return this.getStateCodeFromName(stateName) || '';
      });
  }

  /**
   * Handle state hover event
   * @param {Event} event - Mouse event
   * @param {Object} d - State data
   */
  handleStateHover(event, d) {
    const stateName = d.properties.name;
    const stateCode = this.getStateCodeFromName(stateName);

    if (!stateCode) return;

    const isMember = this.dataParser.isMember(stateCode, this.currentYear);
    const years = this.dataParser.getCumulativeYears(stateCode, this.currentYear);

    // Highlight state
    d3.select(event.currentTarget)
      .attr('opacity', 0.8);

    // Show tooltip (you can enhance this with a proper tooltip library)
    const tooltip = `${stateName}: ${isMember ? 'SELN Member' : 'Not a member'} (${years} years)`;
    console.log(tooltip); // For now, just log it
  }

  /**
   * Handle state mouse out event
   */
  handleStateOut() {
    // Remove highlight
    this.svg.selectAll('.state')
      .attr('opacity', 1);
  }

  /**
   * Initialize the bar chart
   */
  initializeBarChart() {
    const container = d3.select('#years-content');
    container.html(''); // Clear loading text

    // Create responsive SVG
    this.barChartSvg = container
      .append('svg')
      .attr('id', 'bar-chart-svg')
      .attr('width', '100%')
      .attr('role', 'img')
      .attr('aria-label', 'Bar chart showing years of SELN membership by state');

    // Create defs for gradient
    const defs = this.barChartSvg.append('defs');

    // Define horizontal gradient from blue to green
    const gradient = defs.append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0178AF');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#5D9632');

    // Create group for bars
    this.barChartSvg.append('g').attr('class', 'bars');
  }

  /**
   * Update bar chart for a specific year
   * @param {number} year - Year to display data for
   */
  updateBarChart(year) {
    if (!this.barChartSvg) return;

    // Get data for all states with membership years
    const data = [];
    this.dataParser.getAllStateCodes().forEach(stateCode => {
      const total = this.dataParser.getTotal(stateCode);

      if (total > 0) {
        const canonicalName = this.dataParser.getCanonicalStateName(stateCode);
        data.push({
          name: canonicalName,
          years: total,
          color: this.memberColor  // Use green for all bars
        });
      }
    });

    // Sort by years descending
    data.sort((a, b) => b.years - a.years);

    // Chart dimensions
    const margin = { top: 10, right: 80, bottom: 10, left: 150 };
    const containerWidth = document.getElementById('years-content').clientWidth;
    const width = containerWidth - margin.left - margin.right;
    const barHeight = 25;
    const barPadding = 5;
    const height = data.length * (barHeight + barPadding);

    // Update SVG height
    this.barChartSvg.attr('height', height + margin.top + margin.bottom);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.years)])
      .range([0, width]);

    // Select/create bars group with margin
    let barsGroup = this.barChartSvg.select('.bars');
    if (barsGroup.empty()) {
      barsGroup = this.barChartSvg.append('g').attr('class', 'bars');
    }
    barsGroup.attr('transform', `translate(${margin.left},${margin.top})`);

    // Bind data
    const bars = barsGroup.selectAll('g.bar-group')
      .data(data, d => d.name);

    // Enter + Update
    const barGroups = bars.enter()
      .append('g')
      .attr('class', 'bar-group')
      .merge(bars)
      .attr('transform', (d, i) => `translate(0,${i * (barHeight + barPadding)})`);

    // State labels (on the left)
    barGroups.selectAll('text.state-label')
      .data(d => [d])
      .join('text')
      .attr('class', 'state-label')
      .attr('x', -10)
      .attr('y', barHeight / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-family', 'Verdana')
      .style('font-size', '12px')
      .style('fill', '#333')
      .text(d => d.name);

    // Bars with gradient
    barGroups.selectAll('rect')
      .data(d => [d])
      .join('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', barHeight)
      .attr('fill', 'url(#bar-gradient)')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .transition()
      .duration(500)
      .attr('width', d => xScale(d.years));

    // Year labels (at the end of bars)
    barGroups.selectAll('text.year-label')
      .data(d => [d])
      .join('text')
      .attr('class', 'year-label')
      .attr('y', barHeight / 2)
      .attr('dominant-baseline', 'middle')
      .style('font-family', 'Verdana')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .transition()
      .duration(500)
      .attr('x', d => xScale(d.years) + 5)
      .text(d => d.years);

    // Remove old bars
    bars.exit().remove();
  }

  /**
   * Get state code from state name
   * @param {string} stateName - Full state name
   * @returns {string|null} Two-letter state code or null
   */
  getStateCodeFromName(stateName) {
    const stateCodeMap = this.dataParser.stateCodeMap;

    // Direct match
    if (stateCodeMap[stateName]) {
      return stateCodeMap[stateName];
    }

    // Case-insensitive match
    for (const [name, code] of Object.entries(stateCodeMap)) {
      if (name.toLowerCase() === stateName.toLowerCase()) {
        return code;
      }
    }

    // Special case: District of Columbia
    if (stateName === 'District of Columbia' || stateName === 'D.C.') {
      return 'DC';
    }

    console.warn(`No state code found for: ${stateName}`);
    return null;
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
    this.updateMap(year);

    // Update bar chart
    this.updateBarChart(year);

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
    this.hideLoading();
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
