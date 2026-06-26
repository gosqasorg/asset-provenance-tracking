// tagFuncs.ts -- Creates, Updates, and Removes Tags
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

import { getDecipheredForbiddenTags } from '~/utils/forbiddenTags';

// TODO: can we reduce the number of parameters?
function removeTag(inputField: HTMLInputElement, tag: string, storedTags: string[], createdTags: string[], tagsListID: string, tagInputID: string, placeholder: string) {
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
	createTag(storedTags, createdTags, tagsListID, tagInputID, placeholder);

	// Update tags in other files
	const event = new Event('input');
	inputField.dispatchEvent(event);
}

// TODO: would redrawTags be more or less confusing? (since this function adds and removes tags)
export function createTag(storedTags: string[], createdTags: string[], tagsListID: string, tagInputID: string, placeholder: string) {
	// Get the page elements to update
	let ul = document.getElementById(tagsListID);
	let input = document.getElementById(tagInputID) as HTMLInputElement;

	// TODO: make cleaner?
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
			removeTag(input, tag, storedTags, createdTags, tagsListID, tagInputID, placeholder);
		});

		// Add tag to the screen
		if (ul) {
			ul.insertAdjacentElement("afterbegin", liTag);
		}
	});

	// If there's no text or tags on the screen show the placeholder text
	if (storedTags.length == 0 && input) {
		input.placeholder = placeholder;
	} else if (input) {
		input.placeholder = "";
	}
}

export function cleanArray(array: string[]) {
	// Remove any tags with forbidden words in them
	const forbiddenWords = getDecipheredForbiddenTags();
	const cleanedArray = array.filter(tagName => !forbiddenWords.includes(tagName.toLowerCase()));
	return cleanedArray;
}

export function updateTags(storedTags: string[], createdTags: string[], editableValue: string, tagsListID: string, tagInputID: string, placeholder: string) {
	// Get the last char of a str, if it's a space then remove the space and add the tag to the list
	if (storedTags.includes(editableValue.substring(0, editableValue.length - 1)) || editableValue == ' ') {
		editableValue = "";
	} else if (editableValue[editableValue.length - 1] == ' ') {
		// Check to make sure the word is clean before creating tag
		let tag = editableValue.substring(0, editableValue.length - 1);
		let cleanTag = cleanArray([tag]);

		if (tag == cleanTag[0]) {
			storedTags.push(tag);
			createdTags.push(tag);
			// TODO: don't want to hardcode IDs!
			createTag(storedTags, createdTags, tagsListID, tagInputID, placeholder);
		}

		// Remove the text from the input field
		editableValue = "";
	}

	return editableValue;
}
