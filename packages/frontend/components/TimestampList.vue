<!-- TimestampList.vue -- Time Stamp Record
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
  <table class="table table-striped table-hover shadow-sm">
    <thead class="thead-dark">
      <tr>
        <th scope="col">Timestamp</th>
        <th scope="col">Device ID</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(event, i) in timestamppairs" :key="i">
        <td>{{ formatTimestamp(event.timestamp) }}</td>
        <td class="text-monospace">{{ event.deviceID }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { tzDate } from '~/utils/dateUtility'

export default {
  name: 'TimestampList',
  props: {
    timestamppairs: {
      type: Array,
      required: true
    }
  },
  methods: {
    formatTimestamp(ts) {
      return tzDate(String(ts))
    }
  }
}
</script>
