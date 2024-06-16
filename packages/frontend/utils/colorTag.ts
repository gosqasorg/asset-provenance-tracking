// colorTag.ts -- compute meaninful colors for tags
// Copyright (C) 2024  Nora Moor and Robert L. Read

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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

interface AssociativeArray {
  [key: string]: string
}

var designedTags: AssociativeArray[] = []
designedTags['recall'] = "#ff0000"; // Red
designedTags['good'] = "#00ff00"; // Green
designedTags['bad'] = "#dc143c"; // Crimson
designedTags['received'] = "#0000cd"; // MediumBlue
designedTags['inspected'] = "#6495ed"; // CornflowerBlue
designedTags['sent'] = "#ffff00"; // Yellow


// Function to generate hash.
function generateHash (str : string) : number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt (i); // This method of string values returns an integer between 0 and 65535, which represents the UTF-16 code unit at the given index.
    hash = (hash << 5) - hash + char; //
    hash &= hash;
  }
  return Math.abs (hash) % 100;
}

// Function to get color for a tag.
export function getColorForTag (tagName : string) : string {

  // If the tagName is one we recognize, we will use
  // our designed colors
  if (tagName in designedTags) {
    return designedTags[tagName];
  }

  // Generate hash based on the tag name.
  const hash = generateHash (tagName); // Declares a constant variable, "hash", that cannot be changed after initialization.
  // Use the hash to get a color from the "colors" array.
  return colors [hash];
}

function colorToTextColor (color : string) : string {
  const hex = color.substring (1);
  const bigint = parseInt (hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  // Calculate the brightness of the color.
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Decide whether to use black or white text based on the brightness.
  const textColor = brightness > 128 ? "#000000" : "#ffffff";

  return textColor;
}

export function textColorForTag( tag : string) {
  return colorToTextColor(getColorForTag(tag));
}
