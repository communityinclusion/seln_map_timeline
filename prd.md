# Product Requirements Document: SELN Map Timeline

## Overview
An interactive, accessible web-based map visualization showing State Employment Leadership Network (SELN) membership by state from 2007 to 2026.

## Technical Stack
- **HTML5** - Semantic, accessible markup
- **CSS3** - Styling and layout
- **JavaScript (ES6+)** - Interactivity and data processing
- **SVG Map** - SimpleMaps free US map (https://simplemaps.com/resources/svg-us)
  - License: Free for commercial use
  - Copyright: © 2017 Pareto Software, LLC DBA SimpleMaps.com
  - File: `assets/us.svg`

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
- Display a US map using accessible SVG format from SimpleMaps (`assets/us.svg`)
- **Source**: SimpleMaps.com free SVG map (https://simplemaps.com/resources/svg-us)
- **License**: Free for commercial use
- **Structure**: SVG contains `<path>` elements with two-letter state code IDs (e.g., `<path id="CA">`)
- **Coverage**: All 50 states plus DC with accurate geographic representation using Lambert Azimuthal Equal-area projection
- **Dynamic Labels**: State abbreviations are added via JavaScript to ALL states
  - Two-letter state code displayed at center of each state
  - Font: Plain Verdana, 10px, with no styling (no weight, no shadow)
  - Labels use default SVG text color (black) for visibility
  - Labels are SVG text elements (limited text selection in browsers due to object tag embedding)
- **Loading**: SVG loaded via `<object>` tag for proper DOM access and manipulation

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
- **Display**: Each state shows its two-letter abbreviation
- **Font**: Plain Verdana with no styling
- **Size**: 10px
- **Color**: Default SVG text color (black)
- **Accessibility**: State membership status and cumulative years available via ARIA labels for screen readers

### 5. Legend
- Display clear legend explaining:
  - Green (`#5D9632`) = SELN Member
  - Grey = Not a Member
- Position legend prominently on page

### 6. Title
- Display clear, descriptive title for the visualization
- Suggested: "State Employment Leadership Network Membership Timeline (2007-2026)"

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

### SVG Map Structure (SimpleMaps)
- SimpleMaps SVG uses `<path>` elements with direct ID attributes (e.g., `<path id="CA">`)
- Each path has `data-name` attribute with full state name (e.g., `data-name="California"`)
- Each path has `data-id` attribute matching the ID (e.g., `data-id="CA"`)
- All states are automatically discovered by querying for `path[id]` elements
- All states are labeled and colored on initialization (grey by default, green for members)
- State labels (two-letter abbreviations) are dynamically added via JavaScript to ALL states
- Labels use plain Verdana font, 10px size, with no additional styling (no weight or effects)
- Font family and size are set directly via JavaScript style attributes (not CSS, due to object tag isolation)
- Labels use default SVG text color (black) with no fill attribute specified
- Labels are appended to SVG root element, positioned at center of each state using path bounding boxes
- Text selection is limited by browser constraints when SVG is in an object tag

### Data Handling
- Ensure SVG map uses standard two-letter state codes for easy data mapping
- Handle DC as a special case (may need custom mapping)
- Consider state name variations in CSV (e.g., "Mass" vs "Massachusetts")
- Plan for efficient re-rendering when slider changes (avoid full page redraws)

### Deployment Requirements
- **Local Server Required**: Due to CORS restrictions, the application must be served via HTTP server
- Cannot be opened directly with `file://` protocol (CSV loading will fail)
- Recommended: `python3 -m http.server 8000` or similar local development server
- Production: Can be deployed to any standard web hosting service

## File Structure
```
/
├── index.html          # Main HTML page
├── prd.md              # Product Requirements Document
├── README.md           # Project documentation
├── css/
│   └── styles.css     # Responsive styling
├── js/
│   ├── main.js        # Main application logic
│   ├── dataParser.js  # CSV parsing and data processing
│   └── mapController.js # Map interaction logic
├── assets/
│   └── us.svg         # SimpleMaps SVG map file
└── data/
    └── seln-by-year.csv # SELN membership data
```
