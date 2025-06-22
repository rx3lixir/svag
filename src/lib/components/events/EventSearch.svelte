<script lang="ts">
  import { eventsApi } from "$lib/api";
  import type {
    Event,
    Category,
    EventsListResponse,
    Suggestion,
  } from "$lib/api";
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
    Clock,
  } from "lucide-svelte";

  let {
    onResults,
    categories = [],
    initialEvents = [],
  }: {
    onResults: (events: Event[], pagination?: any) => void;
    categories?: Category[];
    initialEvents?: Event[];
  } = $props();

  // Состояние поиска и фильтров
  let searchState = $state({
    query: "",
    showSuggestions: false,
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

  // Состояние пагинации
  let paginationState = $state({
    currentPage: 1,
    limit: 3, // Для тестирования
    totalPages: 1,
    hasMore: false,
    totalCount: 0,
  });

  // Автокомплит
  let suggestions = $state<Suggestion[]>([]);
  let selectedSuggestionIndex = $state(-1);
  let searchInputElement: HTMLInputElement;

  // Debounce таймеры
  let searchTimeout: ReturnType<typeof setTimeout>;
  let suggestionsTimeout: ReturnType<typeof setTimeout>;

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
  async function performSearch(
    page: number = 1,
    updatePagination: boolean = true,
  ) {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(async () => {
      // Если нет запроса и фильтров на первой странице - показываем изначальные события
      if (page === 1 && !searchState.query.trim() && !hasActiveFilters()) {
        onResults(initialEvents);
        if (updatePagination) {
          paginationState.currentPage = 1;
          paginationState.totalPages = 1;
          paginationState.hasMore = false;
          paginationState.totalCount = initialEvents.length;
        }
        return;
      }

      searchState.loading = true;

      try {
        const offset = (page - 1) * paginationState.limit;

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
          limit: paginationState.limit,
          offset: offset,
          include_count: true, // Всегда запрашиваем общее количество
        };

        let result: EventsListResponse;

        // Используем search для текстовых запросов, getAll для фильтров
        if (searchState.query.trim()) {
          result = await eventsApi.search(filters);
        } else {
          result = await eventsApi.getAll(filters);
        }

        onResults(result.events, result.pagination);

        // Обновляем пагинацию
        if (updatePagination && result.pagination) {
          paginationState.totalCount = Number(result.pagination.total_count);
          paginationState.totalPages = Math.ceil(
            paginationState.totalCount / paginationState.limit,
          );
          paginationState.hasMore = result.pagination.has_more;
          paginationState.currentPage = page;
        }
      } catch (error) {
        console.error("Search failed:", error);
        onResults([]);
      } finally {
        searchState.loading = false;
      }
    }, 300);
  }

  // Загрузка подсказок
  async function loadSuggestions() {
    if (searchState.query.length < 2) {
      suggestions = [];
      searchState.showSuggestions = false;
      selectedSuggestionIndex = -1;
      return;
    }

    clearTimeout(suggestionsTimeout);

    suggestionsTimeout = setTimeout(async () => {
      try {
        const result = await eventsApi.getSuggestions({
          query: searchState.query,
          max_results: 8,
          fields: ["name", "location"],
        });

        suggestions = result.suggestions;
        searchState.showSuggestions = suggestions.length > 0;
        selectedSuggestionIndex = -1;
      } catch (error) {
        console.error("Failed to load suggestions:", error);
        suggestions = [];
        searchState.showSuggestions = false;
      }
    }, 150); // Быстрее для автокомплита
  }

  // Обработчики событий
  function handleQueryChange() {
    loadSuggestions();
    // Сброс на первую страницу при изменении запроса
    performSearch(1, true);
  }

  function selectSuggestion(suggestion: Suggestion) {
    searchState.query = suggestion.text;
    searchState.showSuggestions = false;
    selectedSuggestionIndex = -1;
    searchInputElement.blur();
    performSearch(1, true);
  }

  // Навигация по подсказкам с клавиатуры
  function handleKeyDown(event: KeyboardEvent) {
    if (!searchState.showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        selectedSuggestionIndex = Math.min(
          selectedSuggestionIndex + 1,
          suggestions.length - 1,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
        break;
      case "Enter":
        event.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(suggestions[selectedSuggestionIndex]);
        } else {
          searchState.showSuggestions = false;
          performSearch(1, true);
        }
        break;
      case "Escape":
        searchState.showSuggestions = false;
        selectedSuggestionIndex = -1;
        break;
    }
  }

  function toggleCategory(categoryId: number) {
    const index = searchState.filters.categoryIds.indexOf(categoryId);
    if (index > -1) {
      searchState.filters.categoryIds.splice(index, 1);
    } else {
      searchState.filters.categoryIds.push(categoryId);
    }
    performSearch(1, true); // Сброс на первую страницу
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
    performSearch(1, true); // Сброс на первую страницу
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
    searchState.showSuggestions = false;
    selectedSuggestionIndex = -1;
    paginationState.currentPage = 1;
    onResults(initialEvents);
  }

  // Функция для смены страницы
  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > paginationState.totalPages) return;
    performSearch(newPage, true);
  }

  // Реактивный поиск при изменении фильтров
  $effect(() => {
    if (
      searchState.filters.priceMin !== undefined ||
      searchState.filters.priceMax !== undefined
    ) {
      performSearch(1, true);
    }
  });

  $effect(() => {
    if (searchState.filters.dateFrom || searchState.filters.dateTo) {
      performSearch(1, true);
    }
  });

  $effect(() => {
    if (searchState.filters.location) {
      performSearch(1, true);
    }
  });

  // Скрытие подсказок при клике вне элемента
  function handleDocumentClick(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest(".search-container")) {
      searchState.showSuggestions = false;
      selectedSuggestionIndex = -1;
    }
  }

  // Добавляем и убираем обработчик при монтировании/размонтировании
  $effect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  });

  // Функция для получения иконки по типу подсказки
  function getSuggestionIcon(type: string) {
    switch (type) {
      case "event":
        return Clock;
      case "location":
        return MapPin;
      default:
        return Search;
    }
  }
</script>

<div class="w-full space-y-4">
  <!-- Основная строка поиска -->
  <div class="relative search-container">
    <div class="relative">
      <Search
        class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
      />

      <Input
        bind:this={searchInputElement}
        type="text"
        placeholder="Поиск событий..."
        bind:value={searchState.query}
        oninput={handleQueryChange}
        onkeydown={handleKeyDown}
        onfocus={() => {
          if (suggestions.length > 0) {
            searchState.showSuggestions = true;
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
              searchState.showSuggestions = false;
              performSearch(1, true);
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

    <!-- Подсказки автокомплита -->
    {#if searchState.showSuggestions && suggestions.length > 0}
      <div
        class="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
      >
        {#each suggestions as suggestion, index}
          {@const Icon = getSuggestionIcon(suggestion.type)}
          <button
            class="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3 {index ===
            selectedSuggestionIndex
              ? 'bg-blue-50 border-blue-200'
              : ''}"
            onclick={() => selectSuggestion(suggestion)}
          >
            <Icon class="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div class="flex-1">
              <div class="font-medium text-sm">{suggestion.text}</div>
              {#if suggestion.category || suggestion.type}
                <div class="text-xs text-gray-500">
                  {suggestion.category || suggestion.type}
                </div>
              {/if}
            </div>
            {#if suggestion.score}
              <div class="text-xs text-gray-400">
                {Math.round(suggestion.score * 100)}%
              </div>
            {/if}
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

  <!-- Информация о результатах и пагинация -->
  {#if paginationState.totalCount > 0}
    <div class="flex items-center justify-between text-sm text-gray-600">
      <div>
        Показано {(paginationState.currentPage - 1) * paginationState.limit +
          1}-{Math.min(
          paginationState.currentPage * paginationState.limit,
          paginationState.totalCount,
        )}
        из {paginationState.totalCount} событий
      </div>

      <!-- Простая пагинация -->
      {#if paginationState.totalPages > 1}
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onclick={() => handlePageChange(paginationState.currentPage - 1)}
            disabled={paginationState.currentPage === 1}
          >
            Назад
          </Button>

          <span class="px-2">
            {paginationState.currentPage} из {paginationState.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onclick={() => handlePageChange(paginationState.currentPage + 1)}
            disabled={paginationState.currentPage ===
              paginationState.totalPages}
          >
            Вперед
          </Button>
        </div>
      {/if}
    </div>
  {/if}
</div>
