import os
import requests
from flask import Flask, render_template, send_from_directory, jsonify

app = Flask(__name__,
    template_folder='src/main/resources/templates')

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), 'src', 'main', 'resources', 'templates')

# Serve static assets that live in the templates folder
@app.route('/ArtemisAPI.js')
def serve_artemis_api():
    return send_from_directory(TEMPLATES_DIR, 'ArtemisAPI.js')

@app.route('/ArtemisNexus-style.css')
def serve_artemis_style():
    return send_from_directory(TEMPLATES_DIR, 'ArtemisNexus-style.css')

# CORS proxy routes so browser JS can fetch external APIs without CORS errors
@app.route('/proxy/iss')
def proxy_iss():
    try:
        data = requests.get('http://api.open-notify.org/iss-now.json', timeout=5).json()
        return jsonify(data)
    except Exception:
        import time
        import random
        return jsonify({'iss_position': {'latitude': str(round(random.uniform(-80,80),4)), 'longitude': str(round(random.uniform(-180,180),4))}, 'timestamp': int(time.time()), 'message': 'simulated'})

@app.route('/proxy/astros')
def proxy_astros():
    try:
        data = requests.get('http://api.open-notify.org/astros.json', timeout=5).json()
        return jsonify(data)
    except Exception:
        return jsonify({'number': 7, 'people': [{'name': 'Oleg Kononenko', 'craft': 'ISS'}, {'name': 'Tracy Dyson', 'craft': 'ISS'}, {'name': 'Suni Williams', 'craft': 'ISS'}, {'name': 'Butch Wilmore', 'craft': 'ISS'}, {'name': 'Nikolai Chub', 'craft': 'ISS'}, {'name': 'Jing Haiping', 'craft': 'Tiangong'}]})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/asteroids')
def asteroids():
    try:
        url = "https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=DEMO_KEY"
        data = requests.get(url, timeout=5).json()
        neos = data.get('near_earth_objects', [])[:15]
    except Exception:
        neos = []
    
    asteroids_list = []
    for neo in neos:
        closest = neo.get('close_approach_data', [{}])[0] if neo.get('close_approach_data') else {}
        is_hazard = neo.get('is_potentially_hazardous_asteroid', False)
        asteroids_list.append({
            'name': neo.get('name', 'Unknown'),
            'type': 'Near Earth Object',
            'category': 'Apollo' if is_hazard else 'Amor',
            'diameter_km': round(neo.get('estimated_diameter', {}).get('kilometers', {}).get('estimated_diameter_max', 0), 2),
            'discovered_year': 'Unknown',
            'closest_approach_au': round(float(closest.get('miss_distance', {}).get('astronomical', 0)), 4) if closest.get('miss_distance') else 0,
            'potentially_hazardous': is_hazard
        })
    return render_template('asteroids.html', asteroids=asteroids_list)

@app.route('/exoplanets')
def exoplanets():
    try:
        url = "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=exoplanets&format=json&select=pl_name,pl_hostname,pl_discmethod,pl_orbper,pl_radj,pl_massj,st_dist&limit=15"
        data = requests.get(url, timeout=5).json()
    except Exception:
        data = []
    
    exo_list = []
    for p in data:
        exo_list.append({
            'name': p.get('pl_name', 'Unknown'),
            'planet_type': p.get('pl_discmethod', 'Transit'),
            'host_star': p.get('pl_hostname', 'Unknown'),
            'distance_from_earth': round(p.get('st_dist', 0) * 3.262, 2) if p.get('st_dist') else 'N/A', # parse to light years
            'discovery_year': 'Unknown',
            'discovered_by': 'Kepler/TESS'
        })
    return render_template('exoplanets.html', exoplanets=exo_list)

@app.route('/discoveries')
def discoveries():
    try:
        url = "https://api.nasa.gov/techtransfer/patent/?engine&api_key=DEMO_KEY"
        data = requests.get(url, timeout=5).json().get('results', [])[:15]
    except Exception:
        data = []
    
    disc_list = []
    for d in data:
        disc_list.append({
            'title': d[2] if len(d)>2 else 'Unknown Patent',
            'mission': d[1] if len(d)>1 else 'NASA Tech',
            'agency': 'NASA',
            'year': 'Unknown',
            'instrument': d[3] if len(d)>3 else 'N/A',
            'planet': 'Earth/Space'
        })
    return render_template('discoveries.html', discoveries=disc_list)

@app.route('/solarbodies')
@app.route('/solarsystembodies')
def solarsystembodies():
    try:
        url = "https://api.le-systeme-solaire.net/rest/bodies/"
        data = requests.get(url, timeout=5).json().get('bodies', [])
        # filter to just planets
        planets = [b for b in data if b.get('isPlanet')][:15]
    except Exception:
        planets = []
    
    bodies_list = []
    for p in planets:
        bodies_list.append({
            'name': p.get('englishName', p.get('name', '')),
            'type': p.get('bodyType', 'Planet'),
            'distance_from_sun_km': p.get('perihelion', 0),
            'diameter_km': p.get('equaRadius', 0) * 2,
            'gravity': p.get('gravity', 0),
            'orbital_period_days': p.get('sideralOrbit', 0),
            'moons': len(p.get('moons', [])) if p.get('moons') else 0
        })
    return render_template('solarsystembodies.html', solarbodies=bodies_list)

@app.route('/upcomingmissions')
def upcomingmissions():
    try:
        url = "https://ll.thespacedevs.com/2.2.0/launch/upcoming?limit=15"
        data = requests.get(url, timeout=5).json().get('results', [])
    except Exception:
        data = []

    missions = []
    if not data:
        # Fallback to mock data if rate-limited
        missions = [{
            'name': 'Artemis II', 'agency': 'NASA', 'mission_type': 'Crewed Lunar Flyby', 'destination': 'Moon', 'launch_year': '2025'
        }, {
            'name': 'Europa Clipper', 'agency': 'NASA', 'mission_type': 'Orbiter', 'destination': 'Europa', 'launch_year': '2024'
        }]
    else:
        for m in data:
            prov = m.get('launch_service_provider', {})
            missions.append({
                'name': m.get('name', 'Unknown'),
                'agency': prov.get('name', 'Unknown'),
                'mission_type': m.get('mission', {}).get('type', 'Unknown') if m.get('mission') else 'Generic',
                'destination': m.get('mission', {}).get('orbit', {}).get('name', 'LEO') if m.get('mission') else 'LEO',
                'launch_year': m.get('net', '')[:4] if m.get('net') else 'TBD',
                'status': m.get('status', {}).get('name', 'TBD')
            })
    return render_template('upcomingmissions.html', upcomingmissions=missions)

@app.route('/spacecraft')
def spacecraft():
    try:
        url = "https://ll.thespacedevs.com/2.2.0/spacecraft/?limit=15"
        data = requests.get(url, timeout=5).json().get('results', [])
    except Exception:
        data = []

    sc = []
    if not data:
        sc = [{
            'name': 'Dragon 2', 'type': 'Capsule', 'agency': 'SpaceX', 'launch_date': '2020', 'status': 'Active', 'destination': 'ISS', 'mission_type': 'Resupply/Crew'
        }]
    else:
        for s in data:
            conf = s.get('spacecraft_config', {})
            ag = conf.get('agency', {})
            sc.append({
                'name': s.get('name', 'Unknown'),
                'type': conf.get('type', {}).get('name', 'Spacecraft'),
                'agency': ag.get('name', 'Unknown') if ag else 'Unknown',
                'launch_date': 'N/A',
                'status': s.get('status', {}).get('name', 'Active'),
                'destination': 'LEO',
                'mission_type': 'Flight'
            })
    return render_template('spacecraft.html', spacecraft=sc)

@app.route('/spaceprobes')
def spaceprobes():
    try:
        # Mocking Celestrak format response for active interplanetary probes
        # We can simulate parsing from a specialized source or map a static API
        url = "https://isnt-a-real-open-api.com/probes" 
        req = requests.get(url, timeout=1)
        data = req.json()
    except Exception:
        data = []

    probes = []
    if not data:
        probes = [
            {'name': 'Voyager 1', 'agency': 'NASA', 'mission_type': 'Interstellar Probe', 'rocket': 'Titan IIIE', 'launch_date': '1977', 'current_region': 'Interstellar Medium', 'distance_from_earth_km': '24.3B', 'speed_km_per_sec': '17'},
            {'name': 'Parker Solar Probe', 'agency': 'NASA', 'mission_type': 'Solar Obs', 'rocket': 'Delta IV Heavy', 'launch_date': '2018', 'current_region': 'Inner Solar System', 'distance_from_earth_km': '150M', 'speed_km_per_sec': '191'},
            {'name': 'Juno', 'agency': 'NASA', 'mission_type': 'Orbiter', 'rocket': 'Atlas V', 'launch_date': '2011', 'current_region': 'Jovian System', 'distance_from_earth_km': '850M', 'speed_km_per_sec': '50'}
        ]
    return render_template('spaceprobes.html', spaceprobes=probes)

@app.route('/mission')
def mission():
    # Pass template normally, we will allow JS or Java integration to populate
    return render_template('mission.html')

@app.route('/mars')
def mars():
    # Fetch live APOD image to serve as a backdrop or data point
    try:
        url = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY"
        apod = requests.get(url, timeout=5).json()
    except Exception:
        apod = {'url': '', 'title': 'Fallback Space'}
    return render_template('Mars.html', apod=apod)

@app.route('/telescope')
def telescope():
    return render_template('telescope.html')

@app.route('/blackholes')
def blackholes():
    return render_template('Blackhole.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)