<!-- TODO: should render out plotly chart when imported into a page file -->
 <!-- https://www.explo.co/chart-library-tutorials/plotly-js-vue-js-tutorial -->

<template>
    <div ref="plotElement"></div>
</template>
   
<script>
   import Plotly from 'plotly.js-dist'
   
   export default {
    name: 'PlotlyChart',
    props: {
      data: Array,
      layout: Object
    },
    mounted() {
      this.renderChart();
    },
    methods: {
      renderChart() {
        var config = {
          displayModeBar: false
        };

        Plotly.newPlot(this.$refs.plotElement, this.data, this.layout, config);
      }
    },
    watch: {
      data: 'renderChart',
      layout: 'renderChart'
    }
   }
</script>