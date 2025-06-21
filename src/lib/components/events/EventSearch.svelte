<script lang="ts">
  import { eventsApi } from "$lib/api";
  import type { Event, Category, EventsListResponse } from "$lib/api";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import {
    Search,
    X,
    ChevronDown,
    Calendar,
    MapPin,
    DollarSign,
  } from "lucide-svelte";

  let {
    onResults,
    categories = [],
    initialEvents = [],
  }: {
    onResults: (events: Event[]) => void;
    categories?: Category[];
    initialEvents?: Event[];
  } = $props();

  // Единое состояние поиска
  let searchState = $state({
    query: "",
    showFilters: false,
    loading: false,
    filters: {
      categoryIds: [] as number[],
      priceMin: undefined as number | undefined,
      priceMax: undefined as number | undefined,
      dateFrom: "",
      dateTo: "",
      location: "",
    },
  });

  // Подсказки (опционально)
  let suggestions = $state<string[]>([]);
  let showSuggestions = $state(false);

  // Debounced поиск
  let searchTimeout: ReturnType<typeof setTimeout>;

  // Проверяем есть ли активные фильтры
  const hasActiveFilters = $derived(() => {
    const f = searchState.filters;
    return (
      f.categoryIds.length > 0 ||
      f.priceMin !== undefined ||
      f.priceMax !== undefined ||
      f.dateFrom ||
      f.dateTo ||
      f.location
    );
  });

  // Основная функция поиска
  async function performSearch() {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(async () => {
      // Если нет запроса и фильтров - показываем изначальные события
      if (!searchState.query.trim() && !hasActiveFilters()) {
        onResults(initialEvents);
        return;
      }

      searchState.loading = true;

      try {
        const filters = {
          search_text: searchState.query.trim() || undefined,
          category_ids:
            searchState.filters.categoryIds.length > 0
              ? searchState.filters.categoryIds
              : undefined,
          min_price: searchState.filters.priceMin,
          max_price: searchState.filters.priceMax,
          date_from: searchState.filters.dateFrom || undefined,
          date_to: searchState.filters.dateTo || undefined,
          location: searchState.filters.location || undefined,
          limit: 50,
          offset: 0,
        };

        let result: EventsListResponse;

        // Если есть текстовый запрос - используем search, иначе getAll
        if (searchState.query.trim()) {
          result = await eventsApi.search(filters);
        } else {
          result = await eventsApi.getAll(filters);
        }

        onResults(result.events);
      } catch (error) {
        console.error("Search failed:", error);
        onResults([]);
      } finally {
        searchState.loading = false;
      }
    }, 300);
  }

  // Простой поиск подсказок
  async function loadSuggestions() {
    if (searchState.query.length < 2) {
      suggestions = [];
      showSuggestions = false;
      return;
    }

    try {
      const result = await eventsApi.getSuggestions({
        query: searchState.query,
        max_results: 5,
      });
      suggestions = result.suggestions.map((s) => s.text);
      showSuggestions = suggestions.length > 0;
    } catch (error) {
      suggestions = [];
      showSuggestions = false;
    }
  }

  // Обработчики событий
  function handleQueryChange() {
    loadSuggestions();
    performSearch();
  }

  function selectSuggestion(suggestion: string) {
    searchState.query = suggestion;
    showSuggestions = false;
    performSearch();
  }

  function toggleCategory(categoryId: number) {
    const index = searchState.filters.categoryIds.indexOf(categoryId);
    if (index > -1) {
      searchState.filters.categoryIds.splice(index, 1);
    } else {
      searchState.filters.categoryIds.push(categoryId);
    }
    performSearch();
  }

  function removeFilter(type: string, value?: any) {
    switch (type) {
      case "category":
        searchState.filters.categoryIds =
          searchState.filters.categoryIds.filter((id) => id !== value);
        break;
      case "price":
        searchState.filters.priceMin = undefined;
        searchState.filters.priceMax = undefined;
        break;
      case "date":
        searchState.filters.dateFrom = "";
        searchState.filters.dateTo = "";
        break;
      case "location":
        searchState.filters.location = "";
        break;
    }
    performSearch();
  }

  function clearAll() {
    searchState.query = "";
    searchState.filters = {
      categoryIds: [],
      priceMin: undefined,
      priceMax: undefined,
      dateFrom: "",
      dateTo: "",
      location: "",
    };
    suggestions = [];
    showSuggestions = false;
    onResults(initialEvents);
  }

  // Реактивный поиск при изменении фильтров
  $effect(() => {
    if (
      searchState.filters.priceMin !== undefined ||
      searchState.filters.priceMax !== undefined
    ) {
      performSearch();
    }
  });

  $effect(() => {
    if (searchState.filters.dateFrom || searchState.filters.dateTo) {
      performSearch();
    }
  });

  $effect(() => {
    if (searchState.filters.location) {
      performSearch();
    }
  });
</script>

<div class="w-full space-y-4">
  <!-- Основная строка поиска -->
  <div class="relative">
    <div class="relative">
      <Search
        class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
      />

      <Input
        type="text"
        placeholder="Поиск событий..."
        bind:value={searchState.query}
        oninput={handleQueryChange}
        onkeydown={(e) => {
          if (e.key === "Enter") {
            showSuggestions = false;
            performSearch();
          }
          if (e.key === "Escape") {
            showSuggestions = false;
          }
        }}
        class="pl-10 pr-20"
      />

      <!-- Кнопки справа -->
      <div
        class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"
      >
        {#if searchState.query}
          <Button
            variant="ghost"
            size="sm"
            onclick={() => {
              searchState.query = "";
              performSearch();
            }}
            class="h-6 w-6 p-0"
          >
            <X class="h-3 w-3" />
          </Button>
        {/if}

        <Button
          variant="ghost"
          size="sm"
          onclick={() => (searchState.showFilters = !searchState.showFilters)}
          class="h-6 px-2"
        >
          <ChevronDown
            class="h-3 w-3 {searchState.showFilters
              ? 'rotate-180'
              : ''} transition-transform"
          />
          {#if hasActiveFilters()}
            <Badge variant="destructive" class="ml-1 h-4 w-4 p-0 text-xs">
              {searchState.filters.categoryIds.length +
                (searchState.filters.priceMin !== undefined ? 1 : 0) +
                (searchState.filters.dateFrom ? 1 : 0) +
                (searchState.filters.location ? 1 : 0)}
            </Badge>
          {/if}
        </Button>
      </div>
    </div>

    <!-- Подсказки -->
    {#if showSuggestions && suggestions.length > 0}
      <div
        class="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
      >
        {#each suggestions as suggestion}
          <button
            class="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
            onclick={() => selectSuggestion(suggestion)}
          >
            {suggestion}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Панель фильтров -->
  {#if searchState.showFilters}
    <div class="border rounded-lg p-4 space-y-4 bg-gray-50">
      <div class="flex items-center justify-between">
        <h3 class="font-medium">Фильтры</h3>
        <Button variant="ghost" size="sm" onclick={clearAll}>
          Очистить все
        </Button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Категории -->
        <div class="space-y-2">
          <label for="categories" class="text-sm font-medium">Категории</label>
          <div class="flex flex-wrap gap-2">
            {#each categories as category}
              <Badge
                variant={searchState.filters.categoryIds.includes(category.id)
                  ? "default"
                  : "outline"}
                class="cursor-pointer"
                onclick={() => toggleCategory(category.id)}
              >
                {category.name}
              </Badge>
            {/each}
          </div>
        </div>

        <!-- Цена -->
        <div class="space-y-2">
          <label
            for="price-min"
            class="text-sm font-medium flex items-center gap-1"
          >
            <DollarSign class="h-3 w-3" />
            Цена
          </label>
          <div class="flex gap-2">
            <Input
              id="price-min"
              type="number"
              placeholder="От"
              bind:value={searchState.filters.priceMin}
              class="text-sm"
            />
            <Input
              id="price-max"
              type="number"
              placeholder="До"
              bind:value={searchState.filters.priceMax}
              class="text-sm"
            />
          </div>
        </div>

        <!-- Даты -->
        <div class="space-y-2">
          <label
            for="date-from"
            class="text-sm font-medium flex items-center gap-1"
          >
            <Calendar class="h-3 w-3" />
            Период
          </label>
          <div class="flex gap-2">
            <Input
              id="date-from"
              type="date"
              bind:value={searchState.filters.dateFrom}
              class="text-sm"
            />
            <Input
              id="date-to"
              type="date"
              bind:value={searchState.filters.dateTo}
              class="text-sm"
            />
          </div>
        </div>

        <!-- Место -->
        <div class="space-y-2">
          <label
            for="location"
            class="text-sm font-medium flex items-center gap-1"
          >
            <MapPin class="h-3 w-3" />
            Место
          </label>
          <Input
            id="location"
            type="text"
            placeholder="Город или адрес"
            bind:value={searchState.filters.location}
            class="text-sm"
          />
        </div>
      </div>
    </div>
  {/if}

  <!-- Активные фильтры -->
  {#if hasActiveFilters()}
    <div class="flex flex-wrap gap-2">
      <!-- Категории -->
      {#each searchState.filters.categoryIds as categoryId}
        {@const category = categories.find((c) => c.id === categoryId)}
        {#if category}
          <Badge variant="secondary" class="flex items-center gap-1">
            {category.name}
            <button
              onclick={() => removeFilter("category", categoryId)}
              class="hover:text-red-600"
            >
              <X class="h-3 w-3" />
            </button>
          </Badge>
        {/if}
      {/each}

      <!-- Цена -->
      {#if searchState.filters.priceMin !== undefined || searchState.filters.priceMax !== undefined}
        <Badge variant="secondary" class="flex items-center gap-1">
          Цена: {searchState.filters.priceMin || 0} - {searchState.filters
            .priceMax || "∞"}
          <button
            onclick={() => removeFilter("price")}
            class="hover:text-red-600"
          >
            <X class="h-3 w-3" />
          </button>
        </Badge>
      {/if}

      <!-- Период -->
      {#if searchState.filters.dateFrom || searchState.filters.dateTo}
        <Badge variant="secondary" class="flex items-center gap-1">
          Период: {searchState.filters.dateFrom || "..."} - {searchState.filters
            .dateTo || "..."}
          <button
            onclick={() => removeFilter("date")}
            class="hover:text-red-600"
          >
            <X class="h-3 w-3" />
          </button>
        </Badge>
      {/if}

      <!-- Место -->
      {#if searchState.filters.location}
        <Badge variant="secondary" class="flex items-center gap-1">
          Место: {searchState.filters.location}
          <button
            onclick={() => removeFilter("location")}
            class="hover:text-red-600"
          >
            <X class="h-3 w-3" />
          </button>
        </Badge>
      {/if}
    </div>
  {/if}

  <!-- Индикатор загрузки -->
  {#if searchState.loading}
    <div class="flex items-center justify-center py-4">
      <div
        class="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full"
      ></div>
      <span class="ml-2 text-gray-600">Поиск событий...</span>
    </div>
  {/if}
</div>
