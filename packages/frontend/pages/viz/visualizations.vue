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
    <!-- Server Response Time Graph -->
    <div style="width: 800px;">
        <canvas id="serverResponse"></canvas>
        <div>
            <input type="radio" id="oneYear" name="serverResponse" value="oneYear" checked @change=updateServerResponeTimeRange($event.target.value) />
            <label for="oneYear" class="timeRangeButton">One Year</label>

            <input type="radio" id="sixMonths" name="serverResponse" value="sixMonths" @change=updateServerResponeTimeRange($event.target.value) />
            <label for="sixMonths" class="timeRangeButton">6 Months</label>

            <input type="radio" id="threeMonths" name="serverResponse" value="threeMonths" @change=updateServerResponeTimeRange($event.target.value) />
            <label for="threeMonths" class="timeRangeButton">3 Months</label>

            <input type="radio" id="oneMonth" name="serverResponse" value="oneMonth" @change=updateServerResponeTimeRange($event.target.value) />
            <label for="oneMonth" class="timeRangeButton">1 Months</label>

            <input type="radio" id="oneWeek" name="serverResponse" value="oneWeek" @change=updateServerResponeTimeRange($event.target.value) />
            <label for="oneWeek" class="timeRangeButton">1 Week</label>

            <input type="radio" id="oneDay" name="serverResponse" value="oneDay" @change=updateServerResponeTimeRange($event.target.value) />
            <label for="oneDay" class="timeRangeButton">1 Day</label>
        </div>
    </div>
</template>

<script> // todo do we need typescript here..?
// TODO LATER: Should I make a component for Chart.js graphs (same as Plotly.vue, but with vue-chartjs)?
import Chart from 'chart.js/auto';
import { getServerResponse } from '~/services/azureFuncs';

export default {
    data() {
        return {
            serverResponseCounts: {}
        }
    },
    methods: {
        // Fetches data from the backend about server response times
        async fetchData() {
            try {
                return await getServerResponse();
            } catch (error) {
                this.$snackbar.add({ type: 'error', text: `Error: ${error}` });
                return [];
            }
        },
        // Updates the time range for the Server Response graph
        async updateServerResponeTimeRange(value) {
            const chart = Chart.getChart("serverResponse");
            let data = this.serverResponseCounts.oneYear;

            switch(value) {
                case "sixMonths":
                    data = this.serverResponseCounts.sixMonths;
                    break;
                case "threeMonths":
                    data = this.serverResponseCounts.threeMonths;
                    break;
                case "oneMonth":
                    data = this.serverResponseCounts.oneMonth;
                    break;
                case "oneWeek":
                    data = this.serverResponseCounts.oneWeek;
                    break;
                case "oneDay":
                    data = this.serverResponseCounts.oneDay;
                    break;
            }

            chart.config.data.labels = data.map(row => row.time)
            chart.config.data.datasets[0].data = data.map(row => row.count)
            chart.update();
        }
    },
    async mounted() {
        // Define the data
        this.serverResponseCounts = await this.fetchData();
        const data = this.serverResponseCounts.oneYear;

        // TODO: Add dark mode if feasible
        const yearlyData = {
            labels: data.map(row => row.time),
            datasets: [{
                backgroundColor: '#4e3681',
                label: 'Requests per response time', // todo make better? (change depending on response time?)
                data: data.map(row => row.count)
            }]
        }

        // Create a chart for server response times
        new Chart(
            document.getElementById('serverResponse'), {
            type: 'bar',
            data: yearlyData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Server Response Times',
                        color: 'black',
                        font: {
                            weight: 'normal',
                            size: 18
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Server Response Time'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Number of Requests'
                        },
                        ticks: {
                            callback: function (value) {
                                // Skip decimal places on the y-axis
                                if (value % 1 == 0) {
                                    return value;
                                }
                            }
                        }
                    }
                }
            }
            }
        );
    }
}
    
</script>

<style>
    .timeRangeButton {
        padding: 10px;
    }

    #oneYear {
        margin-left: 57px;
    }
</style>