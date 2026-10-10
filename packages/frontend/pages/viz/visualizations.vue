<!-- visualizations.vue -- data visualization graphs
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
    <!-- TODO LATER: need to style for all screen sizes -->
    <div style="width: 800px;"><canvas id="acquisitions"></canvas></div>
</template>

<script> // todo do we need typescript here..?
// TODO LATER: Should I make a component for Chart.js graphs (same as Plotly.vue, but with vue-chartjs)?
import Chart from 'chart.js/auto'; // todo: see example, prevents tree shaking but the work around is a lot of code lines...
import { getServerResponse } from '~/services/azureFuncs';

export default {
    methods: {
        // Fetches data from the backend about server response times
        async fetchData() {
            try {
                return await getServerResponse();
            } catch (error) {
                // Show error via your snackbar utility
                this.$snackbar.add({ type: 'error', text: `Error: ${error}` })
                return []
            }
        }
    },
    async mounted() {
        // Define the data
        const counts = await this.fetchData();
        const data = counts.oneWeek;

        console.log("need this:", counts, JSON.stringify(counts.oneWeek));
        console.log("in this format: { time: '1sec-3sec', count: 2 }");
        console.log("OR this format: ['1sec-3sec', ...], [2, ...] ");

        // *TODO: now we need buttons (radio?) that let us switch out the data
        // TODO: Then change the colors to match GOSQAS (and dark mode if possible)
        // Create a chart for server response times
        new Chart(
            document.getElementById('acquisitions'), {
            type: 'bar',
            data: {
                labels: data.map(row => row.time),
                datasets: [{
                    label: 'Acquisitions by year',
                    data: data.map(row => row.count)
                }]
            }}
        );
    }
}
    
</script>