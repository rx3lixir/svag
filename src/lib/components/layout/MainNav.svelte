<script lang="ts">
  import type { Category } from "$lib/api";
  import { cn } from "$lib/utils";

  let { categories }: { categories: Category[] } = $props();
</script>

<nav class="mx-6 flex items-center space-x-4 lg:space-x-6">
  {#each categories as category}
    <a
      href={`/${category.id}`}
      class={cn("text-sm font-medium transition-colors hover:text-black")}
    >
      {category.name}
    </a>
  {/each}
</nav>
