// tagFuncs.ts -- Redraws and Removes Tags
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

function removeTag(tag: string, storedTags: string[], createdTags: string[], tagsListID: string, tagInputID: string) {
	// Remove tag from the screen
	if (storedTags.includes(tag)) {
		storedTags.forEach((item, index) => {
			if (item == tag) {
				storedTags.splice(index, 1);
				createdTags.splice(index, 1);
			}
		});
	}

	// Redraw visible tags
	redrawTags(storedTags, createdTags, tagsListID, tagInputID);

	// Update tags in other files
	const event = new Event('input');
	let inputField = document.getElementById(tagInputID) as HTMLInputElement;
	inputField.dispatchEvent(event);
}

export function redrawTags(storedTags: string[], createdTags: string[], tagsListID: string, tagInputID: string) {
	// Get the page elements to update
	let ul = document.getElementById(tagsListID);

	// Remove all the tags on the screen
	if (ul) {
		ul.querySelectorAll("li").forEach(li => li.remove());
	}

	// Redraw the tags with our updated values
	storedTags.slice().reverse().forEach(tag => {
		// Create tag to draw
		let liTag = document.createElement('li');
		liTag.style.color = textColorForTag(tag);
		liTag.style.backgroundColor = getColorForTag(tag);
		liTag.innerHTML = `${tag} <i class="uit uit-multiply"></i>`;

		// Create event listener for click
		liTag.addEventListener('click', function () {
			removeTag(tag, storedTags, createdTags, tagsListID, tagInputID);
		});

		// Add tag to the screen
		if (ul) {
			ul.insertAdjacentElement("afterbegin", liTag);
		}
	});
}
