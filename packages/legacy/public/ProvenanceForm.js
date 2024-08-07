// ProvenanceForm.js -- provenance record
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


import html from './html.js';
import TagInput from './TagInput.js'

export default {
    name: `ProvenanceForm`,
    data() {
        return {
            tags: []
        };
    },
    computed: {
        nonEmptyTags() { 
            const tagSet = new Set(this.tags.map(t => t.trim().toLowerCase()).filter(t => t.length > 0));
            return [...tagSet];
        }
    },
    components: { TagInput },
    render() {
        return html`
<form method="POST" class="col-md-8 card p-3 text-bg-secondary" enctype="multipart/form-data">
    <legend>Create New Provenance Record</legend>
    <div class="mb-3">
        <input type="text" class="form-control" name="description" id="provenance-description" placeholder="Provenance Description (optional)" />
        <label for="provenance-tags" class="form-label mt-3" >Tags (will be converted to lower case and duplicates removed)</label>
        <${TagInput} modelValue=${this.tags} name="tags" id="provenance-tags" class="form-control" onUpdateTags=${(value) => { this.tags = value }}/>
        <div class="my-1">${this.nonEmptyTags.map(t => html`<span class="badge bg-info text-dark mx-1">${t}</span>`)}</div>

        <label class="form-label">Children Keys (optional) </label>
        <input type="text" class="form-control" name="children" id="children-keys" />

        <label class="form-label">Container Key (optional) </label>
        <input type="text" class="form-control" name="container" id="container-key" />
        
        <label class="form-label" for="file">Add Image</label>
        <input type="file" class="form-control" accept="image/*" name="picture" capture="environment" />
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>

</form>
`
    }
};