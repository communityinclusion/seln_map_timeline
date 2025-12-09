/**
 * Data Parser Module
 * Handles CSV parsing and data processing for SELN membership data
 */

class DataParser {
  constructor() {
    this.rawData = null;
    this.membershipData = {};
    this.stateCodeMap = this.createStateCodeMap();
    this.stateColors = this.createStateColorMap();
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
      'Washington DC': 'DC',
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
   * Create mapping of state names to official state colors
   */
  createStateColorMap() {
    return {
      'Alabama': '#C8102E',
      'Alaska': '#0052A5',
      'Arizona': '#B95A2B',
      'Arkansas': '#B31942',
      'California': '#003595',
      'Colorado': '#002868',
      'Connecticut': '#00247D',
      'Delaware': '#003087',
      'District of Columbia': '#E4002B',
      'DC': '#E4002B',
      'Washington DC': '#E4002B',
      'Florida': '#FF6347',
      'Georgia': '#C8102E',
      'Hawaii': '#003366',
      'Idaho': '#0047AB',
      'Illinois': '#003E7E',
      'Indiana': '#002F6C',
      'Iowa': '#002F6C',
      'Kansas': '#003087',
      'Kentucky': '#002F6C',
      'Louisiana': '#00205B',
      'Maine': '#003E7E',
      'Maryland': '#C60C30',
      'Mass': '#003366',
      'Massachusetts': '#003366',
      'Michigan': '#0F4D92',
      'Minnesota': '#003F87',
      'Mississippi': '#002147',
      'Missouri': '#003F87',
      'Montana': '#003F87',
      'Montana (1/1/11 start)': '#003F87',
      'Nebraska': '#003087',
      'Nevada': '#003893',
      'New Hampshire': '#002868',
      'New Jersey': '#003087',
      'New Mexico': '#FFD700',
      'New York': '#003F87',
      'North Carolina': '#002868',
      'North Dakota': '#0052A5',
      'Ohio': '#C8102E',
      'Oklahoma': '#006747',
      'Oregon': '#003F87',
      'Pennsylvania': '#003D82',
      'Rhode Island': '#003087',
      'South Carolina': '#003087',
      'South Dakota': '#003F87',
      'Tennessee': '#003F87',
      'Texas': '#00205B',
      'Utah': '#002868',
      'Vermont': '#00693E',
      'Virginia': '#002868',
      'Washington': '#00843D',
      'West Virginia': '#003087',
      'Wisconsin': '#0047AB',
      'Wyoming': '#003087'
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
          years: {},
          total: 0
        };
      }

      // Parse membership data for each year
      Object.entries(yearColumns).forEach(([year, colIndex]) => {
        const value = values[colIndex]?.trim();
        // Any value in the cell counts as membership
        const isMember = value && value !== '' && value !== '0';
        this.membershipData[stateCode].years[year] = isMember;
      });

      // Parse Total column (last column)
      const totalValue = values[values.length - 1]?.trim();
      if (totalValue && totalValue !== '') {
        this.membershipData[stateCode].total = parseFloat(totalValue);
      }
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

  /**
   * Get total years of membership for a state
   * @param {string} stateCode - Two-letter state code
   * @returns {number} Total years
   */
  getTotal(stateCode) {
    return this.membershipData[stateCode]?.total || 0;
  }

  /**
   * Get canonical full state name from state code
   * @param {string} stateCode - Two-letter state code
   * @returns {string} Full state name
   */
  getCanonicalStateName(stateCode) {
    const canonicalNames = {
      'AL': 'Alabama',
      'AK': 'Alaska',
      'AZ': 'Arizona',
      'AR': 'Arkansas',
      'CA': 'California',
      'CO': 'Colorado',
      'CT': 'Connecticut',
      'DE': 'Delaware',
      'DC': 'District of Columbia',
      'FL': 'Florida',
      'GA': 'Georgia',
      'HI': 'Hawaii',
      'ID': 'Idaho',
      'IL': 'Illinois',
      'IN': 'Indiana',
      'IA': 'Iowa',
      'KS': 'Kansas',
      'KY': 'Kentucky',
      'LA': 'Louisiana',
      'ME': 'Maine',
      'MD': 'Maryland',
      'MA': 'Massachusetts',
      'MI': 'Michigan',
      'MN': 'Minnesota',
      'MS': 'Mississippi',
      'MO': 'Missouri',
      'MT': 'Montana',
      'NE': 'Nebraska',
      'NV': 'Nevada',
      'NH': 'New Hampshire',
      'NJ': 'New Jersey',
      'NM': 'New Mexico',
      'NY': 'New York',
      'NC': 'North Carolina',
      'ND': 'North Dakota',
      'OH': 'Ohio',
      'OK': 'Oklahoma',
      'OR': 'Oregon',
      'PA': 'Pennsylvania',
      'RI': 'Rhode Island',
      'SC': 'South Carolina',
      'SD': 'South Dakota',
      'TN': 'Tennessee',
      'TX': 'Texas',
      'UT': 'Utah',
      'VT': 'Vermont',
      'VA': 'Virginia',
      'WA': 'Washington',
      'WV': 'West Virginia',
      'WI': 'Wisconsin',
      'WY': 'Wyoming'
    };
    return canonicalNames[stateCode] || stateCode;
  }
}

// Export for use in other modules
window.DataParser = DataParser;
