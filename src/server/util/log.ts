import { logEmitter } from "../routers/robot-controller";

export const log = {
    error: (...message: any[]) => {
        let msg = '';

        for (let m of message) {
            console.log(typeof m);
            if (typeof m === 'object') {
                if (m instanceof Error) {
                    m = m.stack;
                } else {
                    m = JSON.stringify(m);
                }
            }
            msg += m.toString() + ' ';
        }

        logEmitter.emit('error', msg.trim());
        console.error(...message);
    },
    warn: (...message: any[]) => {
        let msg = '';

        for (let m of message) {
            if (typeof m === 'object') {
                if (m instanceof Error) {
                    m = m.stack;
                } else {
                    m = JSON.stringify(m);
                }
            }
            msg += m.toString() + ' ';
        }

        logEmitter.emit('warn', msg.trim());
        console.warn(...message);
    },
    log: (...message: any[]) => {
        let msg = '';

        for (let m of message) {
            if (typeof m === 'object') {
                if (m instanceof Error) {
                    m = m.stack;
                } else {
                    m = JSON.stringify(m);
                }
            }
            msg += m.toString() + ' ';
        }

        logEmitter.emit('log', msg.trim());
        console.log(...message);
    },
    debug: (...message: any[]) => {
        let msg = '';

        for (let m of message) {
            if (typeof m === 'object') {
                if (m instanceof Error) {
                    m = m.stack;
                } else {
                    m = JSON.stringify(m);
                }
            }
            msg += m.toString() + ' ';
        }

        logEmitter.emit('debug', msg.trim());
        console.debug(...message);
    }
};
