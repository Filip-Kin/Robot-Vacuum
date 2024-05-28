<script lang="ts">
    import { Route, Router } from 'svelte-routing';
    import Home from './pages/Home.svelte';
</script>

<Router basepath='/'>
    <Route path='/' component={Home} />
</Router>