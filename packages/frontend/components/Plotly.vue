<!-- Plotly.vue -- Graphs for the Statistics page
Copyright (C) 2024 GOSQAS
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. -->

<template>
    <div id="plotlyGraph" ref="plotElement"></div>
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
          displayModeBar: false,
          responsive: true
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