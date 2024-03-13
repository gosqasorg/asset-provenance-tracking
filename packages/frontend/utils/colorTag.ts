// Array of 100 random colors codes.
const colors = [
    "#e9347b",
    "#736f93",
    "#7ddf4c",
    "#048c36",
    "#8efd83",
    "#64b21c",
    "#80f81e",
    "#a45289",
    "#a21a95",
    "#b66b31",
    "#2b0b9f",
    "#93458a",
    "#e5c4b8",
    "#aca37b",
    "#e03a57",
    "#ca7391",
    "#0b390f",
    "#2e4e01",
    "#ca207d",
    "#dc62ff",
    "#b058c6",
    "#3869ba",
    "#f093a5",
    "#f1b790",
    "#2f5200",
    "#b67b7c",
    "#5a8e11",
    "#71e715",
    "#978e51",
    "#ab62cf",
    "#19b1cb",
    "#840376",
    "#fb5e54",
    "#ca4ba5",
    "#d529e6",
    "#6a38e6",
    "#7aff5c",
    "#0a4f2d",
    "#8a1e07",
    "#4978e4",
    "#51d5a3",
    "#3f5401",
    "#61d6a1",
    "#be991e",
    "#1a3cce",
    "#673497",
    "#43a964",
    "#0463ac",
    "#a67695",
    "#e37c7e",
    "#0202c9",
    "#4cace3",
    "#a7b6c8",
    "#8dc17e",
    "#5e766b",
    "#237375",
    "#b55306",
    "#13a9a4",
    "#33a044",
    "#a43247",
    "#eef7aa",
    "#0861ee",
    "#6e8124",
    "#e6864d",
    "#d127ce",
    "#a2ee58",
    "#698398",
    "#c9c2ad",
    "#0c18f2",
    "#1f409c",
    "#2a4db8",
    "#e77c6e",
    "#860de6",
    "#6074a6",
    "#825ca9",
    "#45184e",
    "#246d17",
    "#9b4280",
    "#f40b41",
    "#a3e952",
    "#2581ce",
    "#90363a",
    "#1831f1",
    "#39a9b7",
    "#8ae644",
    "#089179",
    "#67576f",
    "#bd5e97",
    "#80e91a",
    "#c32d2e",
    "#19be09",
    "#7f2178",
    "#6c6dfa",
    "#9de2d7",
    "#16d5b2",
    "#262cee",
    "#df7857",
    "#0e8c75",
    "#b0c96e",
    "#eb1d1a",
];

// Function to generate hash.
function generateHash (str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt (i); // This method of string values returns an integer between 0 and 65535, which represents the UTF-16 code unit at the given index.
        hash = (hash << 5) - hash + char; //
        hash &= hash;
    }
    return Math.abs (hash) % 100;
}

// Function to get color for a tag.
function getColorForTag (tagName) {
    // Generate hash based on the tag name.
    const hash = generateHash (tagName); // Declares a constant variable, "hash", that cannot be changed after initialization.
    // Use the hash to get a color from the "colors" array.
    return colors [hash];
}
const ANSI_COLOR_CODES = {
    reset: "\x1b[0m",
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
};

// Function to convert hex color code to ANSI escape sequence.
function colorToAnsiEsacpe (color) {
    const hex = color.substring (1);
    const bigint = parseInt (hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // Calculate the brightness of the color.
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Decide whether to use black or white text based on the brightness.
    const textColor = brightness > 128 ? ANSI_COLOR_CODES.black : ANSI_COLOR_CODES.white;

    // Calculate the closest ANSI color approximation.
    const index = 16 + (36 * Math.round (r / 255 * 5)) + (6 * Math.round (g / 255 * 5)) + Math.round (b / 255 * 5);

    // Return the ANSI escape sequence for the closest color.
    return `${ANSI_COLOR_CODES.reset}\x1b[48;5;${index}m${textColor}`;
}

function colorToTextColor (color) {
    const hex = color.substring (1);
    const bigint = parseInt (hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // Calculate the brightness of the color.
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Decide whether to use black or white text based on the brightness.
  // const textColor = brightness > 128 ? ANSI_COLOR_CODES.black : ANSI_COLOR_CODES.white;
  const textColor = brightness > 128 ? "black" : "white";

    // Calculate the closest ANSI color approximation.
    const index = 16 + (36 * Math.round (r / 255 * 5)) + (6 * Math.round (g / 255 * 5)) + Math.round (b / 255 * 5);

    // Return the ANSI escape sequence for the closest color.
  return [index,textColor];
}

// // Readline Interface
// const readline = require ("readline").createInterface ({
//     input: process.stdin,
//     output: process.stdout,
// });

// // Ask for user input.
// readline.question ("Enter a tag name: ", (tagName) => { // "readline" reads the data line by line. "(tagName) => {}" takes a parameter "tagName" and creates a color variable by calling the "getColorForTag" function.
//     const color = getColorForTag (tagName);
//     console.log (`The "${tagName}" tag color: ${color}`);
//     readline.question ("Would you like to preview this color? ", userResponse => {
//         const ansiCode = colorToAnsi (color);
//         if (userResponse === "yes" || userResponse === "y") {
//             console.log (`${ansiCode}${tagName}${ANSI_COLOR_CODES.reset}`);
//         }
//         else {
//             console.log (`Okay!`);
//         }
//         readline.close ();
//     });
// });


export function robscolorfunc(x) {
  const color = getColorForTag(x);
  const [index, textColor] = colorToTextColor(color);
  return color;
}
export function robstextcolorfunc(x) {
  const color = getColorForTag(x);
  const [index, textColor] = colorToTextColor(color);
  alert(textColor);
  return textColor;
}
