/**
 * Data Parser Module
 * Handles CSV parsing and data processing for SELN membership data
 */

class DataParser {
  constructor() {
    this.rawData = null;
    this.membershipData = {};
    this.stateCodeMap = this.createStateCodeMap();
  }

  /**
   * Create mapping from state names to two-letter codes
   */
  createStateCodeMap() {
    return {
      'Alabama': 'AL',
      'Alaska': 'AK',
      'Arizona': 'AZ',
      'Arkansas': 'AR',
      'California': 'CA',
      'Colorado': 'CO',
      'Connecticut': 'CT',
      'Delaware': 'DE',
      'DC': 'DC',
      'District of Columbia': 'DC',
      'Florida': 'FL',
      'Georgia': 'GA',
      'Hawaii': 'HI',
      'Idaho': 'ID',
      'Illinois': 'IL',
      'Indiana': 'IN',
      'Iowa': 'IA',
      'Kansas': 'KS',
      'Kentucky': 'KY',
      'Louisiana': 'LA',
      'Maine': 'ME',
      'Maryland': 'MD',
      'Mass': 'MA',
      'Massachusetts': 'MA',
      'Michigan': 'MI',
      'Minnesota': 'MN',
      'Mississippi': 'MS',
      'Missouri': 'MO',
      'Montana': 'MT',
      'Montana (1/1/11 start)': 'MT',
      'Nebraska': 'NE',
      'Nevada': 'NV',
      'New Hampshire': 'NH',
      'New Jersey': 'NJ',
      'New Mexico': 'NM',
      'New York': 'NY',
      'North Carolina': 'NC',
      'North Dakota': 'ND',
      'Ohio': 'OH',
      'Oklahoma': 'OK',
      'Oregon': 'OR',
      'Pennsylvania': 'PA',
      'Rhode Island': 'RI',
      'South Carolina': 'SC',
      'South Dakota': 'SD',
      'Tennessee': 'TN',
      'Texas': 'TX',
      'Utah': 'UT',
      'Vermont': 'VT',
      'Virginia': 'VA',
      'Washington': 'WA',
      'West Virginia': 'WV',
      'Wisconsin': 'WI',
      'Wyoming': 'WY'
    };
  }

  /**
   * Load and parse CSV file
   * @param {string} csvPath - Path to CSV file
   * @returns {Promise<void>}
   */
  async loadCSV(csvPath) {
    try {
      const response = await fetch(csvPath);
      const csvText = await response.text();
      this.parseCSV(csvText);
    } catch (error) {
      console.error('Error loading CSV:', error);
      throw error;
    }
  }

  /**
   * Parse CSV text into structured data
   * @param {string} csvText - Raw CSV text
   */
  parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = this.parseCSVLine(lines[0]);

    // Find year column indices (2007-2026)
    const yearColumns = {};
    headers.forEach((header, index) => {
      const year = parseInt(header);
      if (year >= 2007 && year <= 2026) {
        yearColumns[year] = index;
      }
    });

    // Parse each state row
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const stateName = values[0]?.trim();

      if (!stateName || stateName === '') continue;

      const stateCode = this.stateCodeMap[stateName];
      if (!stateCode) {
        console.warn(`No state code found for: ${stateName}`);
        continue;
      }

      // Initialize state data
      if (!this.membershipData[stateCode]) {
        this.membershipData[stateCode] = {
          name: stateName,
          code: stateCode,
          years: {}
        };
      }

      // Parse membership data for each year
      Object.entries(yearColumns).forEach(([year, colIndex]) => {
        const value = values[colIndex]?.trim();
        // Any value in the cell counts as membership
        const isMember = value && value !== '' && value !== '0';
        this.membershipData[stateCode].years[year] = isMember;
      });
    }
  }

  /**
   * Parse a single CSV line, handling quoted values
   * @param {string} line - CSV line
   * @returns {Array<string>}
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);

    return result;
  }

  /**
   * Get membership status for a state in a specific year
   * @param {string} stateCode - Two-letter state code
   * @param {number} year - Year to check
   * @returns {boolean}
   */
  isMember(stateCode, year) {
    return this.membershipData[stateCode]?.years[year] || false;
  }

  /**
   * Calculate cumulative years of membership up to a specific year
   * @param {string} stateCode - Two-letter state code
   * @param {number} upToYear - Calculate up to this year (inclusive)
   * @returns {number}
   */
  getCumulativeYears(stateCode, upToYear) {
    const stateData = this.membershipData[stateCode];
    if (!stateData) return 0;

    let count = 0;
    for (let year = 2007; year <= upToYear; year++) {
      if (stateData.years[year]) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get all member states for a specific year
   * @param {number} year - Year to check
   * @returns {Array<string>} Array of state codes
   */
  getMemberStates(year) {
    return Object.keys(this.membershipData).filter(
      stateCode => this.isMember(stateCode, year)
    );
  }

  /**
   * Get all state codes
   * @returns {Array<string>}
   */
  getAllStateCodes() {
    return Object.keys(this.membershipData);
  }
}

// Export for use in other modules
window.DataParser = DataParser;
