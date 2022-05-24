import BarLoadCalculator from "@/components/features/barLoadCalculator/BarLoadCalculator.vue";
import OneRepMaxCalculator from "@/components/features/oneRepMaxCalculator/OneRepMaxCalculator.vue";
import NotFound from "@/components/NotFound.vue";
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

// TODO: design and implement bar load calculator
// TODO: animations
// TODO: include gym check-in calendar / feature
const routes = [
    { name: 'BarLoadCalculator', path: '/barload-calculator', component: BarLoadCalculator },
    { name: 'OneRepMaxCalculator', path: '/orm-calculator', component: OneRepMaxCalculator },
    { path: '/', redirect: '/orm-calculator' },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

const router = createRouter( {
    history: createWebHistory(),
    routes
} );

const app = createApp( App );
app.use( router );
app.mount( '#app' );
