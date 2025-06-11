<script lang="ts">
  import type { Category } from "$lib/api";

  import NoResults from "$lib/components/ui/NoResults.svelte";

  let { categories }: { categories: Category[] } = $props();
</script>

<div class="space-y-4">
  <h3 class="font-bold text-3xl">События</h3>
  {#if categories.length > 0}
    <NoResults />
  {/if}
  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
  ></div>
</div>
