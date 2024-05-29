import { EventEmitter } from 'events';
import { VoltageSensor } from './io/voltage-sensor';
import { batteryVoltage, fanMotor, leftDriveMotor, light, mainBrushMotor, rightDriveMotor } from './robot-map';
import { DriveTrain } from './subsystem/drivetrain';
import { Light } from './subsystem/light';
import 'dotenv/config';
import { log } from '../util/log';
import { Joystick } from '../util/joysticks';
import { Vacuum } from './subsystem/vacuum';

export interface Dashboard {
    battery?: number;
    leftSpeed?: number;
    rightSpeed?: number;
    speed?: number;
    rotation?: number;
    vacuum?: boolean;
}

export const robotEmitter = new EventEmitter();

export class Robot {
    drivetrain: DriveTrain;
    light: Light;
    batteryVoltageSensor: VoltageSensor;
    batteryVoltage: number = 0;
    driveJoy: Joystick | undefined = Joystick.getJoystick(0);
    vacuum: Vacuum;

    constructor() {
        this.drivetrain = new DriveTrain(leftDriveMotor, rightDriveMotor);
        this.light = new Light(light);
        this.batteryVoltageSensor = new VoltageSensor(batteryVoltage);
        this.vacuum = new Vacuum(mainBrushMotor, leftDriveMotor, rightDriveMotor, fanMotor);
    }

    public async robotInit() {
        if (process.env.DEV) this.batteryVoltage = 12;
    }

    public async robotPeriodic() {
        if (process.env.DEV) {
            const addition = (Math.random() * 0.05);
            if (this.batteryVoltage > 14.0) {
                this.batteryVoltage += -1 * addition;
            } else if (this.batteryVoltage < 7) {
                this.batteryVoltage += addition;
            } else {
                this.batteryVoltage += addition * (Math.random() > 0.5 ? 1 : -1);
            }
        } else {
            this.batteryVoltage = await this.batteryVoltageSensor.getVoltage();
        }
        robotEmitter.emit('dashboard', { battery: this.batteryVoltage, vacuum: this.vacuum.getState() });
    }

    public async teleopInit() {
        log.log('Teleop Init');
        this.driveJoy = Joystick.getJoystick(0);
        this.light.flash();

        this.driveJoy?.on('press', (button) => {
            if (button === 0) {
                this.vacuum.toggle();
            }
        });
    }

    public async teleopPeriodic() {
        if (!this.driveJoy) return;
        this.drivetrain.arcadeDrive(-1 * this.driveJoy.getAxis(1), this.driveJoy.getAxis(2));
    }

    public async disabledInit() {
        log.log('Disabled Init');
        this.drivetrain.stop();
        this.light.off();
        this.vacuum.stop();
    }

    public async disabledPeriodic() {

    }

    public async autonomousInit() {

    }

    public async autonomousPeriodic() {

    }
}