<!-- 
CreateRecord.vue -- Creation of provenance record  
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


<template>
    <form enctype="multipart/form-data" class='bg-frost' @submit.prevent="submitForm">
      <h5 class="text-iris">Create New History Record</h5>
      <div>
        <input type="text" class="form-control" name="description" id="provenance-description" v-model="record.description" placeholder="History Description" />
        <!-- <input type="text" class="form-control" name="container-key" id="container-key" v-model="containerKey" placeholder="Container Key (optional)"/> -->
        <!-- <input type="text" class="form-control" name="children-key" id="children-key" v-model="record.children_key" placeholder="Contained Device Keys (optional, separated with a coma)"/> -->
        <!-- <div>
            <span v-for="(childkey1, index) in record.children_key" :key="childkey1">
                {{ childkey1 }}{{ index !== record.children_key.length - 1 && childkey1.endsWith(',') ? ' ' : ''}}
            </span>
        </div> -->
        <div>
            <h5 class="text-iris">Device Image (optional)    </h5>
            <input type="file" class="form-control" accept="*" @change="onFileChange" capture="environment" multiple />
        </div>
        <h5 class="text-iris">Add Tags (optional)</h5>
        <ProvenanceTagInput class="form-control" id="provenanceTag" v-model="record.tags" @updateTags="handleUpdateTags" placeholder="Device tag"/>
        <div>
            <span v-for="(tag, index) in record.tags" :key="tag">{{ tag }}{{ index !== record.tags.length - 1 ? ', ' : '' }} </span>
        </div>
    </div>
    <div class="d-grid" id="submit-button">
        <button-component buttonText="Create History Record" type="submit" />
    </div>
    </form>
</template>

<script lang="ts">
import { postProvenance } from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';
import { ProvenanceRecord } from '~/utils/types';

export default {

    data() {
        return {
            record: new ProvenanceRecord(),
            attachments: [] as File[] | null,
        }
    },
    props: {
        deviceKey: {
            type: String,
            default: "",
            required: true,
        },
        deviceRecord: {
            type: Object, // ProvenanceRecord,//Any, // TODO: add type
            default: new ProvenanceRecord(),
            required: true,
        },
    },
    computed: {
    },
    methods: {
        handleUpdateTags(tags: string[]) {
            this.record.tags = tags;
        },
        onFileChange(e: Event) {
            const target = e.target as HTMLInputElement;
            const files = target.files;
            if (files) {
                this.attachments = Array.from(files);
            }
        },
        refresh() {
            this.record = new ProvenanceRecord();
            this.attachments = null;
        },
        async submitRecord() {
            // const provenance = await getProvenance(this.deviceKey);
            
            // let deviceCreationRecord, deviceRecord, allOtherRecords;
            // ({ deviceCreationRecord, deviceRecord, allOtherRecords } = decomposeProvenance(provenance));
            
            if (this.record.children_key) {
                await addChildKeys(this.deviceKey, this.record.children_key, this.record.description || '', []);
            }

            // await notifyAll(this.record.tags);
           
            try {
                await postProvenance(this.deviceKey,
                    {
                        blobType: 'deviceRecord',
                        description: this.record.description,
                        tags: this.record.tags,
                        children_key: this.record.children_key,
                        hasParent: this.record.hasParent,
                    } as ProvenanceRecord,
                    this.attachments || []
                )
                
                // Refresh CreateRecord component
                this.refresh();

                // Emit an event to notify the Feed.vue component
                EventBus.emit('feedRefresh');
            } catch (error) {
                console.log("Error creating record: ", error);
            }        
        },
        async submitForm() {
            await this.submitRecord()
            // window.location.reload();
        },
    }
};
</script>

<style scoped>
  form {
      border-radius: 6px;
      display: block;
  }
  /* Style for the placeholder text */
    .form-control::placeholder {
    color: gray;
    font-size: 18px;
}

  #submit-button {
      margin-top: 24px;
  }

  input {
    border: 0;
  }

  input[type=text] {
    height: 36px;
    font-size:18px;
  }

  input[type=file] {
    height:36px;
    font-size: 18px;
    line-height: 27px;
  }

  input[type=checkbox] {
    margin-right: 10px;
  }

  #provenanceTag{
    height: 36px;
    border-radius: 6px;
    width: 100%;
    font-size: 18px;
  }

  /*  For screens smaller than 768px */
  @media (max-width: 768px) {
    h5{
        margin-top: 20px;
    }
    input[type=text] {
        margin-top: 12px;
    }
    form {
        padding: 2px 17px 17px 17px;
    }
  }

  /*  For screens larger than 768px */
  @media (min-width: 768px) {
    h5{
        margin-top: 24px;
    }
    input[type=text] {
        margin-top: 16px;
    }
    form {
        padding: 2px 20px 20px 20px;
    }
  }


</style>
