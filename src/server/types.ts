export enum State {
    DISABLED,
    TELEOP,
    AUTONOMOUS
};

export interface Joystick {
    index: 0 | 1 | 2 | 3,
    id: string,
    axes: number[],
    buttons: boolean[];
};
