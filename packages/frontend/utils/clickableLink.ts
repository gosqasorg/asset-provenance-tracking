// ClickableLink - Detects a link in string and makes it clickable

// Copyright (C) 2024 GOSQAS Team
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

export async function clickableLink(description: string): Promise<string> {

    // Split the description into words
    let words = description.split(' ');

    // Iterate over each word and check if it ends with .com or .org
    for (let i = 0; i < words.length; i++) {
        if (words[i].endsWith('.com') || words[i].endsWith('.org')) {
            // Wrap the word with <a> tag
            words[i] = `<a href="${words[i]}">${words[i]}</a>`;
        }
    }

    // Join the words back into a single string
    let new_description = words.join ("");

    return new_description;
}

