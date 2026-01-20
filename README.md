# EZ Frontend React

A geospatial application for emission zone simulation and analysis. The EZ (Emission Zone) service provides an interactive interface for modeling the environmental and behavioral impacts of emission zones on urban transportation systems.

## What is EZ service?

EZ helps urban planners, policymakers, and researchers answer critical questions about emission zones:
- How will new emission zone policies affect air quality in specific areas?
- How will people respond to vehicle restrictions in different parts of the city?
- What mode shifts can be expected when certain vehicle types are restricted?
- Which routes will experience increased or decreased traffic?
- How will travel times change across different areas?

## Getting Started

The EZ service workflow follows a simple three-step process:

1. **Configure Your Scenario** - Draw emission zones on the map and set vehicle restrictions
2. **Run Simulation** - Receive real-time progress as the system analyzes transportation impacts
3. **Explore Results** - Review comprehensive analysis with maps, charts, and insights

## Creating Your Scenario

### Drawing Emission Zones

Click directly on the map to draw polygons representing your emission zones. You can:
- Create multiple zones to model different policy areas
- Name each zone
- Assign distinct colors to easily identify zones on the map
- Reorder zones by dragging cards in the zone list
- Hide or show zones to focus on specific areas

### Setting Vehicle Restrictions

Each emission zone has a visual time-block scheduler showing a 24-hour period. Simply:
- Click and drag across time blocks to create restriction periods
- Set restrictions per vehicle type (cars, buses, trucks, motorcycles, etc.)
- Double-click existing blocks to edit restriction details
- See all restrictions at a glance in the grid view

### Defining Simulation Areas

Simulation areas determine where detailed trip-level analysis occurs:

**Custom Areas**: Draw your own analysis regions to focus on specific neighborhoods, corridors, or districts.

**Zone Scaling**: Automatically create scaled versions of your emission zones to test boundary sensitivity. You can scale zones from 80% to 150% of their original size, anchored from the center or edges. This helps answer "what if the zone was slightly larger or smaller?"

### Tuning Simulation Parameters

Fine-tune how the simulation models traveler behavior:
- **Car Distribution**: Adjust the mix of vehicle types in the fleet
- **Data Sources**: Select which underlying transportation data to use
- **Mode Attractiveness**: Change how appealing different transportation modes are (walking, cycling, transit, driving)

## Running Your Simulation

Click "Start Simulation" and watch progress in real-time via phase indicators with option to view early results as soon as initial data is ready

The simulation runs on a backend server, and you can cancel anytime.

## Understanding Your Results

Results are organized into three sections:

### Emissions Analysis

- **Summary paragraphs** with natural language explanations of overall impact
- **Bar charts** comparing emissions across zones and vehicle types (before/after)
- **Interactive heatmap** showing spatial emission concentrations with block-level detail
- **Fleet composition charts** revealing shifts from high to low-emission vehicles

**Key insights**: Which zones are most effective, whether reductions came from mode shifts or fewer trips, if pollution displaced to other areas, and which vehicle types contribute most to remaining emissions.

### People Response Analysis

- **Response breakdown charts** showing how trips adapted (mode shift, reroute, cancel, etc.)
- **Grid map visualization** revealing which neighborhoods saw the most behavioral change
- **Time impact analysis** showing travel time distributions before and after restrictions

**Key insights**: How successfully people adapted, which areas were most affected, if restrictions caused significant time burdens, and whether public transit became viable.

### Trip Legs Performance

- **Color-coded path map** showing individual trip routes (green = faster, yellow = slightly slower, red = delayed)
- **Performance table** with sortable columns for origin, destination, distance, time, mode, and performance change

**Key insights**: Which routes are most impacted, if major corridors became congested or relieved, and whether alternative routes are efficient.

## Interactive Features

### During Drawing
- **Layer Visibility**: Toggle other zones and simulation areas on/off while drawing to avoid overlap
- **Real-Time Validation**: Immediate feedback if your polygon is too small, self-intersecting, or invalid
- **Edit Anytime**: Click edit to adjust existing zone boundaries

### During Analysis
- **Toggle Input Layers**: Show or hide your emission zones and simulation areas on the results maps
- **Interactive Maps**: Click features to see detailed tooltips with exact values
- **Hover Effects**: Hover over chart elements to see precise numbers

### Sharing and Collaboration
- **Request ID**: Every simulation gets a unique ID that you can copy and share
- **Load Previous Scenarios**: Enter a request ID to reload any past simulation
- **Browse Examples**: View pre-made scenarios to understand different use cases


## Common Use Cases

**Urban Planners**: Evaluate proposed emission zone boundaries and predict their effectiveness before implementation.

**Policy Analysts**: Compare different restriction schedules to find policies that maximize emissions reduction while minimizing travel disruption.

**Environmental Researchers**: Study the relationship between urban transportation policies and air quality outcomes.

**Transportation Engineers**: Identify roads and intersections that will experience traffic changes, enabling proactive infrastructure planning.

**Public Engagement**: Create visualizations that help the public understand how emission zones will affect their daily lives.

## Technical Requirements

- Modern web browser (Firefox, Chrome)
- Internet connection for map tiles and backend communication
- WebGL support for map rendering

## Installation for Development

### Prerequisites
- Node.js 16+ (recommended: 18 or 20)
- Yarn package manager

### Installation

```bash
yarn install
```

### Development

```bash
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
yarn build
```

Creates an optimized production build.

### Environment Configuration

Create a `.env` file in the project root with the following required variables:

```env
# Mapbox Token (required for map rendering)
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here

# EZ Service Backend URL (required for running simulations)
# Leave commented out or empty to run in demo mode
REACT_APP_EZ_BACKEND_URL=http://localhost:8000
```

**Getting a Mapbox Token:**
1. Create a free account at [mapbox.com](https://www.mapbox.com/)
2. Navigate to your [Access Tokens page](https://account.mapbox.com/access-tokens/)
3. Copy your default public token or create a new one
4. Paste it as the value for `REACT_APP_MAPBOX_TOKEN`

**Backend URL:**
- For local development with the EZ backend running locally, use `http://localhost:8000`
- For production or remote backends, use the appropriate server URL
- Leave empty or commented out to run the application in demo mode (no actual simulations)

## Built With

This application is built with modern web technologies:

### Core Technologies
- [React 19](https://react.dev/) - UI framework with concurrent features
- [TypeScript 5](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Mapbox GL JS](https://github.com/mapbox/mapbox-gl-js) - Vector map rendering engine
- [deck.gl](https://deck.gl/) - WebGL-powered geospatial visualization framework

### Geospatial Tools
- [deck.gl Community Editable Layers](https://github.com/visgl/deck.gl-community/tree/master/modules/editable-layers) - Interactive polygon drawing and editing. Special thanks to [@ibgreen](https://github.com/ibgreen), and all the [contributors](https://github.com/visgl/deck.gl-community/graphs/contributors).
- [Turf.js](https://turfjs.org/) - Geospatial analysis library

### UI & Visualization
- [Ant Design 5](https://ant.design/) - React component library
- [Chart.js 4](https://www.chartjs.org/) - Chart rendering
- [react-chartjs-2](https://react-chartjs-2.js.org/) - React wrapper for Chart.js
- [dnd-kit](https://dndkit.com/) - Drag and drop toolkit

### State Management
- [Zustand 5](https://github.com/pmndrs/zustand) - Lightweight React state management

### Internationalization
- [i18next](https://www.i18next.com/) - Internationalization framework
- [react-i18next](https://react.i18next.com/) - React bindings for i18next