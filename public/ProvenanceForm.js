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

        <label class="form-label">Parent Key (optional) </label>
        <input type="text" class="form-control" name="parent" id="parent-key" />
        
        <label class="form-label" for="file">Add Image</label>
        <input type="file" class="form-control" accept="image/*" name="picture" capture="environment" />
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>

</form>
`
    }
};