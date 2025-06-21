<!-- CorrectEventSearch.svelte -->
<script lang="ts">
  import { eventsApi } from "$lib/api";
  import type { Event, Category, EventsListResponse } from "$lib/api";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Pagination } from "$lib/components/ui/pagination";
  import {
    Search,
    Filter,
    X,
    Calendar,
    MapPin,
    DollarSign,
  } from "lucide-svelte";
  import PaginationItem from "../ui/pagination/pagination-item.svelte";

  let {
    onResults,
    categories = [],
    initialEvents = [],
  }: {
    onResults: (events: Event[]) => void;
    categories?: Category[];
    initialEvents?: Event[];
  } = $props();

  // Состояния поиска и фильтрации
  let searchState = $state({
    // ПОИСК (только для suggestions и выполнения поиска)
    searchQuery: "",
    searchResults: [] as Event[], // Результаты последнего поиска
    hasSearched: false, // Был ли выполнен поиск

    // ФИЛЬТРАЦИЯ (применяется к результатам поиска)
    filters: {
      categoryIds: [] as number[],
      priceMin: undefined as number | undefined,
      priceMax: undefined as number | undefined,
      dateFrom: "",
      dateTo: "",
      location: "",
    },

    showFilters: false,
    loading: false,

    pagination: {
      currentPage: 1,
      pageSize: 6,
      totalCount: 0,
      totalPages: 0,
    },
  });

  // Подсказки
  let suggestions = $state<string[]>([]);
  let showSuggestions = $state(false);
  let suggestionsLoading = $state(false);

  let suggestionTimer: ReturnType<typeof setTimeout>;

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

  // События для отображения = результаты поиска ИЛИ изначальные события
  const eventsToFilter = $derived(() => {
    return searchState.hasSearched ? searchState.searchResults : initialEvents;
  });

  // Применяем фильтры к событиям (КЛИЕНТСКАЯ фильтрация)
  const filteredEvents = $derived(() => {
    let events = eventsToFilter();

    // Фильтр по категориям
    if (searchState.filters.categoryIds.length > 0) {
      events = events.filter((event) =>
        searchState.filters.categoryIds.includes(event.category_id),
      );
    }

    // Фильтр по цене
    if (searchState.filters.priceMin !== undefined) {
      events = events.filter(
        (event) => event.price >= searchState.filters.priceMin!,
      );
    }
    if (searchState.filters.priceMax !== undefined) {
      events = events.filter(
        (event) => event.price <= searchState.filters.priceMax!,
      );
    }

    // Фильтр по дате
    if (searchState.filters.dateFrom) {
      events = events.filter(
        (event) => event.date >= searchState.filters.dateFrom,
      );
    }
    if (searchState.filters.dateTo) {
      events = events.filter(
        (event) => event.date <= searchState.filters.dateTo,
      );
    }

    // Фильтр по месту
    if (searchState.filters.location) {
      events = events.filter((event) =>
        event.location
          .toLowerCase()
          .includes(searchState.filters.location.toLowerCase()),
      );
    }

    return events;
  });

  // Пагинация отфильтрованных событий
  const paginatedEvents = $derived(() => {
    const startIndex =
      (searchState.pagination.currentPage - 1) *
      searchState.pagination.pageSize;
    const endIndex = startIndex + searchState.pagination.pageSize;

    // Обновляем общее количество и страницы
    searchState.pagination.totalCount = filteredEvents().length;
    searchState.pagination.totalPages = Math.ceil(
      filteredEvents().length / searchState.pagination.pageSize,
    );

    return filteredEvents().slice(startIndex, endIndex);
  });

  // ПОИСК (только по тексту, БЕЗ фильтров)
  async function performSearch() {
    if (!searchState.searchQuery.trim()) {
      // Если запрос пустой - возвращаемся к изначальным событиям
      searchState.hasSearched = false;
      searchState.searchResults = [];
      searchState.pagination.currentPage = 1;
      showSuggestions = false;
      return;
    }

    searchState.loading = true;
    showSuggestions = false;

    try {
      // Поиск БЕЗ фильтров - только по тексту
      const result = await eventsApi.search({
        search_text: searchState.searchQuery.trim(),
        limit: 100, // Получаем больше результатов для клиентской фильтрации
        offset: 0,
      });

      searchState.searchResults = result.events;
      searchState.hasSearched = true;
      searchState.pagination.currentPage = 1;
    } catch (error) {
      console.error("Search failed:", error);
      searchState.searchResults = [];
      searchState.hasSearched = true;
    } finally {
      searchState.loading = false;
    }
  }

  // Загрузка подсказок (БЕЗ выполнения поиска)
  async function loadSuggestions() {
    if (searchState.searchQuery.length < 2) {
      suggestions = [];
      showSuggestions = false;
      return;
    }

    if (suggestionTimer) clearTimeout(suggestionTimer);

    suggestionTimer = setTimeout(async () => {
      try {
        suggestionsLoading = true;
        const result = await eventsApi.getSuggestions({
          query: searchState.searchQuery,
          max_results: 8,
        });
        suggestions = result.suggestions.map((s) => s.text);
        showSuggestions = suggestions.length > 0;
      } catch (error) {
        suggestions = [];
        showSuggestions = false;
      } finally {
        suggestionsLoading = false;
      }
    }, 300);
  }

  // Обработчики
  function handleSearchInput() {
    loadSuggestions(); // Только подсказки, НЕ поиск!
  }

  function handleSearchSubmit() {
    performSearch(); // Поиск только при submit
  }

  function selectSuggestion(suggestion: string) {
    searchState.searchQuery = suggestion;
    showSuggestions = false;
    performSearch(); // Выполняем поиск при выборе подсказки
  }

  function toggleCategory(categoryId: number) {
    const index = searchState.filters.categoryIds.indexOf(categoryId);
    if (index > -1) {
      searchState.filters.categoryIds.splice(index, 1);
    } else {
      searchState.filters.categoryIds.push(categoryId);
    }
    // Фильтры сбрасывают пагинацию
    searchState.pagination.currentPage = 1;
  }

  function clearSearch() {
    searchState.searchQuery = "";
    searchState.hasSearched = false;
    searchState.searchResults = [];
    suggestions = [];
    showSuggestions = false;
    searchState.pagination.currentPage = 1;
  }

  function clearFilters() {
    searchState.filters = {
      categoryIds: [],
      priceMin: undefined,
      priceMax: undefined,
      dateFrom: "",
      dateTo: "",
      location: "",
    };
    searchState.pagination.currentPage = 1;
  }

  function handlePageChange(page: number) {
    searchState.pagination.currentPage = page;
  }

  // Реактивно обновляем результаты при изменении фильтров или пагинации
  $effect(() => {
    onResults(paginatedEvents());
  });
</script>

<div class="w-full space-y-6">
  <!-- Строка поиска -->
  <form onsubmit={handleSearchSubmit} class="space-y-4">
    <div class="relative">
      <div class="relative">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        />

        <Input
          type="text"
          placeholder="Поиск событий..."
          bind:value={searchState.searchQuery}
          oninput={handleSearchInput}
          onkeydown={(e) => {
            if (e.key === "Escape") {
              showSuggestions = false;
            }
          }}
          class="pl-10 pr-24"
        />

        <div
          class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"
        >
          {#if searchState.searchQuery}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onclick={clearSearch}
              class="h-6 w-6 p-0"
            >
              <X class="h-3 w-3" />
            </Button>
          {/if}

          <Button type="submit" size="sm" disabled={searchState.loading}>
            {#if searchState.loading}
              <div
                class="animate-spin inline-block w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full"
              ></div>
            {:else}
              <Search class="h-3 w-3" />
            {/if}
          </Button>
        </div>
      </div>

      <!-- Подсказки -->
      {#if showSuggestions && suggestions.length > 0}
        <div
          class="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {#if suggestionsLoading}
            <div class="p-3 text-center text-gray-500">
              <div
                class="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"
              ></div>
              <span class="ml-2">Поиск...</span>
            </div>
          {:else}
            {#each suggestions as suggestion}
              <button
                type="button"
                class="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                onclick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  </form>

  <!-- Статус поиска -->
  {#if searchState.hasSearched}
    <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
      <div class="text-sm text-blue-700">
        🔍 Результаты поиска для: <strong>"{searchState.searchQuery}"</strong>
        ({searchState.searchResults.length} найдено)
      </div>
      <Button variant="outline" size="sm" onclick={clearSearch}>
        Показать все события
      </Button>
    </div>
  {/if}

  <!-- Фильтры -->
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <Button
        variant="outline"
        onclick={() => (searchState.showFilters = !searchState.showFilters)}
        class="gap-2"
      >
        <Filter class="h-4 w-4" />
        Фильтры
        {#if hasActiveFilters()}
          <Badge variant="destructive" class="h-4 w-4 p-0 text-xs">
            {searchState.filters.categoryIds.length +
              (searchState.filters.priceMin !== undefined ||
              searchState.filters.priceMax !== undefined
                ? 1
                : 0) +
              (searchState.filters.dateFrom || searchState.filters.dateTo
                ? 1
                : 0) +
              (searchState.filters.location ? 1 : 0)}
          </Badge>
        {/if}
      </Button>

      {#if hasActiveFilters()}
        <Button variant="ghost" size="sm" onclick={clearFilters}>
          Очистить фильтры
        </Button>
      {/if}
    </div>

    {#if searchState.showFilters}
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50"
      >
        <!-- Категории -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Категории</label>
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
          <label class="text-sm font-medium flex items-center gap-1">
            <DollarSign class="h-3 w-3" />
            Цена
          </label>
          <div class="flex gap-2">
            <Input
              type="number"
              placeholder="От"
              bind:value={searchState.filters.priceMin}
              class="text-sm"
            />
            <Input
              type="number"
              placeholder="До"
              bind:value={searchState.filters.priceMax}
              class="text-sm"
            />
          </div>
        </div>

        <!-- Даты -->
        <div class="space-y-2">
          <label class="text-sm font-medium flex items-center gap-1">
            <Calendar class="h-3 w-3" />
            Период
          </label>
          <div class="flex gap-2">
            <Input
              type="date"
              bind:value={searchState.filters.dateFrom}
              class="text-sm"
            />
            <Input
              type="date"
              bind:value={searchState.filters.dateTo}
              class="text-sm"
            />
          </div>
        </div>

        <!-- Место -->
        <div class="space-y-2">
          <label class="text-sm font-medium flex items-center gap-1">
            <MapPin class="h-3 w-3" />
            Место
          </label>
          <Input
            type="text"
            placeholder="Город или адрес"
            bind:value={searchState.filters.location}
            class="text-sm"
          />
        </div>
      </div>
    {/if}

    <!-- Активные фильтры -->
    {#if hasActiveFilters()}
      <div class="flex flex-wrap gap-2">
        {#each searchState.filters.categoryIds as categoryId}
          {@const category = categories.find((c) => c.id === categoryId)}
          {#if category}
            <Badge variant="secondary" class="flex items-center gap-1">
              {category.name}
              <button
                onclick={() => toggleCategory(categoryId)}
                class="hover:text-red-600"
              >
                <X class="h-3 w-3" />
              </button>
            </Badge>
          {/if}
        {/each}

        {#if searchState.filters.priceMin !== undefined || searchState.filters.priceMax !== undefined}
          <Badge variant="secondary" class="flex items-center gap-1">
            Цена: {searchState.filters.priceMin || 0} - {searchState.filters
              .priceMax || "∞"}
            <button
              onclick={() => {
                searchState.filters.priceMin = undefined;
                searchState.filters.priceMax = undefined;
              }}
              class="hover:text-red-600"
            >
              <X class="h-3 w-3" />
            </button>
          </Badge>
        {/if}

        {#if searchState.filters.dateFrom || searchState.filters.dateTo}
          <Badge variant="secondary" class="flex items-center gap-1">
            Период: {searchState.filters.dateFrom || "..."} - {searchState
              .filters.dateTo || "..."}
            <button
              onclick={() => {
                searchState.filters.dateFrom = "";
                searchState.filters.dateTo = "";
              }}
              class="hover:text-red-600"
            >
              <X class="h-3 w-3" />
            </button>
          </Badge>
        {/if}

        {#if searchState.filters.location}
          <Badge variant="secondary" class="flex items-center gap-1">
            Место: {searchState.filters.location}
            <button
              onclick={() => {
                searchState.filters.location = "";
              }}
              class="hover:text-red-600"
            >
              <X class="h-3 w-3" />
            </button>
          </Badge>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Информация о результатах и пагинация -->
  {#if searchState.pagination.totalCount > 0}
    <div class="flex flex-col items-center space-y-4">
      <div class="text-sm text-gray-600 text-center">
        {#if searchState.hasSearched}
          Найдено {filteredEvents().length} из {searchState.searchResults
            .length} результатов поиска
        {:else}
          Всего {filteredEvents().length} событий
        {/if}
        {#if searchState.pagination.totalPages > 1}
          (страница {searchState.pagination.currentPage} из {searchState
            .pagination.totalPages})
        {/if}
      </div>

      {#if searchState.pagination.totalPages > 1}
        <PaginationItem
          totalPages={searchState.pagination.totalPages}
          currentPage={searchState.pagination.currentPage}
          onPageChange={handlePageChange}
          siblingCount={1}
          class="justify-center"
        />
      {/if}
    </div>
  {:else}
    <div class="text-center py-8 text-gray-500">
      {#if searchState.hasSearched}
        😔 По вашему запросу ничего не найдено
      {:else}
        📅 События не найдены
      {/if}
    </div>
  {/if}
</div>
