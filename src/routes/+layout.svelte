<script lang="ts">
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import type { LayoutData } from "./types";

  let { data, children } = $props();
</script>

<div class="min-h-screen flex flex-col">
  <Navbar categories={data.categories} />

  <main class="flex-1">
    {@render children?.()}
  </main>

  <Footer />
</div>
