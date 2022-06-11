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