import EventEmitter from 'events';
import { SerialPort, SerialPortMock } from 'serialport';
import type { IO } from './gpio';
import 'dotenv/config';

export class Arduino extends EventEmitter {
    serial: SerialPort;
    open: Promise<void>;

    constructor(path: string, baudRate = 9600) {
        super();

        if (process.env.DEV) {
            SerialPortMock.binding.createPort(path);
            this.serial = new SerialPortMock({ path, baudRate });
        } else {
            this.serial = new SerialPort({ path, baudRate });
        }

        this.serial.on('data', (data) => {
            try {
                const res: ArduinoResponse = JSON.parse(data.toString());
                this.emit(res.type, res.data);
            } catch (e) {
                console.error('Error parsing data from Arduino:', e);
            }
        });

        this.open = new Promise((resolve) => {
            this.serial.on('open', () => {
                resolve();
                this.write({ type: 'ping' });
            });
        });
    }

    public async write(data: ArduinoCommand) {
        await this.open;
        this.serial.write(JSON.stringify(data));
    }

    public async awaitResponse(type: ArduinoResponse['type'], pin?: number): Promise<ArduinoResponse> {
        const classThis = this;

        return new Promise((resolve) => {
            function listener(data: ArduinoResponse['data']) {
                if (pin === undefined || data.pin === pin) {
                    classThis.off(type, listener);
                    resolve({ type, data });
                }
            }

            this.on(type, listener);
        });
    }
}

export interface ArduinoCommand {
    type: 'ping' | 'io' | 'setupio';
    data?: any;
}

export interface ArduinoSetupIOCommand extends ArduinoCommand {
    type: 'setupio';
    data: {
        pin: number;
        mode: 'input' | 'output' | 'pwm' | 'analogInput';
    };
}

export interface ArduinoIOCommand extends ArduinoCommand {
    type: 'io';
    data: {
        pin: number;
        mode: 'input' | 'output' | 'pwm' | 'analogInput';
        value?: boolean | number;
    };
}

export interface ArduinoResponse {
    type: 'io';
    data: {
        pin: number;
        value: number;
    };
}

export class ArduinoIO implements IO {
    arduino: Arduino;
    mode: 'input' | 'output' | 'pwm' | 'analogInput';
    pin: number;

    /**
     * Setup Arduino IO
     * @param pin Arduino Pin number
     * @param mode Input, output, or PWM
     * @param arduino Arduino serial connection
     */
    constructor(pin: number, mode: 'input' | 'output' | 'pwm' | 'analogInput' = 'output', arduino: Arduino) {
        this.mode = mode;
        this.pin = pin;
        this.arduino = arduino;
        this.arduino.write({ type: 'setupio', data: { pin, mode } });
    }

    public async read(): Promise<number> {
        if (this.mode === 'output') throw new Error('Cannot read from output pin');
        this.arduino.write({ type: 'io', data: { pin: this.pin, mode: this.mode } });
        const res = await this.arduino.awaitResponse('io', this.pin);
        return res.data.value;
    }

    public write(value: number | boolean): void {
        if (this.mode === 'input') throw new Error('Cannot write to input pin');
        this.arduino.write({ type: 'io', data: { pin: this.pin, value, mode: this.mode } });
    }
}
