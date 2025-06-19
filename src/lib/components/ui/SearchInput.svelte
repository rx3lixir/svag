<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Popover from "$lib/components/ui/popover";
  import { Search, X, Funnel, ChevronDown } from "lucide-svelte";
  import type { Suggestion } from "$lib/api";

  let {
    searchQuery = $bindable(""),
    suggestions = [],
    showSuggestions = $bindable(false),
    suggestionsLoading = false,
    activeFiltersCount = 0,
    showFilters = $bindable(false),
    onInput,
    onSelectSuggestion,
    onSearch,
    onClear,
    onToggleFilters,
  }: {
    searchQuery?: string;
    suggestions?: Suggestion[];
    showSuggestions?: boolean;
    suggestionsLoading?: boolean;
    activeFiltersCount?: number;
    showFilters?: boolean;
    onInput: (event: Event) => void;
    onSelectSuggestion: (suggestion: Suggestion) => void;
    onSearch: () => void;
    onClear: () => void;
    onToggleFilters: () => void;
  } = $props();
</script>

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
      oninput={onInput}
      onkeydown={(e) => {
        if (e.key === "Enter") {
          showSuggestions = false;
          onSearch();
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
      <!-- Clear search button -->
      {#if searchQuery}
        <Button variant="ghost" size="sm" onclick={onClear} class="h-6 w-6 p-0">
          <X class="h-3 w-3" />
        </Button>
      {/if}

      <!-- Filters toggle button -->
      <Button
        variant="ghost"
        size="sm"
        onclick={onToggleFilters}
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

  <!-- Suggestions popover -->
  <Popover.Root bind:open={showSuggestions}>
    <Popover.Trigger class="hidden" />
    <Popover.Content
      class="w-full p-0 max-h-60 overflow-y-auto"
      align="start"
      side="bottom"
    >
      {#if suggestionsLoading}
        <div class="p-3 text-center text-gray-500">
          <div
            class="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"
          ></div>
          <span class="ml-2">Поиск...</span>
        </div>
      {:else if suggestions.length > 0}
        {#each suggestions as suggestion}
          <button
            class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b last:border-b-0"
            onclick={() => onSelectSuggestion(suggestion)}
          >
            <div class="flex-1">
              <div class="font-medium text-sm">{suggestion.text}</div>
              {#if suggestion.category}
                <div class="text-xs text-gray-500">{suggestion.category}</div>
              {/if}
            </div>
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
