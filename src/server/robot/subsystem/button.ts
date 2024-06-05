import { IO, PollingGPIO } from "../io/gpio";
import EventEmitter from 'events';

export class Button extends EventEmitter {
    private btn: PollingGPIO;
    private led: IO;
    private flashInterval?: NodeJS.Timeout;

    constructor(btn: PollingGPIO, led: IO) {
        super();
        this.btn = btn;
        this.led = led;

        this.btn.on('change', (state) => {
            this.emit('change', state);
        });
    }

    public ledFlash() {
        this.flashInterval = setInterval(() => {
            this.led.write(true);
            setTimeout(() => this.led.write(false), 500);
        }, 1000);
    }

    public ledOn() {
        this.flashInterval && clearInterval(this.flashInterval);
        this.led.write(true);
    }

    public ledOff() {
        this.flashInterval && clearInterval(this.flashInterval);
        this.led.write(false);
    }
}