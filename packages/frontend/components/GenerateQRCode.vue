<!-- 
    Generates a QR code for the device based on the device key.
    
    Learn more about the QR Code Library here: https://www.npmjs.com/package/qrcode-vue3 
-->

<template>
    <div>
        
     <QRCodeVue3
            :value="`http://localhost:3001/provenance/${deviceKey}`"
            :download="true"
            
            downloadButton="my-button"
            :downloadOptions="{ name: 'vqr', extension: 'png' }"
          />
          
    </div>
</template>
  <style>
button.my-button{
    border-width: 0px;
    padding: 10px;
    border-radius: 10px;
    background-color:#ccecfd;
    padding-left: 13px;
    padding-right: 13px;
    color: black;
    float: inline-start;
    font-weight: 100;
}
button.viewRecordsButton{
    margin-left: 10px;
    border-width: 0px;
    padding: 10px;
    border-radius: 10px;
    background-color:#4e3681;
    padding-left: 13px;
    padding-right: 13px;
    color: white;
    font-weight: 100;
}
</style>
<script>
    import QRCodeVue3 from "qrcode-vue3";
  
    export default {
        components: {
            QRCodeVue3
        },
        props: {
            deviceKey: {
            type: String,
            required: true,
            },
        },
    }
</script>