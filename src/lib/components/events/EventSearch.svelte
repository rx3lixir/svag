<script lang="ts">
  import { eventsApi } from "$lib/api";
  import type {
    Event,
    Category,
    EventsListResponse,
    Suggestion,
    SearchFilters,
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
    Lightbulb,
  } from "lucide-svelte";

  let {
    onResults,
    categories = [],
    initialEvents = [],
    onPaginationChange,
    searchAPI = $bindable(),
  }: {
    onResults: (events: Event[], pagination?: any) => void;
    onPaginationChange?: (pagination: any) => void;
    categories?: Category[];
    initialEvents?: Event[];
    searchAPI?: any;
  } = $props();

  // Глобальное состояние
  let searchQuery = $state("");
  let showFilters = $state(false);
  let loading = $state(false);

  // Фильтры
  let selectedCategories = $state<number[]>([]);
  let priceMin = $state<number | undefined>();
  let priceMax = $state<number | undefined>();
  let dateFrom = $state("");
  let dateTo = $state("");
  let locationFilter = $state("");

  // Автокомплит - теперь отдельно от поиска
  let suggestions = $state<Suggestion[]>([]);
  let showSuggestions = $state(false);
  let selectedSuggestionIndex = $state(-1);

  // Пагинация
  let currentPage = $state(1);
  let limit = $state(12);
  let totalPages = $state(1);
  let totalCount = $state(0);

  // Таймауты
  let suggestionsTimeout: ReturnType<typeof setTimeout>;
  let priceChangeTimeout: ReturnType<typeof setTimeout>;
  let locationChangeTimeout: ReturnType<typeof setTimeout>;
  let searchInputElement: any;

  // Проверяем есть ли активные фильтры
  const hasActiveFilters = $derived(() => {
    return (
      selectedCategories.length > 0 ||
      priceMin !== undefined ||
      priceMax !== undefined ||
      dateFrom ||
      dateTo ||
      locationFilter
    );
  });

  // Проверяем есть ли активный поиск (запрос или фильтры)
  const hasActiveSearch = $derived(() => {
    return searchQuery.trim() || hasActiveFilters();
  });

  // Основная функция поиска - ИСПРАВЛЕНО
  const performSearch = async (page: number = 1) => {
    console.log(
      "performSearch called with page:",
      page,
      "hasActiveSearch:",
      hasActiveSearch(),
    );

    // Если нет запроса и фильтров - показываем изначальные события
    if (!hasActiveSearch()) {
      console.log("No active search - showing initial events");
      onResults(initialEvents);

      // ИСПРАВЛЕНО: Правильно вычисляем пагинацию для начальных событий
      const initialTotalCount = initialEvents.length;
      const initialTotalPages = Math.ceil(initialTotalCount / limit);

      currentPage = 1;
      totalPages = initialTotalPages;
      totalCount = initialTotalCount;

      onPaginationChange?.({
        total_count: initialTotalCount,
        limit: limit,
        offset: 0,
        has_more: initialTotalCount > limit,
      });
      return;
    }

    loading = true;

    try {
      const offset = (page - 1) * limit;

      // Формируем параметры поиска
      const searchParams: SearchFilters = {
        limit,
        offset,
        include_count: true,
      };

      // Добавляем параметры только если они есть
      if (searchQuery.trim()) searchParams.search_text = searchQuery.trim();
      if (selectedCategories.length > 0)
        searchParams.category_ids = selectedCategories;
      if (priceMin !== undefined) searchParams.min_price = priceMin;
      if (priceMax !== undefined) searchParams.max_price = priceMax;
      if (dateFrom) searchParams.date_from = dateFrom;
      if (dateTo) searchParams.date_to = dateTo;
      if (locationFilter) searchParams.location = locationFilter;

      console.log("Search params:", searchParams);

      let result: EventsListResponse;

      // Используем search для текстовых запросов, getAll для остальных
      if (searchQuery.trim()) {
        result = await eventsApi.search(searchParams);
      } else {
        // Преобразуем для getAll API
        const getParams = {
          limit,
          offset,
          category_id: selectedCategories[0], // getAll принимает только одну категорию
          price_min: priceMin,
          price_max: priceMax,
          date_from: dateFrom,
          date_to: dateTo,
          location: locationFilter,
          include_count: true, // ВАЖНО: добавляем include_count
        };
        console.log("Using getAll with params:", getParams);
        result = await eventsApi.getAll(getParams);
      }

      console.log("Search result:", result);

      onResults(result.events, result.pagination);

      // ИСПРАВЛЕНО: Обновляем пагинацию в EventSearch
      if (result.pagination) {
        totalCount = result.pagination.total_count;
        totalPages = Math.ceil(totalCount / limit);
        currentPage = page;
        onPaginationChange?.(result.pagination);

        console.log("Updated pagination in EventSearch:", {
          totalCount,
          totalPages,
          currentPage,
          limit,
          offset,
        });
      } else {
        // Если нет пагинации в ответе, устанавливаем базовые значения
        totalCount = result.events.length;
        totalPages = 1;
        currentPage = 1;

        console.log("No pagination in response, using fallback values");
      }
    } catch (error) {
      console.error("Search failed:", error);
      onResults([]);
      currentPage = 1;
      totalPages = 1;
      totalCount = 0;
      onPaginationChange?.(null);
    } finally {
      loading = false;
    }
  };

  // Загрузка подсказок - НЕ влияет на результаты поиска
  const loadSuggestions = async () => {
    if (searchQuery.length < 2) {
      suggestions = [];
      showSuggestions = false;
      selectedSuggestionIndex = -1;
      return;
    }

    clearTimeout(suggestionsTimeout);
    suggestionsTimeout = setTimeout(async () => {
      try {
        const result = await eventsApi.getSuggestions({
          query: searchQuery,
          max_results: 8,
          fields: ["name", "location"],
        });

        suggestions = result.suggestions;
        showSuggestions = suggestions.length > 0;
        selectedSuggestionIndex = -1;
      } catch (error) {
        console.error("Failed to load suggestions:", error);
        suggestions = [];
        showSuggestions = false;
      }
    }, 150);
  };

  // Обработчик изменения текста - ТОЛЬКО загружает подсказки
  const handleQueryChange = () => {
    loadSuggestions();
  };

  // Выбор подсказки
  const selectSuggestion = (suggestion: Suggestion) => {
    searchQuery = suggestion.text;
    showSuggestions = false;
    selectedSuggestionIndex = -1;
    searchInputElement.blur();
    // Сбрасываем на первую страницу и выполняем поиск
    currentPage = 1;
    performSearch(1);
  };

  // Обработка клавиш
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === "Enter") {
        event.preventDefault();
        showSuggestions = false;
        currentPage = 1; // Сбрасываем на первую страницу
        performSearch(1);
      }
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
          showSuggestions = false;
          currentPage = 1; // Сбрасываем на первую страницу
          performSearch(1);
        }
        break;
      case "Escape":
        showSuggestions = false;
        selectedSuggestionIndex = -1;
        break;
    }
  };

  // ИСПРАВЛЕНО: Переключение категории
  const toggleCategory = (categoryId: number) => {
    const index = selectedCategories.indexOf(categoryId);
    if (index > -1) {
      selectedCategories.splice(index, 1);
    } else {
      selectedCategories.push(categoryId);
    }
    // ВАЖНО: сбрасываем на первую страницу при изменении фильтров
    currentPage = 1;
    performSearch(1);
  };

  // ИСПРАВЛЕНО: Обработчики для фильтров с debounce
  const handleFilterChange = () => {
    currentPage = 1;
    performSearch(1);
  };

  const handlePriceChange = () => {
    clearTimeout(priceChangeTimeout);
    priceChangeTimeout = setTimeout(() => {
      handleFilterChange();
    }, 500);
  };

  const handleLocationChange = () => {
    clearTimeout(locationChangeTimeout);
    locationChangeTimeout = setTimeout(() => {
      handleFilterChange();
    }, 500);
  };

  // ИСПРАВЛЕНО: Очистка всех фильтров
  const clearAll = () => {
    searchQuery = "";
    selectedCategories = [];
    priceMin = undefined;
    priceMax = undefined;
    dateFrom = "";
    dateTo = "";
    locationFilter = "";
    suggestions = [];
    showSuggestions = false;
    selectedSuggestionIndex = -1;

    // ИСПРАВЛЕНО: Правильно вычисляем пагинацию для начальных событий
    const initialTotalCount = initialEvents.length;
    const initialTotalPages = Math.ceil(initialTotalCount / limit);

    currentPage = 1;
    totalPages = initialTotalPages;
    totalCount = initialTotalCount;

    console.log("clearAll - resetting to initial events:", {
      totalCount: initialTotalCount,
      totalPages: initialTotalPages,
      eventsCount: initialEvents.length,
    });

    // Возвращаемся к начальным событиям
    onResults(initialEvents);
    onPaginationChange?.({
      total_count: initialTotalCount,
      limit: limit,
      offset: 0,
      has_more: initialTotalCount > limit,
    });
  };

  // ИСПРАВЛЕНО: Обработка изменения страницы
  const handlePageChange = (newPage: number) => {
    console.log(
      "handlePageChange called:",
      newPage,
      "current:",
      currentPage,
      "total:",
      totalPages,
    );
    console.log("Current state in EventSearch:", {
      currentPage,
      totalPages,
      totalCount,
    });

    if (newPage < 1 || newPage === currentPage) {
      console.log("Page change ignored - invalid page or same page");
      return;
    }

    // Убираем проверку на totalPages, так как она может быть устаревшей
    performSearch(newPage);
  };

  // ИСПРАВЛЕНО: Экспортируем функцию для внешнего управления пагинацией
  const goToPage = (page: number) => {
    console.log("goToPage called:", page);
    handlePageChange(page);
  };

  // Делаем функцию доступной родительскому компоненту
  searchAPI = {
    goToPage,
    getCurrentPage: () => currentPage,
    getTotalPages: () => totalPages,
  };

  // ДОБАВЛЕНО: Отслеживание изменений для дебага
  $effect(() => {
    console.log("Filter state changed:", {
      searchQuery,
      selectedCategories,
      priceMin,
      priceMax,
      dateFrom,
      dateTo,
      locationFilter,
      hasActiveSearch: hasActiveSearch(),
      currentPage,
      totalPages,
      totalCount,
    });
  });
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
        placeholder="Поиск событий... (нажмите Enter для поиска)"
        bind:value={searchQuery}
        oninput={handleQueryChange}
        onkeydown={handleKeyDown}
        onfocus={() => {
          if (suggestions.length > 0) {
            showSuggestions = true;
          }
        }}
        class="pl-10 pr-20"
      />

      <!-- Кнопки справа -->
      <div
        class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"
      >
        {#if searchQuery}
          <Button
            variant="ghost"
            size="sm"
            onclick={() => {
              searchQuery = "";
              showSuggestions = false;
              currentPage = 1;
              performSearch(1);
            }}
            class="h-6 w-6 p-0"
          >
            <X class="h-3 w-3" />
          </Button>
        {/if}

        <Button
          variant="ghost"
          size="sm"
          onclick={() => (showFilters = !showFilters)}
          class="h-6 px-2"
        >
          <ChevronDown
            class="h-3 w-3 {showFilters
              ? 'rotate-180'
              : ''} transition-transform"
          />
          {#if hasActiveFilters()}
            <Badge variant="secondary" class="ml-1 h-4 w-4 p-0 text-xs">
              {selectedCategories.length +
                (priceMin !== undefined ? 1 : 0) +
                (dateFrom ? 1 : 0) +
                (locationFilter ? 1 : 0)}
            </Badge>
          {/if}
        </Button>
      </div>
    </div>

    <!-- Подсказки автокомплита -->
    {#if showSuggestions && suggestions.length > 0}
      <div
        class="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
      >
        {#each suggestions as suggestion, index}
          <button
            class="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3 {index ===
            selectedSuggestionIndex
              ? 'bg-blue-50 border-blue-200'
              : ''}"
            onclick={() => selectSuggestion(suggestion)}
          >
            <Lightbulb class="h-4 w-4 text-gray-400 flex-shrink-0" />
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
  {#if showFilters}
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
          <div class="text-sm font-medium">Категории</div>
          <div class="flex flex-wrap gap-2">
            {#each categories as category}
              <Badge
                variant={selectedCategories.includes(category.id)
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
          <div class="text-sm font-medium flex items-center gap-1">
            <DollarSign class="h-3 w-3" />
            Цена
          </div>
          <div class="flex gap-2">
            <Input
              type="number"
              placeholder="От"
              bind:value={priceMin}
              oninput={handlePriceChange}
              class="text-sm"
              aria-label="Минимальная цена"
            />
            <Input
              type="number"
              placeholder="До"
              bind:value={priceMax}
              oninput={handlePriceChange}
              class="text-sm"
              aria-label="Максимальная цена"
            />
          </div>
        </div>

        <!-- Даты -->
        <div class="space-y-2">
          <div class="text-sm font-medium flex items-center gap-1">
            <Calendar class="h-3 w-3" />
            Период
          </div>
          <div class="flex gap-2">
            <Input
              type="date"
              bind:value={dateFrom}
              onchange={handleFilterChange}
              class="text-sm"
              aria-label="Дата начала"
            />
            <Input
              type="date"
              bind:value={dateTo}
              onchange={handleFilterChange}
              class="text-sm"
              aria-label="Дата окончания"
            />
          </div>
        </div>

        <!-- Место -->
        <div class="space-y-2">
          <label
            for="location-input"
            class="text-sm font-medium flex items-center gap-1"
          >
            <MapPin class="h-3 w-3" />
            Место
          </label>
          <Input
            id="location-input"
            type="text"
            placeholder="Город или адрес"
            bind:value={locationFilter}
            oninput={handleLocationChange}
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
      {#each selectedCategories as categoryId}
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

      <!-- Цена -->
      {#if priceMin !== undefined || priceMax !== undefined}
        <Badge variant="secondary" class="flex items-center gap-1">
          Цена: {priceMin || 0} - {priceMax || "∞"}
          <button
            onclick={() => {
              priceMin = undefined;
              priceMax = undefined;
              handleFilterChange();
            }}
            class="hover:text-red-600"
          >
            <X class="h-3 w-3" />
          </button>
        </Badge>
      {/if}

      <!-- Период -->
      {#if dateFrom || dateTo}
        <Badge variant="secondary" class="flex items-center gap-1">
          Период: {dateFrom || "..."} - {dateTo || "..."}
          <button
            onclick={() => {
              dateFrom = "";
              dateTo = "";
              handleFilterChange();
            }}
            class="hover:text-red-600"
          >
            <X class="h-3 w-3" />
          </button>
        </Badge>
      {/if}

      <!-- Место -->
      {#if locationFilter}
        <Badge variant="secondary" class="flex items-center gap-1">
          Место: {locationFilter}
          <button
            onclick={() => {
              locationFilter = "";
              handleFilterChange();
            }}
            class="hover:text-red-600"
          >
            <X class="h-3 w-3" />
          </button>
        </Badge>
      {/if}
    </div>
  {/if}

  <!-- Индикатор загрузки -->
  {#if loading}
    <div class="flex items-center justify-center py-4">
      <div
        class="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full"
      ></div>
      <span class="ml-2 text-gray-600">Поиск событий...</span>
    </div>
  {/if}

  <!-- Информация о результатах -->
  {#if hasActiveSearch() && totalCount > 0}
    <div class="text-sm text-gray-600">
      Найдено событий: {totalCount}
      {#if totalPages > 1}
        (страница {currentPage} из {totalPages})
      {/if}
    </div>
  {/if}
</div>
