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
  <div>
    <div>Time-based Activitiy</div>
    <div v-if="!isLoading">
    <TimestampList v-bind:timestamppairs="myTimestampPairs"/>
  </div>
  <div v-else>
    Show your prendered data here
  </div>
    <div></div>
    <div></div>
  </div>
    </template>

    <script>
import { useRoute } from 'vue-router'
import { getStatistics} from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';
import { ref, onMounted } from 'vue'
import TimestampList from "@/components/TimestampList.vue";


export default {
    components: {
        TimestampList
    },
    data() {
        return {
            isLoading: true,
            myTimestampPairs: []
        }},

    methods: {
        async fetchData() {
            try {
                const response = await getStatistics();
                return response;
            } catch (error) {
                console.log(error)
            }
        },
    },
    async mounted(){
        const pairs = await this.fetchData();
        if (!pairs) {
            console.log("erorr fetching data");
            return;
        }  else {
            pairs.sort( (a,b) => {
                if (a && b)
                    return (a.timestamp < b.timestamp) ? 1 : -1;
                else
                    return 0;
            });
            this.myTimestampPairs = pairs;
            this.isLoading = false;
        }
    }
}

</script>
