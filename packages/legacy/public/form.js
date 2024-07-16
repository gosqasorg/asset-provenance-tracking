// form.js -- collect user input 
// Copyright (C) 2024 GOSQAS Team
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>. 

import { createApp, h } from 'https://unpkg.com/vue@3/dist/vue.runtime.esm-browser.js';
import ProvenanceForm from './ProvenanceForm.js';

const app = createApp({ render: () => h(ProvenanceForm) });
app.mount(`#form`);