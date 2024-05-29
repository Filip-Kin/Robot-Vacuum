<script lang="ts">
    export let label = "";
    export let value: boolean = false;
</script>

<div class="max-w-48 flex flex-col text-center">
    <p class="font-bold">{label}</p>
    <div class="w-full h-8 rounded">
        <div class="h-8 {value ? "bg-green-400":"bg-red-500"} rounded">
            <p class="leading-8">{value ? 'True' : 'False'}</p>
        </div>
    </div>
</div>