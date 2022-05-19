import BarLoadCalculator from "@/components/features/barLoadCalculator/BarLoadCalculator.vue";
import OneRepMaxCalculator from "@/components/features/oneRepMaxCalculator/OneRepMaxCalculator.vue";
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';


const routes = [
    { name: 'BarLoadCalculator', path: '/barload-calculator', component: BarLoadCalculator },
    { name: 'OneRepMaxCalculator', path: '/orm-calculator', component: OneRepMaxCalculator },
];

const router = createRouter( {
    history: createWebHistory(),
    routes
} );

const app = createApp( App );
app.use( router );
app.mount( '#app' );
