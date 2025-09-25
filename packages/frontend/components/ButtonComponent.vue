<!--Button Component-->
<template>
  <!-- <button :class="[example ? 'example' : 'baseButton']" :style="styles">{{ buttonText }}</button> -->
  <button :class="buttonSize" :style="styles">{{ buttonText }}</button>
</template>

<script>
export default {
  props: {
    // Sets button text
    buttonText: { type: String, default: () => 'Submit' },

    // Sets the button size (see classes at bottom of this file to create/choose a new size)
    buttonSize: { type: String, default: () => 'baseButton' },

    // Sets button style
    backgroundColor: { type: String, default: () => '#4e3681' },
    color: { type: String, default: () => 'white' }, // text color
    border: { type: [String, Number], default: 2 }, // set to same color as background to remove
    borderColor: { type: String, default: '#4e3681' },

    // Sizing (some still done in div)
    padding: { type: [String, Number], default: '10px 20px' },
    margin: { type: [String, Number], default: '0px 0px 0px 0px' }
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
      };
    },
    _border() {
      if (this.isNumeric(this.border)) {
        return this.border + 'px';
      }
      return this.border;
    },
    _padding() {
      if (this.isNumeric(this.padding)) {
        return this.padding + 'px';
      }
      return this.padding;
    },
    _margin() {
      if (this.isNumeric(this.margin)) {
        return this.margin + 'px';
      }
      return this.margin;
    }
  },
  methods: {
    isNumeric(value) {
      return /^\d+$/.test(value);
    }
  }
};
</script>

<style scoped>
/* Styling and Fonts for Buttons */

/* The class Example is example styling for buttons with different font sizes than baseButton
(you can change the values for example or make a new css class like example, the example class is currently unused) */
/* Define Button w/ Custom Text Size as Shown: <button-component class="putAnyClassesHere" :example="true" buttonText="yourButtonText" /> */
.baseButton {
  font-size: 22px;
  font-weight: 350;

  border-radius: 10px;
  border-style: solid;
}

.submit-btn {
  font-size: 18px;
  font-weight: 400;
  line-height: 27px;
}

.learn-more {
  font-size: 16px;
  font-weight: 400;

  border-radius: 10px;
  border-style: solid;
}

.example {
  font-size: 16px;
  font-weight: 400;

  border-radius: 10px;
  border-style: solid;
}

.purple_btn:hover {
  background-color: #322253 !important;
  border-color: #322253 !important;
}
.blue_btn:hover {
  background-color: #e6f6ff !important;
  border-color: #e6f6ff !important;
}

@media (min-width: 768px) {
  .baseButton {
    font-size: 24px;
    font-weight: 350;

    border-radius: 10px;
    border-style: solid;
  }

  .submit-btn {
    font-size: 20px;
    font-weight: 400;
    line-height: 30px;
  }

  .learn-more {
    font-size: 18px;
    font-weight: 350;

    border-radius: 10px;
    border-style: solid;
  }

  .example {
    font-size: 18px;
    font-weight: 350;

    border-radius: 10px;
    border-style: solid;
  }
}

/* Fix spacing between 'Interested in Learning More' buttons when they wrap (learn_more.vue) */
@media (max-width: 386px) {
  .first {
    margin: 20px 20px 0px 0px !important;
  }
  .middle {
    margin: 20px 20px 0px 0px !important;
    margin-top: 20px;
  }
}
</style>
