import os
import re

path = r'd:\IT or Computer Science\Computer Science\Java\space-mission\src\main\resources\templates'

for fn in os.listdir(path):
    if not fn.endswith('.html'): continue
    filepath = os.path.join(path, fn)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Provide a map of route to actual file
    routes = {
        '/asteroids': 'asteroids.html',
        '/discoveries': 'discoveries.html',
        '/exoplanets': 'exoplanets.html',
        '/mission': 'mission.html',
        '/solarbodies': 'solarsystembodies.html',
        '/spacecraft': 'spacecraft.html',
        '/spaceprobes': 'spaceprobes.html',
        '/upcomingmissions': 'upcomingmissions.html',
        '/telescope': 'telescope.html',
        '/mars': 'Mars.html',
        '/blackholes': 'Blackhole.html',
        '/': 'index.html'
    }

    original_content = content
    # Look for href="/route" or href="/route " and replace
    for route, target_file in routes.items():
        # exact match for href="/route"
        # We need to escape because / is special? no.
        # Handle the root route carefully: replace href="/" ONLY, not href="/something"
        if route == '/':
            content = re.sub(r'href="/"', f'href="{target_file}"', content)
        else:
            content = re.sub(f'href="{route}"', f'href="{target_file}"', content)
    
    if original_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed links in", fn)

print("All links have been mapped to local .html files.")
