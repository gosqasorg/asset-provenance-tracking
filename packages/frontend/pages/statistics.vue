<!-- statistics.vue -- statistics
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
  <div class="container mt-5">
    <h2 class="mb-4">Time-based Activity</h2>

    <!-- Summary Cards -->
    <div class="row mb-4">
      <div class="col-md-6 mb-3">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Today’s Provenances</h5>
            <p class="display-4">{{ summary.today }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-6 mb-3">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <h5 class="card-title">This Week’s Provenances</h5>
            <p class="display-4">{{ summary.thisWeek }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <!-- Timestamp Table -->
    <div v-else>
      <TimestampList :timestamppairs="myTimestampPairs" />
    </div>
  </div>
</template>

<script>
import TimestampList from '@/components/TimestampList.vue'
import { getStatistics } from '~/services/azureFuncs'

export default {
  components: { TimestampList },
  data() {
    return {
      isLoading: true,
      myTimestampPairs: [],
      summary: { today: 0, thisWeek: 0 }
    }
  },

  async mounted() {
    // 1) Fetch & sort
    const pairs = await this.fetchData()
    pairs.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    this.myTimestampPairs = pairs

    // 2) Compute summaries
    this.calculateSummary(pairs)

    this.isLoading = false
  },

  methods: {
    async fetchData() {
      try {
        return await getStatistics()
      } catch (e) {
        console.error('Error fetching data:', e)
        this.$snackbar.add({ type: 'error', text: 'Failed to load statistics.' })
        return []
      }
    },

    calculateSummary(pairs) {
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())

      this.summary.today = pairs.filter(p => new Date(p.timestamp) >= startOfToday).length
      this.summary.thisWeek = pairs.filter(p => new Date(p.timestamp) >= startOfWeek).length
    }
  }
}
</script>
