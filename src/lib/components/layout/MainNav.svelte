<script lang="ts">
  import type { Category } from "$lib/api";

  import Navbar from "./Navbar.svelte";
  import UserMenu from "./UserMenu.svelte";

  import * as Sidebar from "../ui/sidebar/index.js";

  let { categories }: { categories: Category[] } = $props();
</script>

<header
  class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
>
  <div class="flex items-center gap-2 px-4">
    <Sidebar.Trigger />
    <nav class="flex items-center space-x-4">
      <span class="font-semibold">Агрегатор</span>
      <Navbar {categories} />
      <div class="ml-auto">
        <UserMenu />
      </div>
    </nav>
  </div>
</header>
