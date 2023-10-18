export const sidebarNavLinks = [
    {
        title: 'Features',
        requiresAuth: true,
        links: [
            {
                requiresAuth: true,
                label: 'Dashboard',
                to: '/dashboard'
            },
            {
                requiresAuth: true,
                label: 'Daily Gym Check-In',
                to: '/gym-checkin'
            },
            {
                requiresAuth: true,
                label: 'PR Tracker',
                to: '/pr-tracker'
            }
        ]
    },
    {
        title: 'Tools',
        requiresAuth: false,
        links: [
            {
                requiresAuth: false,
                label: 'One-Rep Max Calculator',
                to: '/orm-calculator',
            },
            {
                requiresAuth: false,
                label: 'Bar Load Calculator',
                to: '/barload-calculator',
            }
        ]
    },
    {
        title: 'Other',
        requiresAuth: false,
        links: [
            {
                requiresAuth: false,
                label: 'Privacy Policy',
                to: '/privacy',
            },
            {
                requiresAuth: false,
                label: 'Terms & Conditions',
                to: '/terms-conditions',
            },
            {
                requiresAuth: false,
                label: 'About',
                to: '/about',
            }
        ]
    }
];