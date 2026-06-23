<!-- docs.vue
Copyright (C) 2024 GOSQAS Team
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
const fullSpecUrl = '/GDT-OpenAPI-Spec.yaml'
</script>

<template>
  <div class="container-fluid" id="api-docs-container">

    <h1>API documentation</h1>

    <p>
      OpenAPI Spec <a href="/GDT-OpenAPI-Spec.yaml">here</a>.
    </p>

    <SwaggerUI :spec-url="fullSpecUrl" variant="page" />

    <learn_more />
    
  </div>
</template>


