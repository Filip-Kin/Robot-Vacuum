import { Arduino, ArduinoIO } from './io/arduino';
import { GPIO, PollingGPIO } from './io/gpio';
import { MakitaBrushlessMotor } from './io/motors';

// Hardware PWM on 12, 32, 33, 35
// I2C 3, 5
// GPIO 7, 8, 10, 11, 13, 15, 16, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29, 31, 36, 37, 38, 40
const rpiPins = {
    leftDriveMotor: {
        pwm: 12,
        direction: 11,
        invert: false
    },
    rightDriveMotor: {
        pwm: 32,
        direction: 31,
        invert: true
    },
    mainBrushMotor: {
        pwm: 35,
        direction: 37,
        invert: false
    },
    fanMotor: {
        pwm: 33
    },
    light: 7,
    button: 8
};

// Hardware PWM 3, 9, 10, 11, 5, 6 (5, 6 are not recommended)
const arduinoPins = {
    leftBrushMotor: {
        pwm: 3,
        direction: 2,
        invert: false
    },
    rightBrushMotor: {
        pwm: 9,
        direction: 8,
        invert: true
    },
    batteryVoltage: 0,
    buttonLED: 5
};

export const arduino = new Arduino('/dev/ttyACM0');

// Motors
export const leftDriveMotor = new MakitaBrushlessMotor(
    new GPIO(rpiPins.leftDriveMotor.pwm, 'pwm'),
    new GPIO(rpiPins.leftDriveMotor.direction, 'output'),
    rpiPins.leftDriveMotor.invert);

export const rightDriveMotor = new MakitaBrushlessMotor(
    new GPIO(rpiPins.rightDriveMotor.pwm, 'pwm'),
    new GPIO(rpiPins.rightDriveMotor.direction, 'output'),
    rpiPins.rightDriveMotor.invert);


export const mainBrushMotor = new MakitaBrushlessMotor(
    new GPIO(rpiPins.mainBrushMotor.pwm, 'pwm'),
    new GPIO(rpiPins.mainBrushMotor.direction, 'output'),
    rpiPins.mainBrushMotor.invert);

export const fanMotor = new MakitaBrushlessMotor(new GPIO(rpiPins.fanMotor.pwm, 'pwm'));

export const leftBrushMotor = new MakitaBrushlessMotor(
    new ArduinoIO(arduinoPins.leftBrushMotor.pwm, 'pwm', arduino),
    new ArduinoIO(arduinoPins.leftBrushMotor.direction, 'output', arduino),
    arduinoPins.leftBrushMotor.invert);

export const rightBrushMotor = new MakitaBrushlessMotor(
    new ArduinoIO(arduinoPins.rightBrushMotor.pwm, 'pwm', arduino),
    new ArduinoIO(arduinoPins.rightBrushMotor.direction, 'output', arduino),
    arduinoPins.rightBrushMotor.invert);

// General IO
export const light = new GPIO(rpiPins.light, 'output');
export const batteryVoltage = new ArduinoIO(arduinoPins.batteryVoltage, 'analogInput', arduino);
export const button = new PollingGPIO(rpiPins.button);
export const buttonLED = new ArduinoIO(arduinoPins.buttonLED, 'output', arduino);
