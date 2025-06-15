<script lang="ts">
  import type { Category } from "$lib/api";
  import { Tickets } from "lucide-svelte";
  import MainNav from "./MainNav.svelte";

  import Container from "../ui/Container.svelte";
  import UserMenu from "./UserMenu.svelte";
  let { categories }: { categories: Category[] } = $props();
</script>

<div class="border-b">
  <Container>
    <div class="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center">
      <div class="ml-4 flex lg:ml-0 gap-x-2">
        <p class="">
          <Tickets size={30} />
        </p>
      </div>
      <MainNav {categories} />
      <span class="ml-auto">
        <UserMenu />
      </span>
    </div>
  </Container>
</div>
