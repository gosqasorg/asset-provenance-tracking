<!-- visualizations.vue -- workbench for evaluating data visualizations
Copyright (C) 2026 GOSQAS
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

<script setup lang="ts">
import HeatmapVisualization from '~/pages/heatmap.vue'
import UserAgentVisualization from '~/pages/dev/user-agents.vue'

const environment = ((useRuntimeConfig().public.baseUrl).includes("prod")) ? 'prod' : 'dev'
const visualizationsFeatureFlag = environment === 'dev'
</script>

<template>
    <div v-if="visualizationsFeatureFlag" class="container-fluid" id="visualizations-container">
        <h1>Visualizations</h1>

        <section class="visualization-section">
            <h2>Usage of the Web App</h2>
            <div class="row">
                <p>Visualizations in this category will be added as they are produced.</p>
            </div>
        </section>

        <section class="visualization-section">
            <h2>Usage of the Backend</h2>
            <div class="row">
                <HeatmapVisualization />
            </div>
            <div class="container py-4 user-agent-instance">
                <UserAgentVisualization />
            </div>
        </section>

        <section class="visualization-section">
            <h2>Usage of the API</h2>
            <div class="row">
                <p>Visualizations in this category will be added as they are produced.</p>
            </div>
        </section>

        <section class="visualization-section">
            <h2>Usage Relevant to Security</h2>
            <div class="row">
                <p>Visualizations in this category will be added as they are produced.</p>
            </div>
        </section>

        <section class="visualization-section">
            <h2>Usage Relevant to Multiple Categories</h2>
            <div class="row">
                <p>Visualizations in this category will be added as they are produced.</p>
            </div>
        </section>
    </div>
</template>

<style scoped>
.user-agent-instance :deep(.stat-page) {
    margin-inline: 0;
    padding-inline: 0;
}

/* For screens smaller than 768px */
@media (max-width: 768px) {
    #visualizations-container {
        padding: 20px 20px 40px 20px;
    }
    .row {
        margin-top: 20px;
    }
    .visualization-section {
        margin-top: 40px;
    }
}

/* For screens larger than 768px */
@media (min-width: 768px) {
    #visualizations-container {
        padding: 80px 200px 100px 200px;
    }
    .row {
        margin-top: 32px;
    }
    .visualization-section {
        margin-top: 64px;
    }
}

/* Dark mode version */
@media (prefers-color-scheme: dark) {
    #visualizations-container {
        background-color: #1E2019;
    }
    h1, h2 {
        color: #CCECFD;
    }
    p {
        color: #FFFFFF;
    }
}

/* Light mode version */
@media (prefers-color-scheme: light) {
    #visualizations-container {
        background-color: #FFFFFF;
    }
    h1, h2 {
        color: #4E3681;
    }
    p {
        color: #1E2019;
    }
}
</style>
