import type { ArduinoIO } from './arduino';

export class VoltageSensor {
    private pin: ArduinoIO;
    private r1: number;
    private r2: number;

    constructor(pin: ArduinoIO, r1 = 100000, r2 = 300000) {
        this.pin = pin;
        this.r1 = r1;
        this.r2 = r2;
    }

    public async getVoltage() {
        const voltage = await this.pin.read();
        return voltage * (this.r1 + this.r2) / this.r2;
    }
}
