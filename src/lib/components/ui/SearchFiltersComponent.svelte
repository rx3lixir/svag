<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Calendar, MapPin, DollarSign } from "lucide-svelte";
  import type { Category } from "$lib/api";

  let {
    categories = [],
    selectedCategories = $bindable([]),
    minPrice = $bindable(undefined),
    maxPrice = $bindable(undefined),
    dateFrom = $bindable(""),
    dateTo = $bindable(""),
    location = $bindable(""),
    onClearFilters,
    onToggleCategory,
  }: {
    categories?: Category[];
    selectedCategories?: number[];
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    dateFrom?: string;
    dateTo?: string;
    location?: string;
    onClearFilters: () => void;
    onToggleCategory: (categoryId: number) => void;
  } = $props();
</script>

<div class="border rounded-lg p-4 space-y-4 bg-gray-50">
  <!-- Filters header -->
  <div class="flex items-center justify-between">
    <h3 class="font-medium">Фильтры</h3>
    <Button variant="ghost" size="sm" onclick={onClearFilters}>
      Очистить все
    </Button>
  </div>

  <!-- Filters grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Categories filter -->
    <div class="space-y-2">
      <label class="text-sm font-medium" for="categories">Категории</label>
      <div class="flex flex-wrap gap-2">
        {#each categories as category}
          <Badge
            variant={selectedCategories.includes(category.id)
              ? "default"
              : "outline"}
            class="cursor-pointer"
            onclick={() => onToggleCategory(category.id)}
          >
            {category.name}
          </Badge>
        {/each}
      </div>
    </div>

    <!-- Price range filter -->
    <div class="space-y-2">
      <label class="text-sm font-medium flex items-center gap-1" for="price">
        <DollarSign class="h-3 w-3" />
        Цена
      </label>
      <div class="flex gap-2">
        <Input
          type="number"
          placeholder="От"
          bind:value={minPrice}
          class="text-sm"
          id="minPrice"
        />
        <Input
          type="number"
          placeholder="До"
          bind:value={maxPrice}
          class="text-sm"
          id="maxPrice"
        />
      </div>
    </div>

    <!-- Date range filter -->
    <div class="space-y-2">
      <label class="text-sm font-medium flex items-center gap-1" for="dates">
        <Calendar class="h-3 w-3" />
        Даты
      </label>
      <div class="flex gap-2">
        <Input
          type="date"
          bind:value={dateFrom}
          class="text-sm"
          id="dateFrom"
        />
        <Input type="date" bind:value={dateTo} class="text-sm" id="dateTo" />
      </div>
    </div>

    <!-- Location filter -->
    <div class="space-y-2">
      <label class="text-sm font-medium flex items-center gap-1" for="location">
        <MapPin class="h-3 w-3" />
        Место
      </label>
      <Input
        type="text"
        placeholder="Город или адрес"
        bind:value={location}
        class="text-sm"
        id="location"
      />
    </div>
  </div>
</div>
