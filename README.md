# SELN Map Timeline

An interactive, accessible web visualization showing State Employment Leadership Network (SELN) membership across US states from 2007 to 2026.

## Features

- **Interactive Year Slider**: Explore SELN membership data from 2007 to 2026
- **Visual State Representation**: Member states displayed in green (#5D9632), non-members in grey
- **Clean State Labels**: Two-letter state codes in small, unobtrusive Verdana font
- **Fully Responsive**: Works seamlessly on mobile, tablet, and desktop devices
- **Accessible**: WCAG compliant with keyboard navigation and screen reader support
- **Verdana Typography**: Clean, readable system font throughout (no external dependencies)

## Project Structure

```
/
├── index.html              # Main HTML page
├── prd.md                  # Product Requirements Document
├── README.md               # Project documentation
├── css/
│   └── styles.css         # Responsive styles
├── js/
│   ├── main.js            # Application initialization and controls
│   ├── dataParser.js      # CSV data parsing and processing
│   └── mapController.js   # Map visualization and interaction
├── assets/
│   └── us.svg             # SimpleMaps SVG map file
└── data/
    └── seln-by-year.csv   # SELN membership data by state and year
```

## Setup Instructions

### 1. Clone or Download Repository

```bash
git clone <repository-url>
cd seln_map_timeline
```

### 2. Map Source

The project uses a free SVG map from **SimpleMaps** (`assets/us.svg`):
- Source: https://simplemaps.com/resources/svg-us
- License: Free for commercial use
- Features accurate geographic representation of all 50 states + DC

### 3. Verify Data File

Ensure `data/seln-by-year.csv` exists and contains:
- State names in first column
- Years 2007-2026 as column headers
- Membership values (any value = member that year)

### 4. Open in Browser

Simply open `index.html` in a modern web browser:

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

Or use a local development server:

```bash
# Python 3
python -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server

# Then visit http://localhost:8000
```

## Usage

1. **Load the Page**: The map loads showing 2007 data by default
2. **Move the Slider**: Drag the year slider to explore different years
3. **View State Data**: Each state displays:
   - Two-letter abbreviation (e.g., "CA", "NY")
   - Cumulative years of membership below the abbreviation
4. **Visual Indicators**:
   - Green states: Current SELN members
   - Grey states: Not members in the selected year
5. **Legend**: Reference the legend at the bottom for color coding

## Technical Details

### Technologies Used

- **HTML5**: Semantic, accessible markup
- **CSS3**: Responsive design with flexbox and media queries
- **JavaScript (ES6+)**: Modular code with classes
- **SVG**: Vector graphics for scalable map visualization

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Accessibility Features

- Keyboard navigable (Tab, Arrow keys)
- Screen reader compatible with ARIA labels
- WCAG 2.1 AA compliant color contrast
- Focus indicators on all interactive elements
- Live regions for dynamic content announcements

### Responsive Breakpoints

- Desktop: 1024px and above
- Tablet: 768px - 1023px
- Mobile: 480px - 767px
- Small Mobile: 479px and below

## Data Format

The CSV file (`data/seln-by-year.csv`) should have:

```csv
State Name,, 2007, 2008, 2009, ..., 2026, Total
Alabama,, , , , 1, 1, ..., 14
Alaska,, , , , , , ..., 1
...
```

- **First column**: State name (can include notes in parentheses)
- **Second column**: Empty
- **Year columns**: Any value indicates membership
- **Last column**: Total years (optional, for reference)

## Customization

### Changing Colors

Edit `css/styles.css` and modify the CSS variables:

```css
:root {
  --member-color: #5D9632;      /* Green for members */
  --non-member-color: #CCCCCC;  /* Grey for non-members */
}
```

### Changing Year Range

Edit `js/main.js`:

```javascript
this.minYear = 2007;
this.maxYear = 2026;
```

### Changing Fonts

Replace the Google Fonts link in `index.html` or update `styles.css`.

## Troubleshooting

### Map doesn't appear
- Verify SVG file is properly integrated (see SVG-SETUP.md)
- Check browser console for errors (F12)
- Ensure file paths are correct

### States don't change color
- Verify state IDs in SVG match two-letter codes
- Check that CSV data is loading correctly
- Open browser console to see any JavaScript errors

### Slider doesn't work
- Check that JavaScript files are loading
- Verify CSV file path is correct
- Ensure browser JavaScript is enabled

## Development

### Code Structure

The application uses a modular architecture:

1. **DataParser**: Handles CSV loading and data queries
2. **MapController**: Manages SVG map visualization and state updates
3. **SELNMapApp**: Coordinates between components and handles UI

### Adding Features

To add new features:

1. Update `prd.md` with requirements
2. Modify appropriate module (dataParser, mapController, or main)
3. Update styles in `styles.css`
4. Test across responsive breakpoints

## License

[Specify your license here]

## Credits

- **SELN Data**: State Employment Leadership Network
- **Typography**: Verdana system font (no external dependencies)
- **SVG Map**: SimpleMaps.com (https://simplemaps.com/resources/svg-us)
  - License: Free for commercial use
  - Copyright © 2017 Pareto Software, LLC DBA SimpleMaps.com

## Support

For issues or questions:
1. Review browser console for error messages (F12)
2. Verify all file paths are correct
3. Ensure CSV data format is valid
4. Check that SimpleMaps SVG is properly loaded

## Future Enhancements

See "Out of Scope" section in `prd.md` for potential future features:
- Auto-play animation
- Statistics display
- Export functionality
- Historical notes and annotations
