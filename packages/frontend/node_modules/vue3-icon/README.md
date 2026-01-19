[![NPM Version](https://img.shields.io/npm/v/vue3-icon.svg?style=flat-square)](https://www.npmjs.com/package/vue3-icon)
[![Licence: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENCE)
[![NPM Downloads](https://img.shields.io/npm/dt/vue3-icon.svg?style=flat-square)](https://www.npmjs.com/package/vue3-icon)

# Vue 3 Icon

An icon component which makes it easy to render SVG path-based icons in any Vue 3 project. It provides several helpful properties to manipulate the icon and supports any icon pack which provides icons as a single SVG path to be displayed within a square element.

## Installation

```
npm install vue3-icon
# OR
yarn add vue3-icon
# OR
pnpm add vue3-icon
```

## Usage

### Global Vue Usage

```js
import { createApp } from "vue";
import SvgIcon from "vue3-icon";

const app = createApp();
app.component("svg-icon", SvgIcon);

app.mount("#app");
```

### Local Usage (Options API)

```js
<script>
import SvgIcon from "vue3-icon";
export default {
	components: {
		SvgIcon
	}
}
</script>
```

### Local Usage (Composition API)

```js
<script>
import SvgIcon from "vue3-icon";
export default {
	setup() {
		return {
			SvgIcon
		}
	}
}
</script>
```

### SFC Examples

All examples assume that the vue3-icon component is installed globally and the Compositon API is used

### Material Design Icons [@mdi/js](https://www.npmjs.com/package/@mdi/js)

```html
<template>
  <svg-icon type="mdi" :path="mdiAccount" :size="48"></svg-icon>
</template>


<script>
import { mdiAccount } from '@mdi/js'

export default {
  	setup() {
		return {
			mdiAccount,
	  	}
  	}
}
</script>
```

### FontAwesome Icons

-   [@fortawesome/free-solid-svg-icons](https://www.npmjs.com/package/@fortawesome/free-solid-svg-icons)
-   [@fortawesome/free-regular-svg-icons](https://www.npmjs.com/package/@fortawesome/free-regular-svg-icons)
-   [@fortawesome/free-brands-svg-icons](https://www.npmjs.com/package/@fortawesome/free-brands-svg-icons)

```html
<template>
  <svg-icon :fa-icon="faCoffee" :size="96" flip="horizontal"></svg-icon>
</template>


<script>
import { faCoffee } from "@fortawesome/free-solid-svg-icons";

export default {
  	setup() {
		return {
			faCoffee,
	  	}
  	}
}
</script>
```

### Simple Icons

```html
<template>
  <svg-icon type="simple-icons" :path="siAndela.path" size="24"></svg-icon>
</template>


<script>
import {siAndela} from 'simple-icons/icons';

export default {
  	setup() {
		return {
			siAndela,
	  	}
  	}
}
</script>
```

### Custom SVG Icons

```html
<template>
  <svg-icon :path="myCustomIcon" size="24" viewbox="0 0 24 24"></svg-icon>
</template>


<script>
const myCustomIcon = "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z";


export default {
  	setup() {
		return {
			myCustomIcon,
	  	}
  	}
}
</script>
```

## Props

| Name    | Type             | Default     | Description                                                                                                                          |
| ------- | ---------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| type    | String           | null        | This sets the size and viewbox to match the recommended size for the icon pack specified.                                            |
| path    | String \| Array  | null        | An SVG path(s) to render as an icon.                                                                                                 |
| fa-icon | Object           | null        | A FontAwesome icon object as imported from one of their available SVG libraries.                                                     |
| size    | Number \| String | 24          | The width and height of the SVG element.                                                                                             |
| viewbox | String           | "0 0 24 24" | The `viewBox` of the SVG element.                                                                                                    |
| flip    | String           | null        | One of "horizontal", "vertical", or "both". Flips the icon in the specified direction(s).                                            |
| rotate  | Number \| String | 0deg        | Rotates the icon by the specified value. Can be any valid [CSS angle](https://developer.mozilla.org/en-US/docs/Web/CSS/angle) value. |
| no-namespace | Boolean     | false       | Don't render the xml namespace attribute on the SVG element.                                                                         |
| no-styles | Boolean        | false       | Don't render any SVG/Path styles (handle externally), disables flip and rotate.                                                      |
| no-dimensions | Boolean    | false       | Don't render the width or height attributes.                                                                                         |

## Styling

By default, the icon will inherit the current font colour of the container it is placed within. You can easily provide a specific colour using an inline style on the element (`style="color: red"`) or can target the tag as normal with CSS rules.

## Accessibility

You should make use of aria attributes to improve accessibility for users that use screen reading technology. You can use `aria-labelledby` to create a link between an icon and its label. A descriptive `aria-label` can be used to allow screen readers to announce an icon if there is no visual label to accompany it.
