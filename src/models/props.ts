import { AlertType } from './enums';

export interface ModalOptions {
    size?: string;
    buttons?: Buttons;
    onSave?: Function;
}

export interface Buttons {
    close?: boolean;
    cancel?: boolean;
    save?: boolean;
}

export interface AlertOptions {
    icon?: string;
    message: string;
    type?: AlertType;
}