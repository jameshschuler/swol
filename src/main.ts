import BarLoadCalculator from "@/components/features/barLoadCalculator/BarLoadCalculator.vue";
import GymCheckIn from '@/components/features/gymCheckIn/GymCheckIn.vue';
import OneRepMaxCalculator from "@/components/features/oneRepMaxCalculator/OneRepMaxCalculator.vue";
import NotFound from "@/components/NotFound.vue";
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

const routes = [
    { path: '/', redirect: '/orm-calculator' },
    { name: 'BarLoadCalculator', path: '/barload-calculator', component: BarLoadCalculator },
    { name: 'OneRepMaxCalculator', path: '/orm-calculator', component: OneRepMaxCalculator },
    { name: 'GymCheckIn', path: '/gym-checkin', component: GymCheckIn },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

const router = createRouter( {
    history: createWebHistory(),
    routes
} );

const app = createApp( App );
app.use( router );
app.mount( '#app' );
