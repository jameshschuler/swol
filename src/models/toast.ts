import { ToastType } from './enums';

export interface Toast {
    type?: ToastType;
    duration?: number;
    delay?: number;
    message: string;
}