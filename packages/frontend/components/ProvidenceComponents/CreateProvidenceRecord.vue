<template>
  <form enctype="multipart/form-data" @submit="handleSubmit">
    <legend>Create New Provenance Record</legend>
    <div>
      <input type="text" class="form-control" name="description" id="provenance-description" required placeholder="Provenance Description" />
      <label>Tags (will be converted to lower case and duplicates removed)</label>
      <TagInput v-model="tags"/>
      <div>
        <span v-for="tag in nonEmptyTags" :key="tag">{{ tag }}</span>
      </div>
      <label>Add Image</label>
      <input accept="image/*" capture="environment" />
    </div>
    <button type="submit">Submit</button>
  </form>
</template>

<script>
import TagInput from './TagInput.vue';
import { postProvenance } from '~/services/azureFuncs';

export default {
  data() {
    return {
      tags: [],
    };
  },
  computed: {
    nonEmptyTags() {
      const tagSet = new Set(this.tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0));
      return [...tagSet];
    },
  },
  components: { TagInput },
  methods: {
    handleSubmit(event) {
      event.preventDefault();
      postProvenance(); // TODO:Call the postProvenance function with the nonEmptyTags data
    },
  },
};
</script>
