import re

files = [
    'src/views/DubolaView.jsx',
    'src/views/DubolaLineView.jsx'
]

valid_shades = {50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950}
colors = {'stone', 'amber', 'orange', 'blue', 'purple', 'slate', 'gray', 'zinc', 'neutral', 'red', 'green', 'yellow', 'lime', 'emerald', 'teal', 'cyan', 'sky', 'indigo', 'violet', 'fuchsia', 'pink', 'rose'}

pattern = re.compile(r'(\b\w+)-([0-9]+)\b')

for filename in files:
    print(f"=== Checking {filename} ===")
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for idx, line in enumerate(lines):
        line_num = idx + 1
        matches = pattern.findall(line)
        for color, shade in matches:
            if color in colors:
                shade_val = int(shade)
                if shade_val not in valid_shades:
                    print(f"Line {line_num}: Invalid class '{color}-{shade}'")
