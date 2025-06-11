<script lang="ts">
  import Navbar from "$lib/components/layout/Navbar.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import CatSidebar from "$lib/components/layout/CatSidebar.svelte";

  import * as Sidebar from "$lib/components/ui/sidebar/index.js";

  import "../app.css";
  import UserMenu from "$lib/components/layout/UserMenu.svelte";

  let { data, children }: { data: any; children: any } = $props();
</script>

<Sidebar.Provider>
  <div class="min-h-screen flex">
    <!-- Sidebar logic -->
    <CatSidebar categories={data.categories} />

    <Sidebar.Inset class="flex flex-col flex-1">
      <!-- Header -->
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4">
          <Sidebar.Trigger />
          <nav class="flex items-center space-x-4">
            <span class="font-semibold">Агрегатор</span>
            <Navbar categories={data.categories} />
            <div class="ml-auto">
              <UserMenu />
            </div>
          </nav>
        </div>
      </header>

      <!-- Main content renders in +page.svelte-->
      <main class="flex-1 p-4">
        {@render children?.()}
      </main>

      <!-- Footer -->
      <Footer />
    </Sidebar.Inset>
  </div>
</Sidebar.Provider>
