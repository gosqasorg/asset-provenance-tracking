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
