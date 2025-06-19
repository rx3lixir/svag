<script lang="ts">
  import { eventsApi } from "$lib/api";
  import type {
    SearchFilters as SearchFiltersType,
    Suggestion,
    EventsListResponse,
    Category,
  } from "$lib/api";

  // Импортируем наши новые компоненты
  import SearchInput from "../ui/SearchInput.svelte";
  import SearchFiltersComponent from "../ui/SearchFiltersComponent.svelte";
  import ActiveFilters from "../ui/ActiveFilters.svelte";

  // Component props
  let {
    onSearchResults,
    initialFilters = {},
    categories = [],
  }: {
    onSearchResults: (result: EventsListResponse) => void;
    initialFilters?: Partial<SearchFiltersType>;
    categories?: Category[];
  } = $props();

  // ===== STATE VARIABLES =====
  let searchQuery = $state(initialFilters.search_text || "");
  let suggestions = $state<Suggestion[]>([]);
  let showSuggestions = $state(false);
  let suggestionsLoading = $state(false);
  let isLoading = $state(false);
  let showFilters = $state(false);

  // Filter state
  let selectedCategories = $state<number[]>(initialFilters.category_ids || []);
  let minPrice = $state<number | undefined>(initialFilters.min_price);
  let maxPrice = $state<number | undefined>(initialFilters.max_price);
  let dateFrom = $state(initialFilters.date_from || "");
  let dateTo = $state(initialFilters.date_to || "");
  let location = $state(initialFilters.location || "");

  // Timers for debouncing
  let suggestionTimer: ReturnType<typeof setTimeout>;
  let searchTimer: ReturnType<typeof setTimeout>;

  // ===== DERIVED STATE =====
  const activeFiltersCount = $derived.by(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (minPrice !== undefined || maxPrice !== undefined) count++;
    if (dateFrom || dateTo) count++;
    if (location) count++;
    return count;
  });

  // ===== EVENT HANDLERS =====
  async function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;

    if (suggestionTimer) clearTimeout(suggestionTimer);

    if (searchQuery.length < 2) {
      suggestions = [];
      showSuggestions = false;
      return;
    }

    suggestionTimer = setTimeout(async () => {
      try {
        suggestionsLoading = true;
        const response = await eventsApi.getSuggestions({
          query: searchQuery,
          max_results: 8,
          fields: ["name", "location"],
        });
        suggestions = response.suggestions;
        showSuggestions = true;
      } catch (error) {
        console.error("Failed to get suggestions:", error);
        suggestions = [];
      } finally {
        suggestionsLoading = false;
      }
    }, 300);
  }

  const selectSuggestion = (suggestion: Suggestion) => {
    searchQuery = suggestion.text;
    showSuggestions = false;
    performSearch();
  };

  async function performSearch() {
    if (searchTimer) clearTimeout(searchTimer);

    searchTimer = setTimeout(async () => {
      try {
        isLoading = true;

        const filters: SearchFiltersType = {
          search_text: searchQuery || undefined,
          category_ids:
            selectedCategories.length > 0 ? selectedCategories : undefined,
          min_price: minPrice,
          max_price: maxPrice,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          location: location || undefined,
          limit: 20,
          offset: 0,
          include_count: true,
        };

        const result = searchQuery
          ? await eventsApi.search(filters)
          : await eventsApi.getAll(filters);

        onSearchResults(result);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        isLoading = false;
      }
    }, 300);
  }

  function clearSearch() {
    searchQuery = "";
    suggestions = [];
    showSuggestions = false;
    performSearch();
  }

  function clearAllFilters() {
    searchQuery = "";
    selectedCategories = [];
    minPrice = undefined;
    maxPrice = undefined;
    dateFrom = "";
    dateTo = "";
    location = "";
    suggestions = [];
    showSuggestions = false;
    performSearch();
  }

  function toggleCategory(categoryId: number) {
    if (selectedCategories.includes(categoryId)) {
      selectedCategories = selectedCategories.filter((id) => id !== categoryId);
    } else {
      selectedCategories = [...selectedCategories, categoryId];
    }
    performSearch();
  }

  function removeCategory(categoryId: number) {
    selectedCategories = selectedCategories.filter((id) => id !== categoryId);
    performSearch();
  }

  function clearPriceFilter() {
    minPrice = undefined;
    maxPrice = undefined;
    performSearch();
  }

  function clearDateFilter() {
    dateFrom = "";
    dateTo = "";
    performSearch();
  }

  function clearLocationFilter() {
    location = "";
    performSearch();
  }

  function toggleFilters() {
    showFilters = !showFilters;
  }

  // ===== REACTIVE EFFECTS =====
  $effect(() => {
    if (minPrice !== undefined || maxPrice !== undefined) {
      performSearch();
    }
  });

  $effect(() => {
    if (dateFrom || dateTo) {
      performSearch();
    }
  });

  $effect(() => {
    if (location) {
      performSearch();
    }
  });
</script>

<div class="w-full space-y-4">
  <!-- Search Input Component -->
  <SearchInput
    bind:searchQuery
    {suggestions}
    bind:showSuggestions
    {suggestionsLoading}
    {activeFiltersCount}
    bind:showFilters
    onInput={handleInput}
    onSelectSuggestion={selectSuggestion}
    onSearch={performSearch}
    onClear={clearSearch}
    onToggleFilters={toggleFilters}
  />

  <!-- Filters Panel -->
  {#if showFilters}
    <SearchFiltersComponent
      {categories}
      bind:selectedCategories
      bind:minPrice
      bind:maxPrice
      bind:dateFrom
      bind:dateTo
      bind:location
      onClearFilters={clearAllFilters}
      onToggleCategory={toggleCategory}
    />
  {/if}

  <!-- Active Filters -->
  <ActiveFilters
    {categories}
    {selectedCategories}
    {minPrice}
    {maxPrice}
    {dateFrom}
    {dateTo}
    {location}
    onRemoveCategory={removeCategory}
    onClearPriceFilter={clearPriceFilter}
    onClearDateFilter={clearDateFilter}
    onClearLocationFilter={clearLocationFilter}
  />

  <!-- Loading Indicator -->
  {#if isLoading}
    <div class="flex items-center justify-center py-4">
      <div
        class="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full"
      ></div>
      <span class="ml-2 text-gray-600">Поиск событий...</span>
    </div>
  {/if}
</div>
