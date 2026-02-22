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


import DOMPurify from 'dompurify';

export default function clickableLink(description: string)  {
    if (!description) {
        return;
    }

    // Encode HTML entities 
    // this should prevent xxs attacks, but still allow the users tp write out html as part of the description
    const encodeHTML = (str: string) => {
        return str
        .replace(/&/g, '&amp')
        .replace(/</g, '&lt')
        .replace(/>/g, '&gt')
        .replace(/"/g, '&quot')
        .replace(/'/g, '&#039');
    }

    const cleanDescription = encodeHTML(description);

    // Split the description into words
    let words = cleanDescription.split(' ');

    const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
    const regEx = new RegExp(expression);
    
    // Iterate over each word and check
    for (let i = 0; i < words.length; i++) {
        if (words[i].match(regEx)) { //Checks if there are links that start with https
            // Wrap the word with <a> tag
            let userLink = `<a href="${words[i]}" target="_blank" rel="noopener noreferrer">${words[i]}</a>`;
            words[i] = DOMPurify.sanitize(userLink, {
                ALLOWED_TAGS: ['a'],
                ALLOWED_ATTR: ['href', 'target', 'rel']
            })

        }
    }

    // Join the words back into a single string
    let new_description = words.join(" ");

    return new_description;
}
