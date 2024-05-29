import { log } from '../../util/log';
import type { MakitaBrushlessMotor } from '../io/motors';

export class Vacuum {
    private mainBrush: MakitaBrushlessMotor;
    private leftBrush: MakitaBrushlessMotor;
    private rightBrush: MakitaBrushlessMotor;
    private vacuum: MakitaBrushlessMotor;
    private vacuumState: boolean = false;

    constructor(mainBrush: MakitaBrushlessMotor, leftBrush: MakitaBrushlessMotor, rightBrush: MakitaBrushlessMotor, vacuum: MakitaBrushlessMotor) {
        this.mainBrush = mainBrush;
        this.leftBrush = leftBrush;
        this.rightBrush = rightBrush;
        this.vacuum = vacuum;
    }

    public getState() {
        return this.vacuumState;
    }

    public toggle() {
        log.log('Vacuum Toggle');
        if (this.vacuumState) {
            this.stop();
        } else {
            this.start();
        }
    }

    public start() {
        this.vacuumState = true;
        this.mainBrush.setSpeed(1);
        this.leftBrush.setSpeed(1);
        this.rightBrush.setSpeed(1);
        this.vacuum.setSpeed(1);
    }

    public stop() {
        this.vacuumState = false;
        this.mainBrush.setSpeed(0);
        this.leftBrush.setSpeed(0);
        this.rightBrush.setSpeed(0);
        this.vacuum.setSpeed(0);
    }
}