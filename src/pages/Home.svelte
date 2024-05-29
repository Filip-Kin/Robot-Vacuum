<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { trpc } from '../lib/trpc';
    import { Button } from 'flowbite-svelte';
    import { State } from "../server/types";
    import type { DashboardPost } from '../server/routers/robot-controller';
    import Log from '../components/Log.svelte';
    import { getJoysticks } from '../lib/driverstation';
    import Joystick from '../components/Joystick.svelte';
    import Bar from '../components/Bar.svelte';
    import Boolean from '../components/Boolean.svelte';

    let subscription: ReturnType<typeof trpc.robot.dashboard.subscribe> | undefined = undefined;

    onMount(() => {
        if (subscription) subscription.unsubscribe();
        subscription = trpc.robot.dashboard.subscribe(void 0, {
            onData: handleDashboardFrame
        });
        console.log('Connected To Robot');

        if (!joystickLoop) {
            joystickLoop = setInterval(async () => {
                joysticks = getJoysticks();
                await trpc.robot.joystick.query(joysticks);
            }, 50);
        }
    });

    onDestroy(() => {
        if (subscription) subscription.unsubscribe();
        clearInterval(joystickLoop);
    });

    let robotState: State = State.DISABLED;

    let dashboard: DashboardPost = {
        state: robotState,
        battery: 0,
        leftSpeed: 0,
        rightSpeed: 0,
        speed: 0,
        rotation: 0,
        vacuum: false,
    }

    async function handleDashboardFrame(data: DashboardPost) {
        robotState = data.state;
        for (const key in data) {
            const k = key as keyof DashboardPost;
            const value = data[k];
            if (Object.prototype.hasOwnProperty.call(data, k)) {
                if (value === undefined) continue;
                if (k === 'battery') {
                    dashboard.battery = Math.round(value * 100) / 100;
                } else {
                    dashboard[k] = value;
                }
            }
        }
    }

    async function enable() {
        await trpc.robot.enable.query({
            state: (robotState === State.DISABLED) ? State.TELEOP : State.DISABLED
        });
    }

    let joysticks = getJoysticks();

    let joystickLoop: NodeJS.Timeout | undefined = undefined;
</script>

<main class="w-full max-w-4xl mx-auto mt-2 flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-2">
        <Bar label="Speed" value={dashboard.speed} min={-1} max={1} />
        <Bar label="Left Speed" value={dashboard.leftSpeed} min={-1} max={1} />
        <Bar label="Rotation" value={dashboard.rotation} min={-1} max={1} />
        <Bar label="Right Speed" value={dashboard.rightSpeed} min={-1} max={1} />
        <Boolean label="Vacuum" value={dashboard.vacuum} />
    </div>
    <div class="flex gap-2 max-h-72">
        <div class="flex flex-col w-96 gap-2 justify-center text-xl text-center">
            <div class="font-bold">
                {#if robotState === State.DISABLED}
                    <p class="text-red-500">Disabled</p>
                {:else if robotState === State.TELEOP}
                    <p class="text-green-500">Teleop</p>
                {:else if robotState === State.AUTONOMOUS}
                    <p class="text-blue-500">Autonomous</p>
                {/if}
            </div>
            <div>
                <p>Battery: {dashboard.battery}V</p>
            </div>
            <Button on:click={() => enable()}>{robotState === State.DISABLED ? "Enable" : "Disable"}</Button>
        </div>
        <div class="w-full grow">
            <Log />
        </div>
    </div>
    <div>
        {#key joysticks}
            {#each joysticks as joystick}
                <Joystick {joystick} />
            {/each}
        {/key}
    </div>
</main>
