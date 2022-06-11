import { SelectablePlate } from './selectablePlate';

export const poundPlatesSet = [ 100, 55, 45, 35, 25, 10, 5, 2.5 ];
export const kilogramPlatesSet = [ 25, 20, 15, 10, 5, 2.5 ];

export const defaultPoundPlateSet = new Array<SelectablePlate>(
    { weight: 100, selected: false, },
    { weight: 55, selected: false, },
    { weight: 45, selected: true, },
    { weight: 35, selected: true, },
    { weight: 25, selected: true, },
    { weight: 10, selected: true, },
    { weight: 5, selected: true, },
    { weight: 2.5, selected: true, },
);