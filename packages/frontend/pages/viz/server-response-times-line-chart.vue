<!-- server-response-times-line-chart.vue -- server response time history
Copyright (C) 2026 GOSQAS
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

Align with /frontend/pages/viz/server-response-time.vue
Implemented with assistance from OpenAI Codex. -->

<template>
    <div class="server-response-time" :class="{ embedded }">
        <div class="chart-header">
            <p class="h2 mb-4">Server Response Time</p>
            <p>Average request duration over time. Larger bubbles mean more requests within the selected time window.</p>
            <p>Requests are grouped into {{ selectedRange.intervalLabel }} intervals. Empty intervals are not shown.</p>
        </div>

        <p v-if="loading">Loading server response time data...</p>
        <p v-else-if="error" role="alert">{{ error }}</p>
        <p v-else-if="!points.length">No server response time data is available.</p>
        <div v-else class="response-time-chart-container">
            <canvas
                ref="chartCanvas"
                role="img"
                aria-label="Average server response time over time, with bubble size showing number of requests"
            />
        </div>

        <div class="range-controls" role="group" aria-label="Time window">
            <span class="range-label">Time window</span>
            <div v-for="range in ranges" :key="range.days" class="range-option">
                <input
                    :id="`${radioGroupName}-${range.days}`"
                    type="radio"
                    :name="radioGroupName"
                    :value="range.days"
                    :checked="selectedDays === range.days"
                    @change="updateServerResponseTimeRange(range.days)"
                >
                <label :for="`${radioGroupName}-${range.days}`">{{ range.label }}</label>
            </div>
        </div>

        <p v-if="updatedAt" class="updated-at">Last updated: {{ formattedUpdatedAt }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent, useId } from 'vue';
import Chart from 'chart.js/auto';

interface ResponseTimePoint {
    x: number
    y: number
    requestCount?: number
}

const defaultRange = { label: '1 Week', days: 7, intervalMinutes: 60, intervalLabel: '1 hour' }

export default defineComponent({
    props: {
        embedded: Boolean,
    },
    setup() {
        return { radioGroupName: useId() }
    },
    data() {
        return {
            points: [] as ResponseTimePoint[],
            updatedAt: null as string | null,
            loading: true,
            error: null as string | null,
            selectedDays: 7,
            ranges: [
                { label: '1 Year', days: 365, intervalMinutes: 10080, intervalLabel: '1 week' },
                { label: '6 Months', days: 180, intervalMinutes: 2880, intervalLabel: '2 days' },
                { label: '3 Months', days: 90, intervalMinutes: 1440, intervalLabel: '1 day' },
                { label: '1 Month', days: 30, intervalMinutes: 360, intervalLabel: '6 hours' },
                defaultRange,
                { label: '1 Day', days: 1, intervalMinutes: 10, intervalLabel: '10 minutes' },
            ],
        }
    },
    computed: {
        selectedRange() {
            return this.ranges.find(range => range.days === this.selectedDays) ?? defaultRange
        },
        formattedUpdatedAt(): string {
            return this.updatedAt ? new Date(this.updatedAt).toLocaleString() : ''
        },
    },
    methods: {
        async fetchData(): Promise<void> {
            try {
                const baseUrl = this.$config.public.baseUrl
                const response = await fetch(`${baseUrl}/stats/server-response-time`)
                if (!response.ok) {
                    throw new Error(response.status === 503
                        ? 'Server response time data is not available yet. Try again shortly.'
                        : `Unable to load server response time data (HTTP ${response.status}).`)
                }

                const data = await response.json()
                if (!data || !Array.isArray(data.points)) {
                    throw new Error('Server response time data is in an unexpected format.')
                }
                this.points = data.points
                this.updatedAt = data.updatedAt ?? null
            } catch (error) {
                this.error = error instanceof Error ? error.message : String(error)
            } finally {
                this.loading = false
            }
        },
        updateServerResponseTimeRange(days: number): void {
            this.selectedDays = days
            this.graphServerResponseTimes()
        },
        getGroupedPoints(start: number, end: number): ResponseTimePoint[] {
            const interval = this.selectedRange.intervalMinutes * 60 * 1000
            const groups = new Map<number, ResponseTimePoint[]>()

            for (const point of this.points) {
                if (!Number.isFinite(point.x) || !Number.isFinite(point.y)
                    || point.x < start || point.x > end) continue
                const time = Math.floor(point.x / interval) * interval
                const group = groups.get(time) ?? []
                group.push(point)
                groups.set(time, group)
            }

            return Array.from(groups, ([time, group]) => {
                let totalDuration = 0
                let weightedDuration = 0
                let requestCount = 0
                let hasCounts = true

                for (const point of group) {
                    totalDuration += point.y
                    const count = point.requestCount
                    if (count === undefined || !Number.isFinite(count) || count < 0) {
                        hasCounts = false
                    } else {
                        weightedDuration += point.y * count
                        requestCount += count
                    }
                }

                // Missing counts require a simple average and no bubble.
                return {
                    x: Math.max(time, start),
                    y: hasCounts && requestCount > 0
                        ? weightedDuration / requestCount
                        : totalDuration / group.length,
                    requestCount: hasCounts ? requestCount : undefined,
                }
            }).sort((a, b) => a.x - b.x)
        },
        graphServerResponseTimes(): void {
            const canvas = this.$refs.chartCanvas as HTMLCanvasElement | undefined
            if (!canvas) return

            const end = Date.now()
            const start = end - this.selectedDays * 24 * 60 * 60 * 1000
            const points = this.getGroupedPoints(start, end)
            const maxCount = points.reduce((max, point) => Math.max(max, point.requestCount ?? 0), 1)
            const bubbles = points.flatMap(point => {
                if (point.requestCount === undefined || point.requestCount <= 0) return []
                // Square-root scaling keeps bubbles within 2–10 pixels.
                const r = 2 + 8 * Math.sqrt(point.requestCount / maxCount)
                return [{ ...point, r }]
            })
            const tickFormat: Intl.DateTimeFormatOptions = this.selectedDays === 1
                ? { hour: 'numeric', minute: '2-digit' }
                : { month: 'short', day: 'numeric' }
            const maxTicks = this.selectedDays === 7 ? 8 : 13

            this.destroyChart()
            new Chart<'line' | 'bubble', ResponseTimePoint[]>(canvas, {
                type: 'line',
                data: {
                    datasets: [{
                        type: 'line',
                        label: 'Average response time',
                        data: points,
                        borderColor: '#4E3681',
                        backgroundColor: '#4E3681',
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        tension: 0,
                        order: 0,
                    }, {
                        type: 'bubble',
                        label: 'Number of requests',
                        data: bubbles,
                        backgroundColor: 'rgba(140, 114, 201, 0.18)',
                        borderColor: 'rgba(140, 114, 201, 0.65)',
                        borderWidth: 1,
                        order: 1,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    layout: { padding: 12 },
                    interaction: { intersect: false, mode: 'nearest', axis: 'x' },
                    scales: {
                        x: {
                            type: 'linear',
                            min: start,
                            max: end,
                            afterBuildTicks: axis => {
                                const count = Math.min(maxTicks, Math.max(3, Math.floor(axis.width / 85) + 1))
                                axis.ticks = Array.from({ length: count }, (_, index) => ({
                                    value: axis.min + (axis.max - axis.min) * index / (count - 1),
                                }))
                            },
                            title: { display: true, text: 'Date / time (local)' },
                            ticks: {
                                autoSkip: false,
                                maxRotation: 0,
                                callback: value => new Date(Number(value)).toLocaleString(undefined, tickFormat),
                            },
                        },
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Average response time (ms)' },
                        },
                    },
                    plugins: {
                        tooltip: {
                            // Avoid duplicate tooltips from the line and bubbles.
                            filter: item => item.datasetIndex === (item.chart.isDatasetVisible(0) ? 0 : 1),
                            callbacks: {
                                title: items => {
                                    const item = items[0]
                                    if (!item) return ''
                                    const point = item.raw as ResponseTimePoint
                                    return new Date(point.x).toLocaleString()
                                },
                                label: item => {
                                    const point = item.raw as ResponseTimePoint
                                    const labels = [`Average response time: ${point.y.toFixed(2)} ms`]
                                    if (point.requestCount !== undefined) {
                                        labels.push(`Number of requests: ${point.requestCount.toLocaleString()}`)
                                    }
                                    return labels
                                },
                            },
                        },
                    },
                },
            })
        },
        destroyChart(): void {
            const canvas = this.$refs.chartCanvas as HTMLCanvasElement | undefined
            if (canvas) Chart.getChart(canvas)?.destroy()
        },
    },
    async mounted() {
        await this.fetchData()
        // The canvas mounts after loading finishes.
        await this.$nextTick()
        this.graphServerResponseTimes()
    },
    beforeUnmount() {
        this.destroyChart()
    },
})
</script>

<style scoped>
.server-response-time {
    --gutter: clamp(16px, 3vw, 48px);

    width: 100%;
    box-sizing: border-box;
    padding: 24px var(--gutter);
}

.server-response-time.embedded {
    padding-inline: 0;
}

.chart-header {
    text-align: left;
    margin-bottom: 24px;
}

.chart-header p,
.updated-at {
    margin: 0;
}

.response-time-chart-container {
    position: relative;
    height: 360px;
}

.server-response-time.embedded .response-time-chart-container {
    margin-inline: var(--gutter);
}

.range-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 16px;
    margin-top: 24px;
}

.range-label {
    margin-right: 8px;
}

.range-option {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
}

.updated-at {
    margin-top: 12px;
    font-size: 14px;
}
</style>
