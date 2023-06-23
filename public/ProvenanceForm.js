import html from './html.js';
import TagInput from './TagInput.js'
import { h } from 'https://unpkg.com/vue@3/dist/vue.runtime.esm-browser.js';

export default {
    name: `ProvenanceForm`,
    data() {
        return {
            tags: ['php', 'ruby', 'javascript', "   ", 'python', 'java', 'c#', 'scala', 'closure']
        };
    },
    computed: {
        nonEmptyTags() { return this.tags.filter(v => !!(v.trim())) }
    },
    components: { TagInput },
    render() {
        const input = h(TagInput, {
            class: "form-control",
            modelValue: this.tags,
            onUpdateTags: (value) => { this.tags = value; }
        });
        const pre = h('div', this.nonEmptyTags.map(v => h('span', { class: "badge bg-info text-dark mx-1"},  v)));
        return h('div', null, [ input, pre ])
    }

    // template: `
// <form method="POST" class="col-6">
//     <legend>Create New Provenance Records</legend>
//     <div class="mb-3">
//         <label for="provenance-description" class="form-label">Description</label>
//         <input type="text" class="form-control" name="description" id="provenance-description" required />
//         <label for="provenance-tags" class="form-label" >Tags</label>
//         <TagInput :modelValue=${this.tags} class="form-control" />
//         <pre>${JSON.stringify(this.nonEmptyTags)}</pre>
//     </div>
//     <button type="submit" class="btn btn-primary">Submit</button>
// </form>`,
};