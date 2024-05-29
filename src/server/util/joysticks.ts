import { EventEmitter } from "events";
import type { Joystick as JoystickInterface } from "../types";

export const joysticks: { 0?: Joystick, 1?: Joystick, 2?: Joystick, 3?: Joystick; } = {};

export class Joystick extends EventEmitter implements JoystickInterface {
    index: 0 | 1 | 2 | 3;
    id: string;
    axes: number[];
    buttons: boolean[];
    lastButtons: boolean[];
    disabled: boolean = false;

    constructor(joystick: JoystickInterface) {
        super();

        this.index = joystick.index;
        this.id = joystick.id;
        this.axes = joystick.axes;
        this.buttons = joystick.buttons;
        this.lastButtons = joystick.buttons;

        joysticks[joystick.index] = this;
    }

    public getAxis(axis: number) {
        return this.axes[axis];
    }

    public getButton(button: number) {
        return this.buttons[button];
    }

    public update(joystick: JoystickInterface) {
        if (this.disabled) return;

        this.id = joystick.id;
        this.index = joystick.index;
        this.axes = joystick.axes;
        this.lastButtons = this.buttons;
        this.buttons = joystick.buttons;

        for (let i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i] !== this.lastButtons[i]) {
                this.emit(this.buttons[i] ? 'press' : 'release', i);
            }
        }
    }

    public static getJoystick(index: 0 | 1 | 2 | 3) {
        return joysticks[index];
    };

    public static disableAll() {
        for (let joystick of Object.values(joysticks)) {
            if (joystick) {
                joystick.removeAllListeners();
                joystick.disabled = true;
            }
        }
    }

    public static enableAll() {
        for (let joystick of Object.values(joysticks)) {
            if (joystick) {
                joystick.disabled = false;
            }
        }
    }
}