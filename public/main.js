import { createApp, h } from 'https://unpkg.com/vue@3/dist/vue.runtime.esm-browser.js';
import ProvenanceForm from './ProvenanceForm.js';

const app = createApp({ render: () => h(ProvenanceForm) });
app.mount(`#app`);