<script lang="ts">
  import Footer from "$lib/components/layout/Footer.svelte";
  import CatSidebar from "$lib/components/layout/CatSidebar.svelte";
  import MainNav from "$lib/components/layout/MainNav.svelte";

  import * as Sidebar from "$lib/components/ui/sidebar/index.js";

  import "../app.css";

  let { data, children }: { data: any; children: any } = $props();
</script>

<Sidebar.Provider>
  <div class="min-h-screen flex">
    <!-- Sidebar logic -->
    <CatSidebar categories={data.categories} />

    <Sidebar.Inset class="flex flex-col flex-1">
      <!-- Header -->
      <MainNav categories={data.categories} />

      <!-- Main content that renders in +page.svelte-->
      <main class="flex-1 p-4">
        {@render children?.(data)}
      </main>

      <!-- Footer -->
      <Footer />
    </Sidebar.Inset>
  </div>
</Sidebar.Provider>
