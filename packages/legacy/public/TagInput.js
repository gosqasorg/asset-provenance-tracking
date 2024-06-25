// TagInput.js -- Updating Tags
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


import { h } from 'https://unpkg.com/vue@3/dist/vue.runtime.esm-browser.js';

export default {
    name: 'TagInput',
    props: {
        'modelValue': {
            type: Array,
            default: () => [],
        },
        'separator': {
            type: String,
            default: ' ',
        }
    },
    emits: ['updateTags'],
    data() {
        return {
            tags: this.modelValue,
        };
    },
    computed: {
        editableValue: {
            get() {
                return this.tags.join(this.separator);
            },
            set(value) {
                const $value = value.trim() ? value.split(this.separator) : [];
                this.tags = $value;
                this.$emit('updateTags', $value);
            }
        }
    },
    render() {
        return h("input", {
            value: this.editableValue,
            onInput: (e) => {
                return this.editableValue = e.target.value;
            },
        })
    }
}
