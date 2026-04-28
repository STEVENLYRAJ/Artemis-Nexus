/**
 * ============================================================
 * ArtemisNexus SPACE MISSION TRACKER — CORE API ENGINE
 * ============================================================
 * Drop-in replacement: swap MOCK_MODE = false and set your
 * API keys once you have them. Java backend can proxy these
 * calls or you can call them directly from the browser.
 *
 * SUPPORTED REAL APIs (all free tiers):
 *  - NASA Open APIs    → https://api.nasa.gov  (key: DEMO_KEY)
 *  - Launch Library 2  → https://ll.thespacedevs.com/2.2.0
 *  - Open Notify ISS   → http://api.open-notify.org
 *  - Celestrak TLE     → https://celestrak.org/SOCRATES
 *  - NASA NeoWs        → https://api.nasa.gov/neo/rest/v1
 *  - NASA Exoplanet    → https://exoplanetarchive.ipac.caltech.edu/TAP
 *  - ESA SSA-NEO       → https://neo.ssa.esa.int/search-for-asteroids
 *  - ISRO (via proxy)  → https://isro.gov.in  (needs Java proxy)
 * ============================================================
 */

window.ArtemisNexus = window.ArtemisNexus || {};

// ── CONFIG ──────────────────────────────────────────────────
ArtemisNexus.CONFIG = {
    MOCK_MODE: true,           // ← Set false to use real APIs
    NASA_API_KEY: 'DEMO_KEY',  // ← Replace with your key from api.nasa.gov
    JAVA_BACKEND: '/api',      // ← Your Spring Boot base URL
    REFRESH_INTERVAL: 60000,   // 1 minute live refresh

    ENDPOINTS: {
        // NASA
        NASA_NEO_FEED: 'https://api.nasa.gov/neo/rest/v1/feed',
        NASA_NEO_BROWSE: 'https://api.nasa.gov/neo/rest/v1/neo/browse',
        NASA_APOD: 'https://api.nasa.gov/planetary/apod',
        NASA_MARS_ROVER: 'https://api.nasa.gov/mars-photos/api/v1/rovers',
        NASA_IMAGES: 'https://images-api.nasa.gov/search',
        NASA_DONKI: 'https://api.nasa.gov/DONKI/notifications',
        NASA_EXOPLANET: 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync',
        // Launch Library 2
        LL2_LAUNCHES: 'https://ll.thespacedevs.com/2.2.0/launch/upcoming',
        LL2_AGENCIES: 'https://ll.thespacedevs.com/2.2.0/agencies',
        LL2_ASTRONAUTS: 'https://ll.thespacedevs.com/2.2.0/astronaut',
        LL2_SPACECRAFT: 'https://ll.thespacedevs.com/2.2.0/spacecraft',
        LL2_SPACESTATION: 'https://ll.thespacedevs.com/2.2.0/spacestation',
        // Open Notify
        ISS_POSITION: 'http://api.open-notify.org/iss-now.json',
        ISS_PEOPLE: 'http://api.open-notify.org/astros.json',
        // Celestrak
        TLE_ACTIVE: 'https://celestrak.org/SOCRATES/query.php',
        // Java Backend (your Spring Boot endpoints)
        JAVA_MISSIONS: '/api/missions',
        JAVA_DISCOVERIES: '/api/discoveries',
        JAVA_ROVERS: '/api/rovers',
    }
};

ArtemisNexus.fetch = async function (url, params = {}, mockFn = null) {
    if (ArtemisNexus.CONFIG.MOCK_MODE && mockFn) {
        return new Promise(resolve => setTimeout(() => resolve(mockFn()), 300));
    }
    const query = new URLSearchParams(params).toString();
    const full = query ? `${url}?${query}` : url;
    try {
        const res = await fetch(full);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        console.warn(`[ArtemisNexus] API call failed (${url}):`, e.message);
        if (mockFn) return mockFn(); // graceful fallback
        return null;
    }
};

ArtemisNexus.fetchJava = async function (endpoint, params = {}, mockFn = null) {
    const url = ArtemisNexus.CONFIG.JAVA_BACKEND + endpoint;
    return ArtemisNexus.fetch(url, params, mockFn);
};

ArtemisNexus.getNEO = async function (startDate, endDate) {
    return ArtemisNexus.fetch(
        ArtemisNexus.CONFIG.ENDPOINTS.NASA_NEO_FEED,
        { start_date: startDate, end_date: endDate, api_key: ArtemisNexus.CONFIG.NASA_API_KEY },
        ArtemisNexus.MOCK.getNEO
    );
};

ArtemisNexus.getLaunches = async function (limit = 20) {
    return ArtemisNexus.fetch(
        ArtemisNexus.CONFIG.ENDPOINTS.LL2_LAUNCHES,
        { limit, mode: 'detailed' },
        () => ArtemisNexus.MOCK.getLaunches(limit)
    );
};

ArtemisNexus.getISSPosition = async function () {
    return ArtemisNexus.fetch(ArtemisNexus.CONFIG.ENDPOINTS.ISS_POSITION, {}, ArtemisNexus.MOCK.getISSPosition);
};

ArtemisNexus.getPeopleInSpace = async function () {
    return ArtemisNexus.fetch(ArtemisNexus.CONFIG.ENDPOINTS.ISS_PEOPLE, {}, ArtemisNexus.MOCK.getPeopleInSpace);
};

ArtemisNexus.getMissions = async function () {
    return ArtemisNexus.fetchJava('/missions', {}, ArtemisNexus.MOCK.getMissions);
};

ArtemisNexus.getDiscoveries = async function () {
    return ArtemisNexus.fetchJava('/discoveries', {}, ArtemisNexus.MOCK.getDiscoveries);
};

ArtemisNexus.getRovers = async function () {
    return ArtemisNexus.fetchJava('/rovers', {}, ArtemisNexus.MOCK.getRovers);
};

ArtemisNexus.today = () => new Date().toISOString().split('T')[0];
ArtemisNexus.daysFromNow = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
};
ArtemisNexus.formatDate = (s) => new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
ArtemisNexus.countdown = (isoDate) => {
    const diff = new Date(isoDate) - new Date();
    if (diff < 0) return 'LAUNCHED';
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `T-${d}D ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ── SHARED UI: HEADER INJECT ──────────────────────────────────
ArtemisNexus.renderHeader = function (activePage) {
    const pages = [
        { id: 'index',            label: 'MISSION CTRL',  href: '/' },
        { id: 'mars',             label: 'MARS ROVER',    href: '/mars' },
        { id: 'blackhole',        label: 'DEEP SPACE',    href: '/blackholes' },
        { id: 'asteroids',        label: 'ASTEROIDS',     href: '/asteroids' },
        { id: 'solarsystembodies',label: 'SOLAR BODIES',  href: '/solarsystembodies' },
        { id: 'spacecraft',       label: 'SPACECRAFT',    href: '/spacecraft' },
        { id: 'spaceprobes',      label: 'PROBES',        href: '/spaceprobes' },
        { id: 'telescope',        label: 'TELESCOPES',    href: '/telescope' },
        { id: 'mission',          label: 'MISSIONS DB',   href: '/mission' },
        { id: 'upcomingmissions', label: 'LAUNCHES',      href: '/upcomingmissions' },
    ];
    return `<nav class="nxs-nav">${pages.map(p =>
        `<a class="${p.id === activePage ? 'active' : ''}" href="${p.href}">${p.label}</a>`
    ).join('')}</nav>`;
};

// ── SHARED UI: STATUS DOT ────────────────────────────────────
ArtemisNexus.statusDot = (status) => {
    const map = { active: '#00ff88', standby: '#00e5ff', warning: '#ffc040', critical: '#ff3060', offline: '#663344' };
    const col = map[status.toLowerCase()] || '#888';
    return `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${col};box-shadow:0 0 6px ${col};margin-right:6px;"></span>`;
};

// ── MOCK DATA ─────────────────────────────────────────────────
ArtemisNexus.MOCK = {};

ArtemisNexus.MOCK.getNEO = () => ({
    element_count: 18,
    near_earth_objects: {
        [ArtemisNexus.today()]: [
            { id: '3542519', name: '(2010 PK9)', estimated_diameter: { kilometers: { estimated_diameter_min: 0.12, estimated_diameter_max: 0.27 } }, is_potentially_hazardous_asteroid: false, close_approach_data: [{ close_approach_date: ArtemisNexus.today(), relative_velocity: { kilometers_per_hour: '42500' }, miss_distance: { kilometers: '4200000' } }] },
            { id: '2162082', name: '(2010 YU55)', estimated_diameter: { kilometers: { estimated_diameter_min: 0.32, estimated_diameter_max: 0.71 } }, is_potentially_hazardous_asteroid: true, close_approach_data: [{ close_approach_date: ArtemisNexus.today(), relative_velocity: { kilometers_per_hour: '63200' }, miss_distance: { kilometers: '1800000' } }] },
            { id: '3517804', name: '(2001 QJ142)', estimated_diameter: { kilometers: { estimated_diameter_min: 0.08, estimated_diameter_max: 0.18 } }, is_potentially_hazardous_asteroid: false, close_approach_data: [{ close_approach_date: ArtemisNexus.today(), relative_velocity: { kilometers_per_hour: '29800' }, miss_distance: { kilometers: '7600000' } }] },
            { id: '2099942', name: '99942 Apophis', estimated_diameter: { kilometers: { estimated_diameter_min: 0.31, estimated_diameter_max: 0.45 } }, is_potentially_hazardous_asteroid: true, close_approach_data: [{ close_approach_date: '2029-04-13', relative_velocity: { kilometers_per_hour: '30160' }, miss_distance: { kilometers: '38000' } }] },
            { id: '3835593', name: '(2019 OK)', estimated_diameter: { kilometers: { estimated_diameter_min: 0.057, estimated_diameter_max: 0.13 } }, is_potentially_hazardous_asteroid: false, close_approach_data: [{ close_approach_date: ArtemisNexus.today(), relative_velocity: { kilometers_per_hour: '88500' }, miss_distance: { kilometers: '73000' } }] },
        ]
    }
});

ArtemisNexus.MOCK.getLaunches = (n) => ({
    count: 45,
    results: [
        { id: 'l001', name: 'Starship IFT-8', net: '2026-05-15T18:00:00Z', status: { name: 'Go' }, rocket: { configuration: { name: 'Starship', family: 'Starship' } }, launch_service_provider: { name: 'SpaceX', country_code: 'USA' }, mission: { name: 'Integrated Flight Test 8', description: 'Eighth integrated flight test of the fully reusable Starship launch system.', orbit: { name: 'Sub-Orbital' } }, pad: { name: 'Starbase', location: { name: 'Boca Chica, TX' } } },
        { id: 'l002', name: 'Falcon 9 | Starlink 12-14', net: '2026-04-28T14:32:00Z', status: { name: 'Go' }, rocket: { configuration: { name: 'Falcon 9', family: 'Falcon' } }, launch_service_provider: { name: 'SpaceX', country_code: 'USA' }, mission: { name: 'Starlink Group 12-14', description: 'Batch of Starlink internet satellites.', orbit: { name: 'LEO' } }, pad: { name: 'SLC-40', location: { name: 'Cape Canaveral, FL' } } },
        { id: 'l003', name: 'Artemis IV', net: '2026-09-01T08:00:00Z', status: { name: 'TBD' }, rocket: { configuration: { name: 'SLS Block 1B', family: 'SLS' } }, launch_service_provider: { name: 'NASA', country_code: 'USA' }, mission: { name: 'Artemis IV', description: 'First SLS Block 1B flight carrying crew to Lunar Gateway.', orbit: { name: 'TLI' } }, pad: { name: 'LC-39B', location: { name: 'Kennedy Space Center, FL' } } },
        { id: 'l004', name: 'ISRO GSLV Mk III | OneWeb', net: '2026-05-02T04:18:00Z', status: { name: 'Go' }, rocket: { configuration: { name: 'GSLV Mk III', family: 'GSLV' } }, launch_service_provider: { name: 'ISRO', country_code: 'IND' }, mission: { name: 'OneWeb India-2', description: '36 OneWeb LEO broadband satellites.', orbit: { name: 'LEO' } }, pad: { name: 'SLP', location: { name: 'Sriharikota, India' } } },
        { id: 'l005', name: 'Ariane 6 | Eutelsat', net: '2026-06-10T22:45:00Z', status: { name: 'Go' }, rocket: { configuration: { name: 'Ariane 62', family: 'Ariane 6' } }, launch_service_provider: { name: 'ArianeSpace', country_code: 'FRA' }, mission: { name: 'Eutelsat 36D', description: 'Commercial geostationary telecom satellite.', orbit: { name: 'GTO' } }, pad: { name: 'ELA-4', location: { name: 'Kourou, French Guiana' } } },
        { id: 'l006', name: 'New Glenn | Demo-2', net: '2026-07-20T12:00:00Z', status: { name: 'TBD' }, rocket: { configuration: { name: 'New Glenn', family: 'New Glenn' } }, launch_service_provider: { name: 'Blue Origin', country_code: 'USA' }, mission: { name: 'Demo Mission 2', description: 'Second demonstration flight of New Glenn heavy-lift rocket.', orbit: { name: 'GTO' } }, pad: { name: 'LC-36', location: { name: 'Cape Canaveral, FL' } } },
        { id: 'l007', name: 'Long March 5B | CSS Module', net: '2026-08-05T07:22:00Z', status: { name: 'Go' }, rocket: { configuration: { name: 'Long March 5B', family: 'Long March 5' } }, launch_service_provider: { name: 'CASC', country_code: 'CHN' }, mission: { name: 'CSS Expansion Module', description: 'Expansion module for Chinese Space Station.', orbit: { name: 'LEO' } }, pad: { name: 'LC-101', location: { name: 'Wenchang, China' } } },
        { id: 'l008', name: 'Falcon Heavy | Europa Clipper Relay', net: '2026-10-12T16:30:00Z', status: { name: 'TBD' }, rocket: { configuration: { name: 'Falcon Heavy', family: 'Falcon Heavy' } }, launch_service_provider: { name: 'SpaceX', country_code: 'USA' }, mission: { name: 'Europa Relay Sat', description: 'Communications relay satellite for upcoming Europa mission.', orbit: { name: 'Heliocentric' } }, pad: { name: 'LC-39A', location: { name: 'Kennedy Space Center, FL' } } },
    ].slice(0, n)
});

ArtemisNexus.MOCK.getISSPosition = () => ({
    iss_position: { latitude: (Math.random() * 160 - 80).toFixed(4), longitude: (Math.random() * 360 - 180).toFixed(4) },
    timestamp: Math.floor(Date.now() / 1000),
    message: 'success'
});

ArtemisNexus.MOCK.getPeopleInSpace = () => ({
    number: 7,
    people: [
        { name: 'Oleg Kononenko', craft: 'ISS' }, { name: 'Nikolai Chub', craft: 'ISS' },
        { name: 'Tracy Dyson', craft: 'ISS' }, { name: 'Butch Wilmore', craft: 'ISS' },
        { name: 'Suni Williams', craft: 'ISS' }, { name: 'Alexander Grebenkin', craft: 'ISS' },
        { name: 'Jing Haiping', craft: 'Tiangong' },
    ]
});

ArtemisNexus.MOCK.getMissions = () => ([
    { id: 1, name: 'Perseverance', agency: 'NASA', type: 'Rover', status: 'Active', launch: '2020-07-30', destination: 'Mars', sol: 1468 },
    { id: 2, name: 'JWST', agency: 'NASA/ESA', type: 'Space Telescope', status: 'Active', launch: '2021-12-25', destination: 'L2 Point', sol: null },
    { id: 3, name: 'Artemis III', agency: 'NASA', type: 'Crewed Lunar', status: 'Planned', launch: '2026-09-01', destination: 'Moon', sol: null },
    { id: 4, name: 'Chandrayaan-3', agency: 'ISRO', type: 'Lunar Lander', status: 'Complete', launch: '2023-07-14', destination: 'Moon', sol: null },
    { id: 5, name: 'BepiColombo', agency: 'ESA/JAXA', type: 'Orbiter', status: 'En Route', launch: '2018-10-20', destination: 'Mercury', sol: null },
]);

ArtemisNexus.MOCK.getDiscoveries = () => ([
    { id: 1, mission: 'Perseverance', title: 'Organic molecules in Jezero', date: '2026-04-14', type: 'Biosignature', priority: 'HIGH' },
    { id: 2, mission: 'JWST', title: 'Carbon in TRAPPIST-1e atmosphere', date: '2026-03-22', type: 'Exoatmosphere', priority: 'HIGH' },
    { id: 3, mission: 'Curiosity', title: 'Sulfur crystal deposits', date: '2026-02-10', type: 'Mineralogy', priority: 'MEDIUM' },
]);

ArtemisNexus.MOCK.getRovers = () => ([
    { name: 'Perseverance', status: 'Active', sol: 1468, lat: 18.44, lon: 77.45, battery: 84, temp: -63 },
    { name: 'Curiosity', status: 'Active', sol: 4160, lat: -4.59, lon: 137.44, battery: 71, temp: -55 },
    { name: 'Opportunity', status: 'Offline', sol: 5111, lat: -1.95, lon: 354.47, battery: 0, temp: null },
]);

// ── SHARED CHART DEFAULTS ────────────────────────────────────
ArtemisNexus.chartDefaults = (accentColor = '#00e5ff') => ({
    plugins: {
        legend: { labels: { color: 'rgba(200,220,240,0.6)', font: { family: "'Share Tech Mono'", size: 9 }, boxWidth: 12, padding: 10 } },
        tooltip: { backgroundColor: 'rgba(4,18,35,0.95)', borderColor: accentColor, borderWidth: 1, titleColor: accentColor, bodyColor: 'rgba(200,220,240,0.8)', titleFont: { family: "'Share Tech Mono'" }, bodyFont: { family: "'Share Tech Mono'", size: 11 } }
    },
    scales: {
        x: { ticks: { color: 'rgba(100,140,160,0.7)', font: { family: "'Share Tech Mono'", size: 8 }, maxTicksLimit: 8 }, grid: { color: `rgba(${accentColor === '#00e5ff' ? '0,229,255' : '176,96,255'},0.06)` }, border: { color: `rgba(${accentColor === '#00e5ff' ? '0,229,255' : '176,96,255'},0.2)` } },
        y: { ticks: { color: 'rgba(100,140,160,0.7)', font: { family: "'Share Tech Mono'", size: 8 } }, grid: { color: `rgba(${accentColor === '#00e5ff' ? '0,229,255' : '176,96,255'},0.06)` }, border: { color: `rgba(${accentColor === '#00e5ff' ? '0,229,255' : '176,96,255'},0.2)` } }
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1400, easing: 'easeInOutQuart' }
});

console.log('[ArtemisNexus] Core API engine loaded. MOCK_MODE:', ArtemisNexus.CONFIG.MOCK_MODE);