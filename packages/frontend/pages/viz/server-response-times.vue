<!-- server-response-times.vue -- graph of server response times
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
    <div>
        <div class="chart-container">
            <canvas id="serverResponse"></canvas>
        </div>
        <div class="buttons-container">
            <div class="timeRangeLabel"><b>Time Window:</b></div>
            <div class="radio-button">
                <input type="radio" id="oneYear" name="serverResponse" value="oneYear" checked @change=updateServerResponeTimeRange($event.target.value) />
                <label for="oneYear" class="timeRangeButton">One Year</label>
            </div>

            <div class="radio-button">
                <input type="radio" id="sixMonths" name="serverResponse" value="sixMonths" @change=updateServerResponeTimeRange($event.target.value) />
                <label for="sixMonths" class="timeRangeButton">6 Months</label>
            </div>

            <div class="radio-button">
                <input type="radio" id="threeMonths" name="serverResponse" value="threeMonths" @change=updateServerResponeTimeRange($event.target.value) />
                <label for="threeMonths" class="timeRangeButton">3 Months</label>
            </div>

            <div class="radio-button">
                <input type="radio" id="oneMonth" name="serverResponse" value="oneMonth" @change=updateServerResponeTimeRange($event.target.value) />
                <label for="oneMonth" class="timeRangeButton">1 Month</label>
            </div>

            <div class="radio-button">
                <input type="radio" id="oneWeek" name="serverResponse" value="oneWeek" @change=updateServerResponeTimeRange($event.target.value) />
                <label for="oneWeek" class="timeRangeButton">1 Week</label>
            </div>

            <div class="radio-button">
                <input type="radio" id="oneDay" name="serverResponse" value="oneDay" @change=updateServerResponeTimeRange($event.target.value) />
                <label for="oneDay" class="timeRangeButton">1 Day</label>
            </div>
        </div>
    </div>
</template>

<script>
import Chart from 'chart.js/auto';
import { getServerResponseStats } from '~/services/azureFuncs';

export default {
    data() {
        return {
            serverResponseCounts: {
                oneDay: [], oneWeek: [], oneMonth: [], threeMonths: [], sixMonths: [], oneYear: []
            }
        }
    },
    methods: {
        // Fetches data from the backend about server response times
        async fetchData() {
            try {
                this.serverResponseCounts = await getServerResponseStats();
            } catch (error) {
                this.$snackbar.add({ type: 'error', text: `Error Retrieving Server Response Data: ${error}` });
            }
        },
        // Updates the data for the server response graph based on the selected time range
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
        },
        // Updates the graph colors based on if the user is using light or dark mode
        setColorScheme() {
            const chart = Chart.getChart("serverResponse");
            const usingDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (usingDarkMode) {
                // Dark mode
                chart.options.plugins.title.color = "white";
                chart.options.scales.x.title.color = "white";
                chart.options.scales.y.title.color = "white";
                chart.options.scales.x.grid.color = Chart.defaults.color;
                chart.options.scales.y.grid.color = Chart.defaults.color;
                chart.options.scales.x.ticks.color = "white";
                chart.options.scales.y.ticks.color = "white";
                chart.data.datasets[0].backgroundColor = "#CCECFD";
                chart.options.plugins.legend.labels.color = "white";
            } else {
                // Light mode
                chart.options.plugins.title.color = "black";
                chart.options.scales.x.title.color = Chart.defaults.color;
                chart.options.scales.y.title.color = Chart.defaults.color;
                chart.options.scales.x.grid.color = undefined;
                chart.options.scales.y.grid.color = undefined;
                chart.options.scales.x.ticks.color = Chart.defaults.color;
                chart.options.scales.y.ticks.color = Chart.defaults.color;
                chart.data.datasets[0].backgroundColor = '#4e3681';
                chart.options.plugins.legend.labels.color = Chart.defaults.color;
            }

            chart.update();
        },
        graphServerResponseTimes() {
            // Define a MediaQueryList that allows us to detect changes to light/dark mode
            const darkModeMediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

            // Grab the yearly (aka default) server response data
            const yearlyData = this.serverResponseCounts.oneYear;
            const data = {
                labels: yearlyData.map(row => row.time),
                datasets: [{
                    backgroundColor: darkModeMediaQueryList.matches ? '#CCECFD' : '#4e3681',
                    label: 'Requests per response time',
                    data: yearlyData.map(row => row.count)
                }]
            }

            const options = {
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Server Response Times',
                        font: {
                            weight: 'normal',
                            size: 24
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
                            callback: function (tick) {
                                // Skip decimal places on the y-axis
                                if (tick % 1 == 0) {
                                    return tick;
                                }
                            }
                        }
                    }
                }
            }

            // Create a bar chart for the yearly server response times
            new Chart(
                document.getElementById('serverResponse'), {
                    type: 'bar',
                    data: data,
                    options: options
                }
            );

            // Detect if we switch between light/dark mode and update the graph accordingly
            this.setColorScheme();
            darkModeMediaQueryList.addEventListener('change', this.setColorScheme);
        }
    },
    async mounted() {
        // Fetch the server response times data from the backend and graph it
        await this.fetchData();
        this.graphServerResponseTimes();
    },
    beforeUnmount() {
        // Remove light/dark mode event listener
        const darkModeQueryList = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQueryList.removeEventListener('change', this.setColorScheme);
    },
}
</script>

<style>
    .timeRangeButton, .timeRangeLabel {
        padding: 10px;
    }

    .timeRangeLabel {
        color: #4E3681;
    }

    .chart-container {
        display: flex;
        justify-content: center;
        margin: auto;
        height: 60vh;
        width: 70vw;
        padding-top: 20px;
    }

    .buttons-container {
        margin: 10px 80px 20px 80px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    @media(prefers-color-scheme: dark) {
        .timeRangeButton {
            color: white;
        }
        .timeRangeLabel {
            color: #CCECFD;
        }
    }
</style>