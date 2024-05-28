import { EventEmitter } from 'events';
import { VoltageSensor } from './io/voltage-sensor';
import { batteryVoltage, leftDriveMotor, light, rightDriveMotor } from './robot-map';
import { DriveTrain } from './subsystem/drivetrain';
import { Light } from './subsystem/light';
import 'dotenv/config';
import { log } from '../util/log';

export interface Dashboard {
    battery: number;
}

export const robotEmitter = new EventEmitter();

export class Robot {
    drivetrain: DriveTrain;
    light: Light;
    batteryVoltageSensor: VoltageSensor;
    batteryVoltage: number = 0;

    constructor() {
        this.drivetrain = new DriveTrain(leftDriveMotor, rightDriveMotor);
        this.light = new Light(light);
        this.batteryVoltageSensor = new VoltageSensor(batteryVoltage);
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
            robotEmitter.emit('dashboard', { battery: this.batteryVoltage });
        } else {
            this.batteryVoltage = await this.batteryVoltageSensor.getVoltage();
            robotEmitter.emit('dashboard', { battery: this.batteryVoltage });
        }
    }

    public async teleopInit() {
        log.log('Teleop Init');
    }

    public async teleopPeriodic() {

    }

    public async autonomousInit() {

    }

    public async autonomousPeriodic() {

    }
}