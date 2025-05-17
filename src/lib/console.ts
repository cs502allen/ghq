let printed = false;

const asciiArt = `\
  ,ad8888ba,   88        88    ,ad8888ba,    88
 d8"'    \`"8b  88        88   d8"'    \`"8b   88
d8'            88        88  d8'        \`8b  88
88             88aaaaaaaa88  88          88  88
88      88888  88""""""""88  88          88  88
Y8,        88  88        88  Y8,    "88,,8P  ""
 Y8a.    .a88  88        88   Y8a.    Y88P   aa
  \`"Y88888P"   88        88    \`"Y8888Y"Y8a  88
`;

const colors = [
  "#FF0000",
  "#4169E1",
  "#4169E1",
  "#6495ED",
  "#87CEEB",
  "#FF6347",
  "#FF4500",
  "#FF0000",
];

export function printWelcome() {
  if (printed) {
    return;
  }

  const lines = asciiArt.split("\n");
  lines.forEach((line, index) => {
    const color = colors[index % colors.length];
    console.log(`%c${line}`, `color: ${color}; font-family: monospace;`);
  });

  printed = true;
}
