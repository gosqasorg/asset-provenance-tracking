<!--Button Component-->
<template>
    <button class="baseButton" :style="styles">{{ buttonText }}</button>
</template>
 
 
<script>
export default {
    props: {
        // Sets button text
        buttonText: { type: String, default: () => "Submit" },

        // Sets button style
        backgroundColor: { type: String, default: () => "#4e3681" },
        color: { type: String, default: () => "white" }, // text color
        border: { type: [String, Number], default: 2 }, // set to same color as background to remove
        borderColor: { type: String, default: "#4e3681"},

        // Sizing (some still done in div)
        padding: { type: [String, Number], default: "10px 20px"},
        margin: { type: [String, Number], default: "0px 0px 0px 0px"}
    },
    computed: {
        styles() {
            return {
                borderWidth: this._border,
                borderColor: this.borderColor,
                backgroundColor: this.backgroundColor,
                color: this.color,
                padding: this._padding,
                margin: this._margin
            }
        },
        _border() {
            if (this.isNumeric(this.border)) { return this.border + "px"; }
            return this.border;
        },
        _padding() {
            if (this.isNumeric(this.padding)) { return this.padding + "px"; }
            return this.padding;
        },
        _margin() {
            if (this.isNumeric(this.margin)) { return this.margin + "px"; }
            return this.margin;
        }
    },
    methods: {
        isNumeric(value) {
            return /^\d+$/.test(value);
        }
    }
}
</script> 


<style scoped>
/* Default Sizing for Buttons */
.baseButton {
    font-size: 22px;
    font-weight: 350;

    border-radius: 10px;
    border-style: solid;
}

@media (min-width: 768px) {
    .baseButton {
        font-size: 24px;
        font-weight: 350;

        border-radius: 10px;
        border-style: solid;
    }
}
</style>