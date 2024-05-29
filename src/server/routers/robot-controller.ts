import { observable } from "@trpc/server/observable";
import { t } from "../trpc";
import { Robot, robotEmitter, type Dashboard } from "../robot/robot";
import { z } from "zod";
import { State } from "../types";
import EventEmitter from "events";
import { log } from "../util/log";
import { Joystick, joysticks } from "../util/joysticks";

let robotState: State = State.DISABLED;
export const robotInstance = new Robot();

export const logEmitter = new EventEmitter();

async function robotLoop() {
    let resolved = false;

    try {
        let promise = abortablePeriodicCall(async () => {
            await robotInstance.robotPeriodic();

            if (robotState === State.TELEOP) {
                await robotInstance.teleopPeriodic();
            } else if (robotState === State.AUTONOMOUS) {
                await robotInstance.autonomousPeriodic();
            } else {
                await robotInstance.disabledPeriodic();
            }
        });

        setTimeout(async () => {
            if (!resolved) {
                promise.abort('loop overrun');
            }
        }, 50);

        await promise.promise;
        resolved = true;
    } catch (e) {
        log.error('Error in robot loop:', e);
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
    robotLoop();
}

function abortablePeriodicCall(call: () => Promise<void>) {
    let abortController = new AbortController();
    let promise = new Promise((resolve, reject) => {
        const abortListener = (reason: any) => {
            abortController.signal.removeEventListener('abort', abortListener);
            reject(reason);
        };
        abortController.signal.addEventListener('abort', abortListener);

        call().then(resolve).catch(reject);
    });

    return {
        promise,
        abort: (reason: any) => {
            abortController.abort(reason);
        }
    };
}

(async () => {
    let resolved = false;

    let promise = abortablePeriodicCall(async () => {
        await robotInstance.robotInit();
        resolved = true;
    });

    setTimeout(() => {
        if (!resolved) {
            promise.abort('init timeout');
        }
    }, 1000);

    await promise.promise;
    resolved = true;

    robotLoop();
})();

export interface DashboardPost extends Dashboard {
    state: State;
};

export const robotRouter = t.router({
    dashboard: t.procedure.subscription(async () => {
        return observable<DashboardPost>((emit) => {
            const onData = (data: Dashboard) => {
                emit.next({
                    ...data,
                    state: robotState
                });
            };

            robotEmitter.on('dashboard', onData);

            return () => {
                robotEmitter.off('dashboard', onData);
            };
        });
    }),

    log: t.procedure.subscription(async () => {
        return observable<{ data: string, level: 'error' | 'warn' | 'log' | 'debug', time: Date; }>((emit) => {
            const onData = (data: string, level: 'error' | 'warn' | 'log' | 'debug') => {
                emit.next({ data, level, time: new Date() });
            };

            logEmitter.on('log', (msg) => onData(msg, 'log'));
            logEmitter.on('warn', (msg) => onData(msg, 'warn'));
            logEmitter.on('error', (msg) => onData(msg, 'error'));
            logEmitter.on('debug', (msg) => onData(msg, 'debug'));

            return () => {
                logEmitter.off('log', (msg) => onData(msg, 'log'));
                logEmitter.off('warn', (msg) => onData(msg, 'warn'));
                logEmitter.off('error', (msg) => onData(msg, 'error'));
                logEmitter.off('debug', (msg) => onData(msg, 'debug'));
            };
        });
    }),

    enable: t.procedure.input(z.object({
        state: z.nativeEnum(State).default(State.DISABLED)
    })).query(async ({ input }) => {
        try {
            if (input.state === State.TELEOP) {
                await robotInstance.teleopInit();
                robotState = State.TELEOP;
                Joystick.enableAll();
            } else if (input.state === State.AUTONOMOUS) {
                await robotInstance.autonomousInit();
                robotState = State.AUTONOMOUS;
                Joystick.disableAll();
            } else {
                await robotInstance.disabledInit();
                robotState = State.DISABLED;
                Joystick.disableAll();
            }
        } catch (e) {
            log.error(e);
        }
        return robotState;
    }),

    joystick: t.procedure.input(z.array(z.object({
        index: z.number(),
        id: z.string(),
        axes: z.array(z.number()),
        buttons: z.array(z.boolean())
    }))).query(async ({ input }) => {
        for (let joystick of input) {
            let joystickCorrectType = {
                index: joystick.index as 0 | 1 | 2 | 3,
                id: joystick.id,
                axes: joystick.axes,
                buttons: joystick.buttons
            };

            let joystickFromArray = joysticks[joystickCorrectType.index];

            if (joystickFromArray) {
                joystickFromArray.update(joystickCorrectType);
            } else {
                joystickFromArray = new Joystick(joystickCorrectType);
            }
        }
    })
});