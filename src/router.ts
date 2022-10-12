import About from '@/components/About.vue';
import Dashboard from "@/components/Dashboard.vue";
import BarLoadCalculator from '@/components/features/BarLoadCalculator/BarLoadCalculator.vue';
import GymCheckIn from '@/components/features/GymCheckIn/GymCheckIn.vue';
import OneRepMaxCalculator from '@/components/features/OneRepMaxCalculator/OneRepMaxCalculator.vue';
import Landing from "@/components/Landing.vue";
import Login from "@/components/Login.vue";
import NotFound from "@/components/NotFound.vue";
import PrivacyPolicy from "@/components/PrivacyPolicy.vue";
import TermsAndConditions from "@/components/TermsAndConditions.vue";
import Profile from '@/views/Profile.vue';

import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from './supabase';

const routes = [
    { name: 'Landing', path: '/', component: Landing },
    {
        name: 'Dashboard', path: '/dashboard', component: Dashboard, meta: {
            requiresAuth: true
        }
    },
    { name: 'BarLoadCalculator', path: '/barload-calculator', component: BarLoadCalculator },
    { name: 'OneRepMaxCalculator', path: '/orm-calculator', component: OneRepMaxCalculator },
    {
        name: 'GymCheckIn',
        path: '/gym-checkin',
        component: GymCheckIn,
        meta: {
            requiresAuth: true
        }
    },
    {
        name: 'Profile',
        path: '/profile',
        component: Profile,
        meta: {
            requiresAuth: true
        }
    },
    { name: 'Login', path: '/login', component: Login },
    { name: 'Privacy', path: '/privacy', component: PrivacyPolicy },
    { name: 'TermsConditions', path: '/terms-conditions', component: TermsAndConditions },
    { name: 'About', path: '/about', component: About },
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
        if ( user?.id && ( to.name === 'Login' || to.name === 'Landing' ) ) {
            next( { name: 'Dashboard' } );
        } else {
            next();
        }
    }
} );

export default router;