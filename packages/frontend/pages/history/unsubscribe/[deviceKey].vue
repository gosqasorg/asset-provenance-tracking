<!-- unsubscribe.vue
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
<!--
    This is the Unsubscribe page for GOSQAS
-->
<template>
    <div class="unsubscribe-container">
        <h1 class="unsubscribe-title">Unsubscribe successful</h1>
        <p class="unsubscribe-description">
            You’ve been unsubscribed from record {{ deviceKey }}.
        </p>
        <div class="unsubscribe-buttons">
            <!-- Note: Currently links back to the history/[deviceKey].vue page -->
            <RouterLink :to="`/history/${deviceKey}`" class="btn btn-primary unsubscribe-button">Resubscribe</RouterLink>
        </div>
    </div>
</template>


<script lang="ts">
export default {
    data() {
      return {
        deviceKey: ""
      }
    },
    async mounted() {
        try {
            const route = useRoute();
            this.deviceKey = route.params.deviceKey as string;
        } catch (error) {
            console.log(error)
        }
    }
};
</script>


<style scoped>
.unsubscribe-container {
  text-align: center;
  margin: 200px auto;
  max-width: 700px;
  padding: 20px;
}

.unsubscribe-title {
  text-align: left;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 48px;
  line-height: 150%;
  margin-bottom: 10px;
  color: #322253;
  text-align: left;
}

.unsubscribe-description {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  font-size: 20px;
  line-height: 30px;
  margin-bottom: 30px;
  color: #1E2019;
  text-align: left;
}

.unsubscribe-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
}

.unsubscribe-button {
  width: 100% !important;
}

.btn {
  height: 66px;
  padding: 18px 22px;
  /*     margin: 5px;*/
  border-radius: 10px;
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 400;
  text-align: center;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #4E3681;
  color: #FFFFFF;
}

.btn-primary:hover {
  background-color: #322253;
}

@media (max-width: 608px) {
  .unsubscribe-container {
    margin: 20px auto;
  }
}

@media (prefers-color-scheme: dark) {
  .unsubscribe-description {
    color: white;
  }

  .unsubscribe-title {
    color: #ccecfd;
  }

  .btn-primary {
    background-color: #CCECFD;
    color: #1E2019;
  }

  .btn-primary:hover {
    background-color: #e6f6ff;
  }
}
</style>