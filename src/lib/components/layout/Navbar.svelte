<script lang="ts">
  import type { Category } from "$lib/api";

  import Container from "../ui/Container.svelte";
  import MainNav from "./MainNav.svelte";
  import UserMenu from "./UserMenu.svelte";

  import { Ticket } from "lucide-svelte";

  let { categories = [] }: { categories: Category[] } = $props();
</script>

<div class="border-b">
  <Container>
    <div class="flex items-center relative px-4 sm:px-6 lg:px-8 h-16">
      <!-- Logo -->

      <a href="/" class="ml-2 flex lg:ml-0 gap-x-2">
        <Ticket size={30} />
      </a>

      <!-- Main Navigation -->
      <MainNav {categories} />

      <!-- User Actions -->
      <UserMenu />
    </div>
  </Container>
</div>
