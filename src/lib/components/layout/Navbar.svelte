<script lang="ts">
  import type { Category } from "$lib/api";

  let { categories }: { categories: Category[] } = $props();
</script>

<!-- This navbar is now integrated into the main layout -->
<!-- You can add additional navigation items here if needed -->
<div class="flex items-center space-x-4">
  {#each categories.slice(0, 3) as category}
    <a
      href="/"
      class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {category.name}
    </a>
  {/each}
</div>
