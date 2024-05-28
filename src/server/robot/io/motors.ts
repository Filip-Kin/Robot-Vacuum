import { IO } from './gpio';

export class MakitaBrushlessMotor {
    pwm: IO;
    direction?: IO;
    currentSpeed: number = 0;
    currentDirection: boolean = false; // false = forward, true = reverse
    invert: boolean;

    /**
     * Create a new Makita Brushless Motor object
     * @param pwm PWM Pin for the motor
     * @param direction Direciton Pin for the motor
     * @param invert Invert the direction of the motor
     */
    constructor(pwm: IO, direction?: IO, invert: boolean = false) {
        this.invert = invert;
        this.pwm = pwm;
        this.direction = direction;
    }

    /**
     * Set the speed of the motor
     * @param speed Speed of the motor (-1-1)
     */
    public setSpeed(speed: number) {
        if (this.direction) {
            if (speed < -1 || speed > 1) throw new Error('Speed must be between -1 and 1');

            this.direction.write(speed < 0); // Reverse if speed < 0
            this.direction.write(this.invert ? !this.currentDirection : this.currentDirection);
        } else {
            if (speed < 0 || speed > 1) throw new Error('Speed must be between 0 and 1');
        }

        this.currentSpeed = Math.abs(speed);
        this.pwm.write(speed);
    }
}
