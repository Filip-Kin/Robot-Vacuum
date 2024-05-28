import type { IO } from '../io/gpio';

export class Light {
    private pin: IO;
    private output: boolean = false;
    private flashInterval?: NodeJS.Timeout;

    constructor(pin: IO) {
        this.pin = pin;
    }

    public on() {
        if (this.flashInterval) clearInterval(this.flashInterval);
        this.output = true;
        this.pin.write(true);
    }

    public off() {
        if (this.flashInterval) clearInterval(this.flashInterval);
        this.output = false;
        this.pin.write(false);
    }

    public flash(frequency: number = 1) {
        if (this.flashInterval) clearInterval(this.flashInterval);

        this.flashInterval = setInterval(() => {
            this.output = !this.output;
            this.pin.write(this.output);
        }, 1000 / frequency);
    }
}