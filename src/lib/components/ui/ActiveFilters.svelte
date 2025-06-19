<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { X } from "lucide-svelte";
  import type { Category } from "$lib/api";

  let {
    categories = [],
    selectedCategories = [],
    minPrice,
    maxPrice,
    dateFrom = "",
    dateTo = "",
    location = "",
    onRemoveCategory,
    onClearPriceFilter,
    onClearDateFilter,
    onClearLocationFilter,
  }: {
    categories?: Category[];
    selectedCategories?: number[];
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    dateFrom?: string;
    dateTo?: string;
    location?: string;
    onRemoveCategory: (categoryId: number) => void;
    onClearPriceFilter: () => void;
    onClearDateFilter: () => void;
    onClearLocationFilter: () => void;
  } = $props();

  // Показываем только если есть активные фильтры
  const hasActiveFilters = $derived(
    selectedCategories.length > 0 ||
      minPrice !== undefined ||
      maxPrice !== undefined ||
      dateFrom ||
      dateTo ||
      location,
  );
</script>

{#if hasActiveFilters}
  <div class="flex flex-wrap gap-2">
    <!-- Category badges -->
    {#each selectedCategories as categoryId}
      {@const category = categories.find((c) => c.id === categoryId)}
      {#if category}
        <Badge variant="secondary" class="flex items-center gap-1">
          {category.name}
          <button
            onclick={() => onRemoveCategory(categoryId)}
            class="hover:text-red-600"
          >
            <X class="h-3 w-3" />
          </button>
        </Badge>
      {/if}
    {/each}

    <!-- Price range badge -->
    {#if minPrice !== undefined || maxPrice !== undefined}
      <Badge variant="secondary" class="flex items-center gap-1">
        Цена: {minPrice || 0} - {maxPrice || "∞"}
        <button onclick={onClearPriceFilter} class="hover:text-red-600">
          <X class="h-3 w-3" />
        </button>
      </Badge>
    {/if}

    <!-- Date range badge -->
    {#if dateFrom || dateTo}
      <Badge variant="secondary" class="flex items-center gap-1">
        Период: {dateFrom || "..."} - {dateTo || "..."}
        <button onclick={onClearDateFilter} class="hover:text-red-600">
          <X class="h-3 w-3" />
        </button>
      </Badge>
    {/if}

    <!-- Location badge -->
    {#if location}
      <Badge variant="secondary" class="flex items-center gap-1">
        Место: {location}
        <button onclick={onClearLocationFilter} class="hover:text-red-600">
          <X class="h-3 w-3" />
        </button>
      </Badge>
    {/if}
  </div>
{/if}
