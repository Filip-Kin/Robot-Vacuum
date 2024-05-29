<script lang="ts">
    export let label = "";
    export let value: number = 0;
    export let max: number = 100;
    export let min: number = 0;

    let range = max - min;
    let percent = (value - min) / range * 100;

    $: {
        range = max - min;
        percent = ((min < 0) ? (value + (range / 2)) : value) / range * 100;
    }
</script>

<div class="flex flex-col gap-2">
    <div class="flex justify-between">
        <p class="font-bold">{label}</p>
        <p>{value}</p>
    </div>
    <div class="relative h-4 bg-gray-200 rounded">
        {#if min < 0}
            <div class="absolute top-0 left-0 h-4 bg-red-500 rounded" style="width: {percent}%"></div>
        {:else}
        <div class="absolute top-0 left-0 h-4 bg-blue-500 rounded" style="width: {percent}%"></div>
        {/if}
    </div>
</div>
