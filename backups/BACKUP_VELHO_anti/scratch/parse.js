import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/views/DubolaView.jsx');
const content = fs.readFileSync(filePath, 'utf8');


let line = 1;
let col = 1;
const braceStack = [];
const parenStack = [];
const bracketStack = [];

let inString = null; // '"', "'", "`"
let inComment = false; // 'slash-slash', 'slash-star'
let inRegex = false;

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  const nextChar = content[i + 1];
  const prevChar = content[i - 1];

  // Handle line/col counting
  if (char === '\n') {
    line++;
    col = 1;
  } else {
    col++;
  }

  // Handle strings
  if (inString) {
    if (char === inString && prevChar !== '\\') {
      inString = null;
    }
    continue;
  }

  // Handle comments
  if (inComment === 'slash-slash') {
    if (char === '\n') {
      inComment = false;
    }
    continue;
  }
  if (inComment === 'slash-star') {
    if (char === '*' && nextChar === '/') {
      inComment = false;
      i++;
      col++;
    }
    continue;
  }

  // Start comments
  if (char === '/' && nextChar === '/') {
    inComment = 'slash-slash';
    i++;
    col++;
    continue;
  }
  if (char === '/' && nextChar === '*') {
    inComment = 'slash-star';
    i++;
    col++;
    continue;
  }

  // Start strings
  if (char === '"' || char === "'" || char === '`') {
    inString = char;
    continue;
  }

  // Count braces
  if (char === '{') {
    braceStack.push({ line, col, index: i });
    if (line >= 314 && line <= 600) {
      console.log(`PUSH '{' at line ${line}, col ${col}. Stack size now: ${braceStack.length}`);
    }
  } else if (char === '}') {
    if (braceStack.length === 0) {
      console.log(`Unmatched } at line ${line}, col ${col}`);
    } else {
      const popped = braceStack.pop();
      if (line >= 314 && line <= 600) {
        console.log(`POP '}' at line ${line}, col ${col}. Matched '{' from line ${popped.line}, col ${popped.col}. Stack size now: ${braceStack.length}`);
      }
    }
  }

  // Count parens
  if (char === '(') {
    parenStack.push({ line, col, index: i });
  } else if (char === ')') {
    if (parenStack.length === 0) {
      console.log(`Unmatched ) at line ${line}, col ${col}`);
    } else {
      parenStack.pop();
    }
  }

  // Count brackets
  if (char === '[') {
    bracketStack.push({ line, col, index: i });
  } else if (char === ']') {
    if (bracketStack.length === 0) {
      console.log(`Unmatched ] at line ${line}, col ${col}`);
    } else {
      bracketStack.pop();
    }
  }
}

console.log('Scan finished.');
console.log('Unclosed braces left in stack:', braceStack.length);
if (braceStack.length > 0) {
  console.log('Top unclosed braces:', braceStack.slice(-5));
}
console.log('Unclosed parens left in stack:', parenStack.length);
if (parenStack.length > 0) {
  console.log('Top unclosed parens:', parenStack.slice(-5));
}
console.log('Unclosed brackets left in stack:', bracketStack.length);
if (bracketStack.length > 0) {
  console.log('Top unclosed brackets:', bracketStack.slice(-5));
}
