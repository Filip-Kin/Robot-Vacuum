<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { trpc } from '../lib/trpc';
    import { Button, Label, Textarea } from 'flowbite-svelte';
    import { State } from "../server/types";
    import type { DashboardPost } from '../server/routers/robot-controller';
    import Log from '../components/Log.svelte';

    let subscription: ReturnType<typeof trpc.robot.dashboard.subscribe> | undefined = undefined;

    onMount(() => {
        if (subscription) subscription.unsubscribe();
        subscription = trpc.robot.dashboard.subscribe(void 0, {
            onData: handleDashboardFrame
        });
        console.log('Connected To Robot');
    });

    onDestroy(() => {
        if (subscription) subscription.unsubscribe();
    });

    let robotState: State = State.DISABLED;
    let battery = "0.00";

    async function handleDashboardFrame(data: DashboardPost) {
        console.log(data);
        robotState = data.state;
        battery = data.battery.toFixed(2);
    }

    async function enable() {
        await trpc.robot.enable.query({
            state: (robotState === State.DISABLED) ? State.TELEOP : State.DISABLED
        });
    }
</script>

<main class="w-full max-w-4xl mx-auto mt-2">
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
                <p>Battery: {battery}V</p>
            </div>
            <Button on:click={() => enable()}>{robotState === State.DISABLED ? "Enable" : "Disable"}</Button>
        </div>
        <div class="w-full grow">
            <Log />
        </div>
    </div>
</main>
