import { SelectablePlate } from './selectablePlate';

export const defaultPoundPlateSet = new Array<SelectablePlate>(
    { weight: 100, selected: false, },
    { weight: 55, selected: false, },
    { weight: 45, selected: true, },
    { weight: 35, selected: true, },
    { weight: 25, selected: true, },
    { weight: 15, selected: false, },
    { weight: 10, selected: true, },
    { weight: 5, selected: true, },
    { weight: 2.5, selected: true, },
);

export const defaultKilogramPlateSet = new Array<SelectablePlate>(
    { weight: 50, selected: false, },
    { weight: 25, selected: true, },
    { weight: 20, selected: true, },
    { weight: 15, selected: true, },
    { weight: 10, selected: true, },
    { weight: 5, selected: true, },
    { weight: 2.5, selected: true, },
    { weight: 1.25, selected: true, },
    { weight: 0.5, selected: true, },
    { weight: 0.25, selected: true, },
);

export const dailyCheckInNotLoggedInMessage = "Must be logged in to access Daily Gym Check-In.";