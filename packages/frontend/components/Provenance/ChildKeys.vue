<!-- Copyright (C) 2024 GOSQAS 
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
        <div v-if="hasReportingKey"> Reporting Key:
            <div> <a :href="`/provenance/${deviceRecord?.reportingKey}`">{{deviceRecord?.reportingKey}}</a></div>
        </div>
        <div v-if="(deviceRecord.children_key.length > 0) || hasReportingKey ">
            <div> Child Keys:
                <div> <KeyList v-bind:keys="deviceRecord.children_key"/> </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isGroup: false,
        };
    },
    computed: {
        hasReportingKey() {
            return this.deviceRecord && this.deviceRecord.reportingKey;
        }
    },
    props: {
        deviceRecord: {
            // type: ProvenanceRecord,//Any, // TODO: add type
            default: new ProvenanceRecord(),
            required: true,
        },
    },
    methods: {
    }
};
</script>

<style>

</style>