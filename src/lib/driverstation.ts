import type { Joystick } from "../server/types";
import { trpc } from "./trpc";

export let joysticks: Joystick[] = [];

window.addEventListener('gamepadconnected', (event) => {
    const gamepad = event.gamepad;
    console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
        gamepad.index, gamepad.id,
        gamepad.buttons.length, gamepad.axes.length);
});

window.addEventListener('gamepaddisconnected', (event) => {
    const gamepad = event.gamepad;
    console.log('Gamepad disconnected from index %d: %s',
        gamepad.index, gamepad.id);
});

export function getJoysticks() {
    navigator.getGamepads();
    return navigator.getGamepads().filter((j) => j !== null).map((j) => ({
        index: j!.index as 0 | 1 | 2 | 3,
        id: j!.id,
        axes: [...j!.axes],
        buttons: j!.buttons.map((b) => b.pressed)
    }));
}
