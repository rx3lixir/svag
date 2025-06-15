<script lang="ts">
  // Import necessary APIs and types
  import { eventsApi } from "$lib/api";
  import type {
    SearchFilters,
    Suggestion,
    EventsListResponse,
    Category,
  } from "$lib/api";

  // Import UI components
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Popover from "$lib/components/ui/popover";

  // Import icons
  import {
    Search,
    X,
    Calendar,
    MapPin,
    DollarSign,
    Funnel,
    ChevronDown,
  } from "lucide-svelte";

  // Component props with default values
  let {
    onSearchResults, // Callback function to handle search results
    initialFilters = {}, // Initial filter values
    categories = [], // Available categories for filtering
  }: {
    onSearchResults: (result: EventsListResponse) => void;
    initialFilters?: Partial<SearchFilters>;
    categories?: Category[];
  } = $props();

  // ===== REACTIVE STATE VARIABLES =====

  // Search query state - initialized from initial filters
  let searchQuery = $state(initialFilters.search_text || "");

  // Suggestions state for autocomplete functionality
  let suggestions = $state<Suggestion[]>([]);
  let showSuggestions = $state(false);
  let suggestionsLoading = $state(false);

  // Loading states
  let isLoading = $state(false);

  // ===== FILTER STATE VARIABLES =====

  // Category filters - array of selected category IDs
  let selectedCategories = $state<number[]>(initialFilters.category_ids || []);

  // Price range filters
  let minPrice = $state<number | undefined>(initialFilters.min_price);
  let maxPrice = $state<number | undefined>(initialFilters.max_price);

  // Date range filters
  let dateFrom = $state(initialFilters.date_from || "");
  let dateTo = $state(initialFilters.date_to || "");

  // Location filter
  let location = $state(initialFilters.location || "");

  // UI state for showing/hiding filters panel
  let showFilters = $state(false);

  // ===== TIMER VARIABLES FOR DEBOUNCING =====

  // Debounce timers to prevent excessive API calls
  let suggestionTimer: number;
  let searchTimer: number;

  // ===== EVENT HANDLERS =====

  /**
   * Handles input changes in the search field
   * Implements debounced suggestions fetching
   */
  async function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;

    // Clear existing timer to debounce requests
    if (suggestionTimer) clearTimeout(suggestionTimer);

    // Don't show suggestions for very short queries
    if (searchQuery.length < 2) {
      suggestions = [];
      showSuggestions = false;
      return;
    }

    // Debounce suggestions API call by 300ms
    suggestionTimer = setTimeout(async () => {
      try {
        suggestionsLoading = true;

        // Fetch suggestions from API
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

  /**
   * Handles selection of a suggestion from the dropdown
   * Updates search query and triggers search
   */
  function selectSuggestion(suggestion: Suggestion) {
    searchQuery = suggestion.text;
    showSuggestions = false;
    performSearch();
  }

  /**
   * Performs the main search operation
   * Debounced to prevent excessive API calls
   */
  async function performSearch() {
    // Clear existing search timer
    if (searchTimer) clearTimeout(searchTimer);

    // Debounce search by 300ms
    searchTimer = setTimeout(async () => {
      try {
        isLoading = true;

        // Build search filters object
        const filters: SearchFilters = {
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

        // Use search API if there's a query, otherwise get all events
        const result = searchQuery
          ? await eventsApi.search(filters)
          : await eventsApi.getAll(filters);

        // Pass results to parent component
        onSearchResults(result);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        isLoading = false;
      }
    }, 300);
  }

  /**
   * Clears all filters and resets the search
   */
  function clearFilters() {
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

  /**
   * Toggles a category filter on/off
   */
  function toggleCategory(categoryId: number) {
    if (selectedCategories.includes(categoryId)) {
      // Remove category if already selected
      selectedCategories = selectedCategories.filter((id) => id !== categoryId);
    } else {
      // Add category if not selected
      selectedCategories = [...selectedCategories, categoryId];
    }
    performSearch();
  }

  /**
   * Removes a specific category from filters
   */
  function removeCategory(categoryId: number) {
    selectedCategories = selectedCategories.filter((id) => id !== categoryId);
    performSearch();
  }

  // ===== DERIVED STATE =====

  /**
   * Calculates the number of active filters for the badge display
   */
  const activeFiltersCount = $derived.by(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (minPrice !== undefined || maxPrice !== undefined) count++;
    if (dateFrom || dateTo) count++;
    if (location) count++;
    return count;
  });

  // ===== REACTIVE EFFECTS =====

  /**
   * Auto-search when price filters change
   */
  $effect(() => {
    if (minPrice !== undefined || maxPrice !== undefined) {
      performSearch();
    }
  });

  /**
   * Auto-search when date filters change
   */
  $effect(() => {
    if (dateFrom || dateTo) {
      performSearch();
    }
  });

  /**
   * Auto-search when location filter changes
   */
  $effect(() => {
    if (location) {
      performSearch();
    }
  });
</script>

<div class="w-full space-y-4">
  <!-- ===== MAIN SEARCH BAR ===== -->
  <div class="relative">
    <div class="relative">
      <!-- Search icon -->
      <Search
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
      />

      <!-- Main search input -->
      <Input
        type="text"
        placeholder="Поиск событий..."
        bind:value={searchQuery}
        oninput={handleInput}
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

      <!-- Action buttons in search bar -->
      <div
        class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1"
      >
        <!-- Clear search button - only shown when there's text -->
        {#if searchQuery}
          <Button
            variant="ghost"
            size="sm"
            onclick={() => {
              searchQuery = "";
              suggestions = [];
              showSuggestions = false;
              performSearch();
            }}
            class="h-6 w-6 p-0"
          >
            <X class="h-3 w-3" />
          </Button>
        {/if}

        <!-- Filters toggle button with active count badge -->
        <Button
          variant="ghost"
          size="sm"
          onclick={() => (showFilters = !showFilters)}
          class="h-6 px-2"
        >
          <Funnel class="h-3 w-3" />
          {#if activeFiltersCount > 0}
            <Badge variant="destructive" class="ml-1 h-4 w-4 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          {/if}
          <ChevronDown class="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>

    <!-- ===== SUGGESTIONS POPOVER ===== -->
    <Popover.Root bind:open={showSuggestions}>
      <Popover.Trigger class="hidden" />
      <Popover.Content
        class="w-full p-0 max-h-60 overflow-y-auto"
        align="start"
        side="bottom"
      >
        {#if suggestionsLoading}
          <!-- Loading state for suggestions -->
          <div class="p-3 text-center text-gray-500">
            <div
              class="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"
            ></div>
            <span class="ml-2">Поиск...</span>
          </div>
        {:else if suggestions.length > 0}
          <!-- Suggestions list -->
          {#each suggestions as suggestion}
            <button
              class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b last:border-b-0"
              onclick={() => selectSuggestion(suggestion)}
            >
              <!-- Icon based on suggestion type -->
              {#if suggestion.type === "event"}
                <Search class="h-3 w-3 text-gray-400" />
              {:else if suggestion.type === "location"}
                <MapPin class="h-3 w-3 text-gray-400" />
              {:else}
                <Funnel class="h-3 w-3 text-gray-400" />
              {/if}

              <!-- Suggestion content -->
              <div class="flex-1">
                <div class="font-medium text-sm">{suggestion.text}</div>
                {#if suggestion.category}
                  <div class="text-xs text-gray-500">{suggestion.category}</div>
                {/if}
              </div>

              <!-- Type badge -->
              <Badge variant="outline" class="text-xs">
                {suggestion.type === "event"
                  ? "Событие"
                  : suggestion.type === "location"
                    ? "Место"
                    : "Категория"}
              </Badge>
            </button>
          {/each}
        {/if}
      </Popover.Content>
    </Popover.Root>
  </div>

  <!-- ===== FILTERS PANEL ===== -->
  {#if showFilters}
    <div class="border rounded-lg p-4 space-y-4 bg-gray-50">
      <!-- Filters header -->
      <div class="flex items-center justify-between">
        <h3 class="font-medium">Фильтры</h3>
        <Button variant="ghost" size="sm" onclick={clearFilters}>
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
                onclick={() => toggleCategory(category.id)}
              >
                {category.name}
              </Badge>
            {/each}
          </div>
        </div>

        <!-- Price range filter -->
        <div class="space-y-2">
          <label
            class="text-sm font-medium flex items-center gap-1"
            for="price"
          >
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
          <label
            class="text-sm font-medium flex items-center gap-1"
            for="dates"
          >
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
            <Input
              type="date"
              bind:value={dateTo}
              class="text-sm"
              id="dateTo"
            />
          </div>
        </div>

        <!-- Location filter -->
        <div class="space-y-2">
          <label
            class="text-sm font-medium flex items-center gap-1"
            for="location"
          >
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
  {/if}

  <!-- ===== ACTIVE FILTERS BADGES ===== -->
  {#if selectedCategories.length > 0 || minPrice !== undefined || maxPrice !== undefined || dateFrom || dateTo || location}
    <div class="flex flex-wrap gap-2">
      <!-- Category badges -->
      {#each selectedCategories as categoryId}
        {@const category = categories.find((c) => c.id === categoryId)}
        {#if category}
          <Badge variant="secondary" class="flex items-center gap-1">
            {category.name}
            <button
              onclick={() => removeCategory(categoryId)}
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
          <button
            onclick={() => {
              minPrice = undefined;
              maxPrice = undefined;
              performSearch();
            }}
            class="hover:text-red-600"
          >
            <X class="h-3 w-3" />
          </button>
        </Badge>
      {/if}

      <!-- Date range badge -->
      {#if dateFrom || dateTo}
        <Badge variant="secondary" class="flex items-center gap-1">
          Период: {dateFrom || "..."} - {dateTo || "..."}
          <button
            onclick={() => {
              dateFrom = "";
              dateTo = "";
              performSearch();
            }}
            class="hover:text-red-600"
          >
            <X class="h-3 w-3" />
          </button>
        </Badge>
      {/if}

      <!-- Location badge -->
      {#if location}
        <Badge variant="secondary" class="flex items-center gap-1">
          Место: {location}
          <button
            onclick={() => {
              location = "";
              performSearch();
            }}
            class="hover:text-red-600"
          >
            <X class="h-3 w-3" />
          </button>
        </Badge>
      {/if}
    </div>
  {/if}

  <!-- ===== LOADING INDICATOR ===== -->
  {#if isLoading}
    <div class="flex items-center justify-center py-4">
      <div
        class="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full"
      ></div>
      <span class="ml-2 text-gray-600">Поиск событий...</span>
    </div>
  {/if}
</div>
