import re

with open('/Users/bruno/Documents/anti/src/views/DubolaView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Match standard emojis
emoji_pattern = re.compile(
    r'[\U00010000-\U0010ffff]'  # emojis and other extra characters
)

matches = []
for line_num, line in enumerate(content.splitlines(), 1):
    found = emoji_pattern.findall(line)
    if found:
        matches.append((line_num, line, found))

if matches:
    print(f"Found {len(matches)} lines with emojis/extended unicode:")
    for num, text, chars in matches:
        print(f"Line {num}: {text.strip()} -> {chars}")
else:
    print("No emojis or extended unicode characters found!")
