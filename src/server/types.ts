export enum State {
    DISABLED,
    TELEOP,
    AUTONOMOUS
};

export interface Joystick {
    index: number,
    id: string,
    axes: number[],
    buttons: boolean[];
};
