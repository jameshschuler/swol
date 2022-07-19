import BarLoadCalculator from "@/components/features/barLoadCalculator/BarLoadCalculator.vue";
import GymCheckIn from '@/components/features/gymCheckIn/GymCheckIn.vue';
import OneRepMaxCalculator from "@/components/features/oneRepMaxCalculator/OneRepMaxCalculator.vue";
import Login from "@/components/Login.vue";
import NotFound from "@/components/NotFound.vue";
import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from './supabase';

const routes = [
    { path: '/', redirect: '/orm-calculator' },
    { name: 'BarLoadCalculator', path: '/barload-calculator', component: BarLoadCalculator },
    { name: 'OneRepMaxCalculator', path: '/orm-calculator', component: OneRepMaxCalculator },
    {
        name: 'GymCheckIn',
        path: '/gym-checkin',
        component: GymCheckIn,
    },
    { name: 'Login', path: '/login', component: Login },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

const router = createRouter( {
    history: createWebHistory(),
    routes
} );

router.beforeEach( ( to, from, next ) => {
    const requiresAuth = to.matched.some( record => record.meta.requiresAuth );
    const user = supabase.auth.user();

    if ( requiresAuth && user === null ) {
        next( { name: 'Login' } );
    }
    else {
        if ( user?.id && to.name === 'Login' ) {
            next( { name: 'GymCheckIn' } ); // TODO: replace with homepage at some point?
        } else {
            next();
        }
    }
} );

export default router;