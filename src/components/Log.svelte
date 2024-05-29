<script lang="ts">
    import { afterUpdate, onDestroy, onMount } from "svelte";
    import { trpc } from "../lib/trpc";
    import { Label, Textarea } from "flowbite-svelte";

    let log: { data: string, level: 'error' | 'warn' | 'log' | 'debug', time: Date }[] = [];
    let logSubscription: ReturnType<typeof trpc.robot.log.subscribe> | undefined = undefined;

    onMount(() => {
        if (logSubscription) logSubscription.unsubscribe();
        logSubscription = trpc.robot.log.subscribe(void 0, {
            onData: (data) => {
                log.push(data);
                log = log.slice(-100);
            }
        });
    });

    onDestroy(() => {
        if (logSubscription) logSubscription.unsubscribe();
    });

    afterUpdate(() => {
        const logElement = document.getElementById('log');
        if (logElement) {
            logElement.scrollTop = logElement.scrollHeight;
        }
    });

    const logColor = {
        error: 'text-red-500',
        warn: 'text-yellow-500',
        log: 'text-gray-300',
        debug: 'text-blue-500'
    };
</script>

<Label for="log">Log</Label>
<div id="log" class="bg-gray-700 rounded-lg p-4 overflow-y-auto mt-1 h-52 text-sm">
    {#each log as { data, level, time }, i}
        <p class={logColor[level]}>[{time.toISOString()}] {level.toUpperCase()}: {data}</p>
    {/each}
</div> 