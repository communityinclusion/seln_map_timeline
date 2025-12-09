/**
 * Map Controller Module
 * Handles map visualization and state interactions
 */

class MapController {
  constructor(dataParser) {
    this.dataParser = dataParser;
    this.currentYear = 2007;
    this.memberColor = '#5D9632';
    this.nonMemberColor = '#CCCCCC';
    this.mapSvg = null;

    // Manual offset adjustments for states with irregular shapes
    // Values are percentages of bbox width/height to shift the label
    this.labelOffsets = {
      'FL': { x: 0.15, y: -0.1 },  // Florida - shift right and up
      'LA': { x: 0, y: -0.1 },      // Louisiana - shift up
      'MI': { x: 0.1, y: 0.15 },    // Michigan - shift right and down
      'MD': { x: -0.2, y: 0 },      // Maryland - shift left
      'HI': { x: 0.3, y: 0 },       // Hawaii - shift right
      'ID': { x: 0, y: 0.1 },       // Idaho - shift down
      'VA': { x: -0.1, y: 0 },      // Virginia - shift left
      'CA': { x: 0, y: 0.05 },      // California - shift down slightly
      'AK': { x: 0.15, y: 0 },      // Alaska - shift right
      'NY': { x: 0, y: 0.05 },      // New York - shift down slightly
      'MA': { x: 0.15, y: 0 },      // Massachusetts - shift right
      'RI': { x: 0.2, y: 0 },       // Rhode Island - shift right
      'CT': { x: 0.15, y: 0 },      // Connecticut - shift right
      'NJ': { x: 0, y: 0.1 },       // New Jersey - shift down
      'DE': { x: 0, y: 0.1 },       // Delaware - shift down
      'OK': { x: -0.05, y: 0 },     // Oklahoma - shift left slightly
      'TN': { x: 0.05, y: 0 },      // Tennessee - shift right slightly
    };
  }

  /**
   * Initialize the map controller
   * @param {string} mapContainerId - ID of the map container element
   */
  init(mapContainerId) {
    this.mapContainer = document.getElementById(mapContainerId);
    if (!this.mapContainer) {
      console.error(`Map container ${mapContainerId} not found`);
      return;
    }

    // Try to get SVG - it might be embedded directly or in an object tag
    this.mapSvg = this.mapContainer.querySelector('svg');

    if (!this.mapSvg) {
      // Check if SVG is in an object tag
      const objectTag = this.mapContainer.querySelector('object');
      if (objectTag) {
        // Wait for object to load
        if (objectTag.contentDocument) {
          this.mapSvg = objectTag.contentDocument.querySelector('svg');
          if (this.mapSvg) {
            this.setupMap();
            return;
          }
        }

        // Object not yet loaded, add event listener
        objectTag.addEventListener('load', () => {
          this.mapSvg = objectTag.contentDocument.querySelector('svg');
          if (this.mapSvg) {
            this.setupMap();
          }
        });
        return;
      }
    }

    if (this.mapSvg) {
      this.setupMap();
    } else {
      // If SVG not yet loaded, wait for it
      setTimeout(() => this.init(mapContainerId), 100);
    }
  }

  /**
   * Setup map elements and initial state
   */
  setupMap() {
    // Get all path elements from the SVG (all states)
    const allPaths = this.mapSvg.querySelectorAll('path[id]');

    allPaths.forEach(pathElement => {
      const stateCode = pathElement.id;

      if (stateCode && stateCode.length === 2) {
        // Set all states to grey by default
        pathElement.style.fill = this.nonMemberColor;

        // Add accessible attributes
        pathElement.setAttribute('role', 'button');
        pathElement.setAttribute('tabindex', '0');
        pathElement.setAttribute('aria-label', `${stateCode}`);
        pathElement.style.cursor = 'pointer';

        // Add label to all states
        this.addStateLabel(pathElement, stateCode);
      }
    });

    // Update map for initial year (will turn member states green)
    this.updateMap(this.currentYear);
  }

  /**
   * Add state label (code + year count) to state element
   * @param {SVGElement} stateElement - State SVG path element
   * @param {string} stateCode - Two-letter state code
   */
  addStateLabel(stateElement, stateCode) {
    try {
      // Get bounding box to position text
      const bbox = stateElement.getBBox();
      let centerX = bbox.x + bbox.width / 2;
      let centerY = bbox.y + bbox.height / 2;

      // Apply manual offset if defined for this state
      if (this.labelOffsets[stateCode]) {
        const offset = this.labelOffsets[stateCode];
        centerX += offset.x * bbox.width;
        centerY += offset.y * bbox.height;
      }

      // Create text group
      const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      textGroup.classList.add('state-label');
      textGroup.setAttribute('data-state-label', stateCode);

      // State code text
      const codeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      codeText.setAttribute('x', centerX);
      codeText.setAttribute('y', centerY);
      codeText.setAttribute('text-anchor', 'middle');
      codeText.setAttribute('dominant-baseline', 'middle');
      codeText.classList.add('state-code');
      codeText.style.fontFamily = 'Verdana';
      codeText.style.fontSize = '10px';
      codeText.textContent = stateCode;

      textGroup.appendChild(codeText);

      // Append to SVG root, not to the path element
      this.mapSvg.appendChild(textGroup);
    } catch (error) {
      console.warn(`Could not add label for ${stateCode}:`, error);
    }
  }

  /**
   * Update map for a specific year
   * @param {number} year - Year to display
   */
  updateMap(year) {
    this.currentYear = year;

    // First, set all states to grey
    const allPaths = this.mapSvg.querySelectorAll('path[id]');
    allPaths.forEach(pathElement => {
      const stateCode = pathElement.id;
      if (stateCode && stateCode.length === 2) {
        pathElement.style.fill = this.nonMemberColor;
      }
    });

    // Then, color member states green
    const stateCodes = this.dataParser.getAllStateCodes();
    stateCodes.forEach(stateCode => {
      const isMember = this.dataParser.isMember(stateCode, year);
      const cumulativeYears = this.dataParser.getCumulativeYears(stateCode, year);

      // Update state color (green if member)
      if (isMember) {
        this.updateStateColor(stateCode, true);
      }

      // Update ARIA label
      this.updateStateAria(stateCode, isMember, cumulativeYears);
    });
  }

  /**
   * Update state fill color
   * @param {string} stateCode - Two-letter state code
   * @param {boolean} isMember - Whether state is a member
   */
  updateStateColor(stateCode, isMember) {
    // SimpleMaps SVG: path elements have id directly (e.g., <path id="CA" />)
    let stateElement = this.mapSvg.querySelector(`path#${stateCode}, circle#${stateCode}, polygon#${stateCode}`);

    // Fallback: check for data-id attribute
    if (!stateElement) {
      stateElement = this.mapSvg.querySelector(`path[data-id="${stateCode}"], circle[data-id="${stateCode}"], polygon[data-id="${stateCode}"]`);
    }

    // Fallback: check for group with path inside
    if (!stateElement) {
      stateElement = this.mapSvg.querySelector(`#${stateCode} path, #${stateCode} circle, #${stateCode} polygon`);
    }

    if (stateElement) {
      const color = isMember ? this.memberColor : this.nonMemberColor;
      stateElement.style.fill = color;
      stateElement.style.transition = 'fill 0.3s ease';
    } else {
      console.warn(`State element not found for: ${stateCode}`);
    }
  }

  /**
   * Update cumulative year count display
   * @param {string} stateCode - Two-letter state code
   * @param {number} years - Cumulative years
   */
  updateYearCount(stateCode, years) {
    const yearText = this.mapSvg.querySelector(`.state-years[data-state="${stateCode}"]`);
    if (yearText) {
      yearText.textContent = years;
    }
  }

  /**
   * Update state ARIA label for accessibility
   * @param {string} stateCode - Two-letter state code
   * @param {boolean} isMember - Whether state is a member
   * @param {number} years - Cumulative years
   */
  updateStateAria(stateCode, isMember, years) {
    // SimpleMaps: Find path element with id
    let stateElement = this.mapSvg.querySelector(`path#${stateCode}`);

    // Fallback: Try data-id attribute
    if (!stateElement) {
      stateElement = this.mapSvg.querySelector(`[data-id="${stateCode}"]`);
    }

    // Fallback: Try generic selector
    if (!stateElement) {
      stateElement = this.mapSvg.querySelector(`#${stateCode}`);
    }

    if (stateElement) {
      const status = isMember ? 'member' : 'not a member';
      const label = `${stateCode}, ${status}, ${years} years total`;
      stateElement.setAttribute('aria-label', label);
    }
  }

  /**
   * Get current year
   * @returns {number}
   */
  getCurrentYear() {
    return this.currentYear;
  }
}

// Export for use in other modules
window.MapController = MapController;
