<!--
Feed.vue -- Display the feed of reports for a record
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

<!--
    This component is used to display the feed of reports for a record.
    It is used in the providence/[deviceKey].vue page.
-->
<template>
    <div :class="{'dimming': isDimming}" class="page">
        <div @click="toggleDimming" v-for="(report, index) in provenance" class="report-box">
            <template v-if="report.record.blobType === 'deviceInitializer'">
                <h3 id = "createdDevicePoint">Created Record: {{ report.record.deviceName }}</h3>
            </template>

            <div style="font-size: small; font-family: 'Poppins', sans-serif; font-weight: 500; font-size: 12px; line-height: 30px; color: #1E2019;">
            {{ new Date(report.timestamp) }}
            </div>
            <div style="font-family: 'Poppins', sans-serif; font-weight: 400; font-size: 20px; line-height: 30px;">
                <span v-html="clickableLink(report.record?.description)"></span>
            </div>
            <div class="mb-1 tag-container">
                <span class="tag" v-for="tag in report.record.tags" v-bind:style="'color: '+textColorForTag(tag)+'; background-color: '+getColorForTag(tag)+';'">
                {{tag}}</span>
            </div>
            
            
            <div v-for="(attachment, i) in attachmentURLs[index.toString()]" :key="i">
                <!-- Image -->
                <img :src="attachment.url" :alt="Image" style="width: 150px; padding: 5px;" data-bs-toggle="modal" data-bs-target="#imageModal" @click="modalImage = attachment.url">
                <a :href="attachment.url" :download="attachment.fileName" style="display: block; padding: 5px; text-align: left;">
                    Download File
                </a>
            </div>
            

        </div>
    </div>
        <!-- The Modal to Enlarge Image -->
        <div class="modal fade" id="imageModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                 <div class="modal-content">
                        <img v-bind:src="modalImage" alt="Image" class="img-fluid">
                </div>
            </div>
        </div>
</template>

<script>
import { getAttachment } from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';
import { textColorForTag, getColorForTag } from '~/utils/colorTag';


export default {
    props: {
        recordKey: {
            type: String,
            default: "",
        },
        provenance: {
            default: null,
        },
    },
    data() {
        return {
            attachmentURLs: {},
            modalImage: "",
            isDimming: false,
        };
    },
    mounted() {
        this.refreshPage();
    },
    beforeDestroy() {
        EventBus.off('feedRefresh', this.refreshPage);
    },
    methods: {
        async fetchAttachmentsForReport(report, index) {
            try {
                if (report.attachments.length > 0) {
                    const baseUrl = useRuntimeConfig().public.baseUrl;
                    const attachmentPromises = report.attachments.map(attachmentID => getAttachment(baseUrl,this.recordKey, attachmentID));
                    const attachments = await Promise.all(attachmentPromises);

                    // Create object URLs for attachments and include filenames
                    const urls = attachments.map(attachment => ({
                        url: URL.createObjectURL(attachment.blob),
                        fileName: attachment.fileName
                    }));

                    this.attachmentURLs[index.toString()] = urls;
                }
            } catch (error) {
                console.error('Error occurred during getAttachment request:', error);
            }
        },
        refreshPage() {
            // set attachmentURLs to empty object to clear out old attachment URLs
            this.attachmentURLs = {};
            this.provenance.forEach((report, index) => this.fetchAttachmentsForReport(report, index));
        },
        toggleDimming() {
            this.isDimming = !this.isDimming;
            if (this.isDimming) {
                document.body.classList.add("dimming");
            } else {
                document.body.classList.remove("dimming");
            }
        }
    },
};
</script>

<style scoped>
.report-box {
  background-color: #F1F5F9;
  padding: 20px;
  margin-bottom: 14px;
  border-radius: 20px;
  width: 70%; /* Assuming the width is to fill the container */
  word-wrap: break-word;

}
.tag-container {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  background-color: #f2f2f2;
  color: #333;
  padding: 5px 10px;
  margin: 5px;
  border-radius: 5px;
  font-size: 14px;
}
.dimming {
    animation: dimming 2s forwards; /* Apply the dimming animation globally */
}

/* Dimmed state */
@keyframes dimming {
    0% {
        filter: brightness(100%);
    }
    100% {
        filter: brightness(50%); /* Dim the page */
    }
}
</style>
    