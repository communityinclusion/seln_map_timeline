# Product Requirements Document: SELN Map Timeline

## Overview
An interactive, accessible web-based map visualization showing State Employment Leadership Network (SELN) membership by state from 2007 to 2026.

## Technical Stack
- **HTML5** - Semantic, accessible markup
- **CSS3** - Styling and layout
- **JavaScript (ES6+)** - Interactivity and data processing
- **D3.js v7** - Data visualization library for SVG generation and geographic projections
  - License: ISC License (permissive, similar to MIT)
  - CDN: https://d3js.org/
  - Modules: d3-geo, d3-selection, d3-scale, d3-fetch
- **TopoJSON** - Efficient geographic data format
  - US Atlas 3.x for US state boundaries
  - Albers USA projection for optimal US map display

## Design & Typography
- **Font Family**: Verdana, Geneva, Tahoma, sans-serif (system fonts, no external dependencies)
- **Target Platform**: Web only (no print-friendly version required)
- **Responsive Design**: Must work on all devices - mobile, tablet, and desktop
- **Breakpoints**: Design should adapt gracefully across all screen sizes

## Data Source
- **File**: `data/seln-by-year.csv`
- **Format**: CSV with states as rows, years (2007-2026) as columns
- **Data Rules**: Any value in a cell indicates membership for that year (including fractional values like 0.5, 0.083)

## Core Features

### 1. Interactive Map
- Display a US choropleth map generated dynamically using D3.js
- **Data Source**: US Atlas TopoJSON (https://cdn.jsdelivr.net/npm/us-atlas@3/)
- **Projection**: Albers USA (d3.geoAlbersUsa) - optimized for US maps with Alaska and Hawaii positioned appropriately
- **Structure**: D3.js generates SVG `<path>` elements for each state with proper geographic boundaries
- **Coverage**: All 50 states plus DC with accurate geographic representation
- **Dynamic Labels**: State abbreviations rendered via D3.js at geographic centroids
  - Two-letter state code displayed at true centroid of each state
  - Font: Plain Verdana, 10px
  - Labels use path.centroid() for automatic optimal positioning
  - Handles irregular shapes (MI, FL, HI, etc.) without manual offsets
- **Rendering**: D3.js dynamically generates SVG with data-driven styling

### 2. Visual States
- **All States**: Initially set to grey (`#CCCCCC`)
- **SELN Member States**: Fill color `#5D9632` (green)
- **Non-Member States**: Remain grey (`#CCCCCC`)
- **All 50 States + DC**: Every state is labeled and colored (grey or green)
- **State Borders**: White stroke from SimpleMaps SVG for visual separation
- **Hover Effect**: 80% opacity on hover for interactive feedback
- **Transitions**: Smooth 0.3s color transitions when membership status changes
- **Default State**: Show 2007 data on initial load

### 3. Year Slider
- **Position**: Top of the page
- **Range**: 2007 to 2026
- **Type**: Manual slider control (no auto-play)
- **Behavior**: As user moves slider, map updates in real-time to reflect membership for selected year
- **Display**: Show current year prominently near slider

### 4. State Information Display
- **Display**: Each state shows its two-letter abbreviation via D3.js text elements
- **Font**: Plain Verdana, 10px
- **Positioning**: Automatic centroid calculation using D3's path.centroid()
- **Color**: Black text for visibility on all state colors
- **Tooltips**: D3.js event handlers for hover interactions showing:
  - State name
  - Membership status
  - Cumulative years
- **Accessibility**: ARIA labels and semantic SVG structure for screen readers

### 5. Legend
- Display clear legend explaining:
  - Green (`#5D9632`) = SELN Member
  - Grey = Not a Member
- Position legend prominently on page

### 6. Title
- Display clear, descriptive title for the visualization
- Suggested: "State Employment Leadership Network Membership Timeline (2007-2026)"

### 7. Years of Membership Section
- **Purpose**: Display cumulative membership data for all states
- **Location**: Below the map visualization
- **Implementation**: Horizontal bar chart using D3.js
- **Display Elements**:
  - Full state name (not abbreviation)
  - Horizontal bar showing years of membership
  - Bar color: Official state color for each state
  - Total years displayed at end of each bar
- **Chart Properties**:
  - Sorted by years of membership (descending)
  - Responsive width - adapts to container
  - Only shows states with at least 1 year of membership
- **Dynamic Updates**: Updates based on current year selected in slider
  - Bars animate/transition when year changes
  - Numbers update to show cumulative years up to selected year
- **Accessibility**:
  - Semantic SVG structure with proper roles
  - ARIA labels for chart and individual bars
  - Screen reader accessible data presentation
  - Keyboard navigable if interactive

## Functional Requirements

### Data Processing
1. Parse CSV data on page load
2. Create data structure mapping:
   - State name → State code (for SVG mapping)
   - Year → List of member states
   - State + Year → Cumulative years of membership

### Map Interaction
1. Map must respond to slider changes within 100ms
2. Smooth visual transitions when states change status (optional enhancement)
3. States must be keyboard accessible with proper ARIA labels

### Accessibility Requirements
1. All interactive elements must be keyboard accessible
2. Screen reader announcements for:
   - Current year selected
   - State membership status
   - Cumulative years of membership
3. Sufficient color contrast for all text
4. ARIA labels for all interactive elements
5. Focus indicators visible on all interactive elements

## User Experience Flow
1. User lands on page → sees title and year slider at top set to 2007
2. Map displays with 2007 data - member states in green, non-members greyed out
3. Each state shows its two-letter abbreviation in small Verdana font
4. User moves slider to different year → map updates state colors in real-time
5. User references legend to understand color coding
6. Screen reader users receive ARIA announcements of membership status and cumulative years

## Out of Scope (Future Considerations)
- Auto-play/animation feature
- Statistics display (e.g., "X states are members in YEAR")
- Export functionality
- Historical notes or annotations
- Print-friendly version

## Data Notes
- DC (District of Columbia) is included as a jurisdiction
- Some states have fractional membership values (e.g., 0.5, 0.083) - treat any value as membership
- Montana has a note "(1/1/11 start)" - this is informational only
- Total membership count per year is available in the CSV but not currently displayed

## Success Criteria
1. Map accurately reflects SELN membership for any selected year (2007-2026)
2. All interactive elements are keyboard and screen reader accessible
3. Visual design uses specified color scheme (#5D9632 for members, #CCCCCC for non-members)
4. Each state displays two-letter abbreviation in plain Verdana font, 10px size
5. State labels are small and unobtrusive, not cluttering the map
6. Typography uses Verdana system font throughout (no external font dependencies)
7. Responsive design works seamlessly on mobile, tablet, and desktop devices
8. Page loads and renders within 3 seconds on standard broadband connection

## Technical Considerations

### D3.js Implementation
- **Library**: D3.js v7 loaded from CDN
- **Data Format**: TopoJSON from US Atlas 3.x
  - Loaded from: https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json
  - Pre-projected Albers USA coordinates for performance
- **State Mapping**: TopoJSON properties include:
  - `id` - FIPS code
  - `name` - Full state name
- **SVG Generation**:
  - D3.js path generator creates accurate state boundaries
  - Geographic centroids calculated via `path.centroid(feature)`
  - Labels positioned automatically at true geographic centers
  - No manual offset adjustments needed
- **Data Binding**: D3's data join pattern for efficient updates
  - `.data()` binds SELN membership data to state features
  - `.join()` handles enter/update/exit patterns
  - Smooth transitions on year changes
- **Styling**: CSS classes and inline styles applied via D3 selections
- **Updates**: D3 transition for smooth color changes when year updates

### Data Handling
- Map CSV state names to TopoJSON state names
- Handle DC as "District of Columbia"
- Consider state name variations in CSV (e.g., "Mass" vs "Massachusetts")
- Use D3 data join for efficient updates when slider changes
- TopoJSON provides compressed geographic data for faster loading

### Deployment Requirements
- **CDN Dependencies**: D3.js and TopoJSON libraries loaded from CDN (no npm/build required)
- **Local Server Required**: Due to CORS restrictions for CSV and TopoJSON, must be served via HTTP
- Cannot be opened directly with `file://` protocol
- Recommended: `python3 -m http.server 8000` or similar local development server
- Production: Can be deployed to any standard web hosting service with CDN access

## File Structure
```
/
├── index.html          # Main HTML page with D3.js integration
├── prd.md              # Product Requirements Document
├── README.md           # Project documentation
├── css/
│   └── styles.css     # Responsive styling
├── js/
│   ├── main.js        # Main application logic with D3.js map rendering
│   └── dataParser.js  # CSV parsing and data processing
└── data/
    └── seln-by-year.csv # SELN membership data
```

**Note**: D3.js and TopoJSON are loaded via CDN, no local files needed.
