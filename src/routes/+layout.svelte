<script lang="ts">
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";

  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import CatSidebar from "$lib/components/layout/CatSidebar.svelte";

  import "../app.css";

  let { data, children }: { data: any; children: any } = $props();
</script>

<Sidebar.Provider>
  <div class="min-h-screen flex flex-col">
    <Navbar categories={data.categories} />

    <div class="flex flex-1">
      <CatSidebar categories={data.categories} />
      <main class="flex-1">
        {@render children?.()}
      </main>
    </div>

    <Footer />
  </div>
</Sidebar.Provider>
