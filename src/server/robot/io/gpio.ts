import rpio from 'rpio';
import { EventEmitter } from 'events';

rpio.init({ gpiomem: false, mock: 'raspi-3' });

export abstract class IO {
    abstract mode: 'input' | 'output' | 'pwm' | 'analogInput';
    abstract pin: number;

    abstract read(): Promise<number>;
    abstract write(value: number | boolean): void;
}

export class GPIO implements IO {
    mode: 'input' | 'output' | 'pwm';
    pin: number;

    constructor(pin: number, mode: 'input' | 'output' | 'pwm' = 'output') {
        this.mode = mode;
        this.pin = pin;

        if (mode === 'output') {
            rpio.open(pin, rpio.OUTPUT, rpio.LOW);
        } else if (mode === 'input') {
            rpio.open(pin, rpio.INPUT, rpio.PULL_UP);
        } else if (mode === 'pwm') {
            if (![12, 32, 33, 35].includes(pin)) throw new Error('PWM not supported on this pin');
            rpio.open(pin, rpio.PWM);
            rpio.pwmSetClockDivider(128); // 1.5 kHz PWM
            rpio.pwmSetRange(pin, 1024);
            rpio.pwmSetData(pin, 0);
        } else {
            throw new Error('Raspberry PI does not support ' + mode);
        }
    }

    public async read(): Promise<number> {
        if (this.mode === 'output') throw new Error('Cannot read from output pin');
        return await rpio.read(this.pin);
    }

    /**
     * Write to the pin
     * @param value boolean for output/input pins, number 0-1 for PWM pins
     */
    public write(value: boolean | number): void {
        if (this.mode === 'input') throw new Error('Cannot write to input pin');
        if (this.mode === 'pwm') {
            rpio.pwmSetData(this.pin, Math.round(value as number * 1024));
        } else {
            rpio.write(this.pin, value ? rpio.HIGH : rpio.LOW);
        }
    }
}

export class PollingGPIO extends EventEmitter {
    pin: number;
    lastState: number = 0;

    constructor(pin: number) {
        super();
        this.pin = pin;
        rpio.open(pin, rpio.INPUT, rpio.PULL_UP);
    }

    pollcb() {
        rpio.msleep(20);
        const newState = rpio.read(this.pin);
        if (this.lastState !== newState) {
            this.emit((newState > this.lastState) ? 'rising' : 'falling');
            this.lastState = newState;
        }
    }
}