import os
import re

template_dir = r"d:\IT or Computer Science\Computer Science\Java\space-mission\src\main\resources\templates"

for filename in os.listdir(template_dir):
    if not filename.endswith(".html"): continue
    path = os.path.join(template_dir, filename)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Remove the `<section class="form-panel" ...` completely
    content = re.sub(r'<section\s+class="form-panel".*?</section>', '', content, flags=re.DOTALL)
    
    # 2. Convert th:each on <tr> elements into Jinja2
    # e.g., <tr th:each="asteroid : ${asteroids}"> becomes:
    # {% for asteroid in asteroids %}
    # <tr>
    # ...
    # </tr>
    # {% endfor %}
    def replace_each(match):
        th_each_val = match.group(2) # "asteroid : ${asteroids}"
        parts = th_each_val.split(":")
        if len(parts) == 2:
            item = parts[0].strip()
            # ${asteroids} -> asteroids
            collection = parts[1].replace("${", "").replace("}", "").strip()
            # remove th:each from the <tr> tag
            tr_tag = match.group(1).replace(match.group(0)[match.group(0).find('th:each'):match.group(0).find('"', match.group(0).find('th:each') + 9) + 1], "")
            
            return f"{{% for {item} in {collection} %}}\n{tr_tag}\n{{% endfor %}}"
        return match.group(0)

    # Note: parsing nested html with regex is flawed but works on flat tables
    content = re.sub(r'(<tr[^>]*th:each="([^"]+)"[^>]*>.*?</tr>)', replace_each, content, flags=re.DOTALL)

    # 3. Convert all th:text="${item.prop}" to {{ item.prop }} and remove the th:text attribute
    # e.g., <td th:text="${asteroid.name}">-</td> to <td>{{ asteroid.name }}</td>
    def replace_text(match):
        prop = match.group(2) # asteroid.name
        # match.group(1) is the opening tag up to th:text
        # we need to remove the th:text attribute entirely and just put the {{ prop }} inside the element
        tag_start = match.group(0).split('th:text')[0].strip()
        # Some tags might have ">" right after, some might have other attrs. We just safely remove th:text="${...}"
        clean_tag = match.group(1).replace(match.group(0)[match.group(0).find('th:text'):match.group(0).find('"', match.group(0).find('th:text') + 9) + 1], "")
        return f'{clean_tag}>{{{{ {prop} }}}}</{match.group(3)}>'

    # Simple regex: find tags with th:text
    # <td th:text="${asteroid.name}">-</td>
    content = re.sub(r'(<([a-zA-Z0-9]+)[^>]*?)\s*th:text="\$\{([^}]+)\}"([^>]*>).*?</\2>', lambda m: f"{m.group(1)}{m.group(4)}{{{{ {m.group(3)} }}}}</{m.group(2)}>", content, flags=re.DOTALL)

    # 4. Same for th:if
    def replace_if(match):
        cond = match.group(2).replace("${", "").replace("}", "")
        # convert 'asteroids.size() > 0' to 'asteroids|length > 0'
        cond = cond.replace(".size()", "|length")
        cond = cond.replace("potentially_hazardous ?", "potentially_hazardous")
        
        tag = match.group(1).replace(match.group(0)[match.group(0).find('th:if'):match.group(0).find('"', match.group(0).find('th:if') + 7) + 1], "")
        return f"{{% if {cond} %}}\n{tag}\n{{% endif %}}"

    content = re.sub(r'(<div[^>]*th:if="([^"]+)"[^>]*>.*?</div>)', replace_if, content, flags=re.DOTALL)
    
    # Also clean up xmlns:th in head
    content = content.replace('xmlns:th="http://www.thymeleaf.org"', '')

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("Done mapping Thymeleaf to Jinja!")
