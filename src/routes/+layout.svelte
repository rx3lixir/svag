<script lang="ts">
  import Footer from "$lib/components/layout/Footer.svelte";
  import Navbar from "$lib/components/layout/Navbar.svelte";

  import "../app.css";

  let { data, children }: { data: any; children: any } = $props();
</script>

<div class="min-h-screen flex">
  <div class="flex flex-col flex-1">
    <!-- Header -->
    <Navbar categories={data.categories} />

    <!-- Main content that renders in +page.svelte-->
    <main class="flex-1 p-4">
      {@render children?.(data)}
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</div>
