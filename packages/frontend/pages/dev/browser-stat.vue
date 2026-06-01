 <template>
  <div>
    <button @click="fetch">Fetch</button>
    <pre>{{ result }}</pre>
  </div>
</template>

<script>
export default {
  data() {
    return { result: null };
  },
  methods: {
    async fetch() {
      const baseUrl = useRuntimeConfig().public.baseUrl;
      const res = await fetch(baseUrl + "/stats/browsers");
      this.result = await res.json();
    }
  }   
}
</script>