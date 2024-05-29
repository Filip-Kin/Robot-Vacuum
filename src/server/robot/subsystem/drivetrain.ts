import type { MakitaBrushlessMotor } from '../io/motors';
import { robotEmitter } from '../robot';

export class DriveTrain {
    private leftMotor: MakitaBrushlessMotor;
    private rightMotor: MakitaBrushlessMotor;
    private deadBand: number = 0.02;
    private speedScalar: number = 1;
    private rotationScalar: number = 1;

    constructor(leftMotor: MakitaBrushlessMotor, rightMotor: MakitaBrushlessMotor) {
        this.leftMotor = leftMotor;
        this.rightMotor = rightMotor;
    }

    public setSpeed(leftSpeed: number, rightSpeed: number) {
        this.leftMotor.setSpeed(leftSpeed);
        this.rightMotor.setSpeed(rightSpeed);
    }

    public stop() {
        this.setSpeed(0, 0);
    }

    public arcadeDrive(speed: number, rotation: number) {
        const [leftSpeed, rightSpeed] = this.arcadeDriveIK(speed, rotation);
        this.setSpeed(leftSpeed, rightSpeed);
        robotEmitter.emit('dashboard', { speed, rotation, leftSpeed, rightSpeed });
    }

    public arcadeDriveIK(speed: number, rotation: number): [number, number] {
        // Apply deadband
        if (Math.abs(speed) < this.deadBand) speed = 0;
        if (Math.abs(rotation) < this.deadBand) rotation = 0;

        // Normalize, square (while keeping sign), and scale the inputs
        speed = Math.max(-1, Math.min(1, speed)) ** 2 * Math.sign(speed) * this.speedScalar;
        rotation = Math.max(-1, Math.min(1, rotation)) ** 2 * Math.sign(rotation) * this.rotationScalar;

        // Calculate the output speeds
        let leftSpeed = speed - rotation;
        let rightSpeed = speed + rotation;

        // Find the maximum possible value of (throttle + turn) along the vector
        // that the joystick is pointing, then desaturate the wheel speeds
        const greaterInput = Math.max(Math.abs(speed), Math.abs(rotation));
        const lesserInput = Math.min(Math.abs(speed), Math.abs(rotation));
        if (greaterInput == 0.0) {
            return [0.0, 0.0];
        }
        const saturatedInput = (greaterInput + lesserInput) / greaterInput;
        leftSpeed /= saturatedInput;
        rightSpeed /= saturatedInput;

        return [leftSpeed, rightSpeed];
    }
}
