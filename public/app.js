import { createStore } from './core/core.js';
import Home from './src/app/pages/home/Home.js';

const template = (state) => 
    `
        <div class="container flex main-container">
            ${Home({
                state,
            })}
        </div>
    `;

const app = createStore({
    selector: '#app',
    state: {},
    template: template
})

app

