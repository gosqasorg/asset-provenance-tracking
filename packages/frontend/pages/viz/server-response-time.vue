<!-- server-response-time.vue -- server response time history
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

Implemented with assistance from OpenAI Codex. -->

<template>
    <div class="server-response-time" :class="{ embedded }">
        <div class="chart-header">
            <p class="h2 mb-4">Server Response Time</p>
            <p>Average request duration over time. Larger bubbles mean more requests within the selected time window.</p>
            <p>Requests are grouped into {{ displayRange.intervalLabel }} intervals. Empty intervals are not shown.</p>
        </div>

        <p v-if="loading">Loading server response time data...</p>
        <p v-else-if="error" role="alert">{{ error }}</p>
        <p v-else-if="!points.length">No server response time data is available.</p>
        <div v-else class="chart-container">
            <canvas ref="chartCanvas" role="img" aria-label="Average server response time over time, with bubble size showing number of requests"></canvas>
        </div>

        <div class="range-controls" role="group" aria-label="Time window">
            <span class="range-label">Time window</span>
            <label
                v-for="range in ranges"
                :key="range.days"
                class="range-option"
            >
                <input
                    type="radio"
                    name="server-response-time-range"
                    :value="range.days"
                    :checked="selectedRange === range.days"
                    @change="selectRange(range.days)"
                >
                {{ range.label }}
            </label>
        </div>

        <p v-if="updatedAt" class="updated-at">Last updated: {{ formattedUpdatedAt }}</p>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Chart, BubbleController, LineController, LineElement, LinearScale, PointElement, Tooltip, Legend } from 'chart.js'

Chart.register(BubbleController, LineController, LineElement, LinearScale, PointElement, Tooltip, Legend)

defineProps<{
    embedded?: boolean;
}>()

interface ResponseTimePoint {
    x: number;
    y: number;
    requestCount?: number;
}

interface ServerResponseTime {
    points: ResponseTimePoint[];
    updatedAt: string;
}

const ranges = [
    { label: '1 Year', days: 365, intervalMinutes: 10080, intervalLabel: '1 week' },
    { label: '6 Months', days: 180, intervalMinutes: 2880, intervalLabel: '2 days' },
    { label: '3 Months', days: 90, intervalMinutes: 1440, intervalLabel: '1 day' },
    { label: '1 Month', days: 30, intervalMinutes: 360, intervalLabel: '6 hours' },
    { label: '1 Week', days: 7, intervalMinutes: 60, intervalLabel: '1 hour' },
    { label: '1 Day', days: 1, intervalMinutes: 10, intervalLabel: '10 minutes' },
]

const chartCanvas = ref<HTMLCanvasElement | null>(null)
const points = ref<ResponseTimePoint[]>([])
const updatedAt = ref<string | null>(null)
const displayRange = ref(ranges[4])
const selectedRange = computed(() => displayRange.value.days)
const loading = ref(true)
const error = ref<string | null>(null)
let chart: Chart<'line' | 'bubble', ResponseTimePoint[]> | null = null

const formattedUpdatedAt = computed(() => {
    return updatedAt.value ? new Date(updatedAt.value).toLocaleString() : ''
})

function getVisiblePoints(start: number, end: number): ResponseTimePoint[] {
    const interval = displayRange.value.intervalMinutes * 60 * 1000
    const groups = new Map<number, ResponseTimePoint[]>()

    for (const point of points.value) {
        if (point.x < start || point.x > end) continue
        const bucket = Math.floor(point.x / interval) * interval
        const group = groups.get(bucket) ?? []
        group.push(point)
        groups.set(bucket, group)
    }

    return Array.from(groups, ([bucket, group]) => {
        const hasCounts = group.every(point => point.requestCount !== undefined
            && Number.isFinite(point.requestCount) && point.requestCount >= 0)
        const requestCount = hasCounts
            ? group.reduce((total, point) => total + point.requestCount!, 0)
            : undefined
        // Without complete counts, use a simple average and omit the bubble.
        const y = requestCount !== undefined && requestCount > 0
            ? group.reduce((total, point) => total + point.y * point.requestCount!, 0) / requestCount
            : group.reduce((total, point) => total + point.y, 0) / group.length

        return { x: Math.max(bucket, start), y, requestCount }
    }).sort((a, b) => a.x - b.x)
}

function getBubbleRadius(requestCount: number, maxCount: number): number {
    if (requestCount === 0) return 0
    // Keep small counts visible while giving every larger count a larger radius.
    // Sizes are relative to the largest count in the selected time window.
    return 2 + 8 * Math.sqrt(requestCount / maxCount)
}

function formatTime(value: number): string {
    const options: Intl.DateTimeFormatOptions = selectedRange.value === 1
        ? { hour: 'numeric', minute: '2-digit' }
        : { month: 'short', day: 'numeric' }

    return new Date(value).toLocaleString(undefined, options)
}

function selectRange(days: number): void {
    const range = ranges.find(range => range.days === days)
    if (!range) return
    displayRange.value = range
    buildChart()
}

function buildChart(): void {
    if (!chartCanvas.value) return

    const end = Date.now()
    const start = end - selectedRange.value * 24 * 60 * 60 * 1000
    const visiblePoints = getVisiblePoints(start, end)
    const maxCount = visiblePoints.reduce((max, point) => Math.max(max, point.requestCount ?? 0), 1)
    const bubbles = visiblePoints
        .filter(point => point.requestCount !== undefined && Number.isFinite(point.requestCount) && point.requestCount > 0)
        .map(point => ({ ...point, r: getBubbleRadius(point.requestCount!, maxCount) }))

    chart?.destroy()
    chart = new Chart<'line' | 'bubble', ResponseTimePoint[]>(chartCanvas.value, {
        type: 'line',
        data: {
            datasets: [{
                type: 'line',
                label: 'Average response time',
                data: visiblePoints,
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
            layout: {
                padding: 12,
            },
            interaction: {
                intersect: false,
                mode: 'nearest',
                axis: 'x',
            },
            scales: {
                x: {
                    type: 'linear',
                    min: start,
                    max: end,
                    title: {
                        display: true,
                        text: 'Date / time (local)',
                    },
                    ticks: {
                        stepSize: selectedRange.value <= 7 ? (selectedRange.value === 1 ? 4 : 24) * 60 * 60 * 1000 : undefined,
                        maxRotation: 0,
                        maxTicksLimit: 8,
                        callback: value => formatTime(Number(value)),
                    },
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Average response time (ms)',
                    },
                },
            },
            plugins: {
                tooltip: {
                    // Use bubble tooltips when the legend has hidden the line.
                    filter: item => item.datasetIndex === (chart?.isDatasetVisible(0) ? 0 : 1),
                    callbacks: {
                        title: items => new Date(items[0].parsed.x).toLocaleString(),
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
}

async function fetchData(): Promise<void> {
    loading.value = true
    error.value = null

    try {
        const baseUrl = useRuntimeConfig().public.baseUrl
        const response = await fetch(`${baseUrl}/stats/server-response-time`)

        if (!response.ok) {
            throw new Error('Server response time data is not available yet.')
        }

        const data = await response.json() as ServerResponseTime
        points.value = data.points
        updatedAt.value = data.updatedAt
    } catch (caughtError) {
        error.value = caughtError instanceof Error ? caughtError.message : String(caughtError)
    } finally {
        loading.value = false
    }

    await nextTick()
    buildChart()
}

onMounted(fetchData)
onBeforeUnmount(() => chart?.destroy())
</script>

<style scoped>
.server-response-time {
    width: 100%;
    box-sizing: border-box;
    padding: 24px clamp(16px, 3vw, 48px);
}

.chart-header {
    text-align: left;
    margin-bottom: 24px;
}

.chart-header p,
.updated-at {
    margin: 0;
}

.range-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
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

.chart-container {
    position: relative;
    height: 360px;
}

.server-response-time.embedded {
    padding-right: 0;
    padding-left: 0;
}

.server-response-time.embedded .chart-container {
    margin-right: clamp(16px, 3vw, 48px);
    margin-left: clamp(16px, 3vw, 48px);
}

.updated-at {
    margin-top: 12px;
    font-size: 14px;
}

</style>
