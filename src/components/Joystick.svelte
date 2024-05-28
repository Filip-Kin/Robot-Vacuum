<script lang="ts">
    import type { Joystick } from "../server/types";

    export let joystick: Joystick;
</script>

<div class="flex gap-2">
    <div class="flex flex-col w-48 gap-2 justify-center text-xl text-center">
        <div class="font-bold">
            <p>{joystick.id}</p>
            <p>Index: {joystick.index}</p>
        </div>
    </div>
    <div class="grid grid-rows-10 grid-flow-col">
        {#each joystick.axes as axis, index}
            <div class="grid grid-cols-[28px_minmax(6rem,_1fr)] mx-1 items-center">
                <p>{index}:</p>
                <div class="w-24 h-5 ring-1 ring-gray-500">
                    <div class="h-5 bg-green-600 leading-5 pl-1" style="width: {axis * 50 + 50}%">{axis.toFixed(2)}</div>
                </div>
            </div>
        {/each}
        {#each joystick.buttons as button, index}
            <div class="grid grid-cols-[28px_minmax(6rem,_1fr)] mx-1 items-center">
                <p>{index}:</p>
                <div class="w-8 h-5 ring-1 ring-gray-500">
                    <div class="h-5 {button && "bg-green-600"}"></div>
                </div>
            </div>
        {/each}
    </div>
</div>
