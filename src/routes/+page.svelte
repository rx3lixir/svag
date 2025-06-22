<script lang="ts">
  import AdEvent from "$lib/components/events/AdEvent.svelte";
  import EventList from "$lib/components/events/EventList.svelte";
  import Container from "$lib/components/ui/Container.svelte";
  import EventSearch from "$lib/components/events/EventSearch.svelte";
  import type { Event } from "$lib/api";

  import * as Pagination from "$lib/components/ui/pagination/index.js";

  let { data }: { data: any } = $props();

  // Состояние событий и пагинации
  let currentEvents = $state<Event[]>(data.events);
  let currentPagination = $state(data.pagination || null);
  let searchAPI = $state<any>(null);

  // Обработчик результатов поиска
  const handleSearchResults = (events: Event[], pagination?: any) => {
    currentEvents = events;
    currentPagination = pagination || null;
  };

  // Обработчик изменения пагинации
  const handlePaginationChange = (pagination: any) => {
    currentPagination = pagination;
  };

  // ИСПРАВЛЕНО: Обработчик клика по странице в пагинации
  const handlePageClick = (page: number) => {
    console.log(
      "Page click:",
      page,
      "Current:",
      currentPageNumber(),
      "Total:",
      totalPages(),
    );
    console.log("Current pagination object:", currentPagination);

    if (searchAPI && typeof searchAPI.goToPage === "function") {
      searchAPI.goToPage(page);
    } else {
      console.error(
        "searchAPI not available or goToPage not a function:",
        searchAPI,
      );
    }
  };

  // ИСПРАВЛЕНО: Вычисляемые значения для пагинации
  let currentPageNumber = $derived(() => {
    if (!currentPagination || !currentPagination.limit) return 1;
    return Math.floor(currentPagination.offset / currentPagination.limit) + 1;
  });

  let totalPages = $derived(() => {
    if (
      !currentPagination ||
      !currentPagination.total_count ||
      !currentPagination.limit
    )
      return 1;
    return Math.ceil(currentPagination.total_count / currentPagination.limit);
  });

  let totalCount = $derived(() => {
    return currentPagination?.total_count || 0;
  });

  // ДОБАВЛЕНО: Дебаг информация
  $effect(() => {
    console.log("Pagination state:", {
      currentPage: currentPageNumber(),
      totalPages: totalPages(),
      totalCount: totalCount(),
      pagination: currentPagination,
      hasSearchAPI: !!searchAPI,
      eventsCount: currentEvents.length,
      initialEventsCount: data.events.length,
    });
  });
</script>

<Container>
  <div class="space-y-10 pb-10">
    <!-- Рекламный блок -->
    <AdEvent />

    <!-- Поиск с автокомплитом и фильтрами -->
    <EventSearch
      bind:searchAPI
      onResults={handleSearchResults}
      onPaginationChange={handlePaginationChange}
      categories={data.categories}
      initialEvents={data.events}
    />

    <!-- Список событий -->
    <div class="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
      <EventList events={currentEvents} />

      <!-- ИСПРАВЛЕНО: Пагинация - показываем только если есть больше одной страницы -->
      {#if totalPages() > 1}
        <div class="flex justify-center">
          <Pagination.Root
            count={totalCount()}
            perPage={currentPagination?.limit || 12}
          >
            {#snippet children({ pages })}
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.PrevButton
                    onclick={() => {
                      const newPage = Math.max(1, currentPageNumber() - 1);
                      console.log("Prev clicked, going to page:", newPage);
                      handlePageClick(newPage);
                    }}
                    disabled={currentPageNumber() <= 1}
                  />
                </Pagination.Item>
                {#each pages as page (page.key)}
                  {#if page.type === "ellipsis"}
                    <Pagination.Item>
                      <Pagination.Ellipsis />
                    </Pagination.Item>
                  {:else}
                    <Pagination.Item>
                      <Pagination.Link
                        {page}
                        isActive={currentPageNumber() === page.value}
                        onclick={() => {
                          console.log("Page link clicked:", page.value);
                          handlePageClick(page.value);
                        }}
                      >
                        {page.value}
                      </Pagination.Link>
                    </Pagination.Item>
                  {/if}
                {/each}
                <Pagination.Item>
                  <Pagination.NextButton
                    onclick={() => {
                      const newPage = Math.min(
                        totalPages(),
                        currentPageNumber() + 1,
                      );
                      console.log("Next clicked, going to page:", newPage);
                      handlePageClick(newPage);
                    }}
                    disabled={currentPageNumber() >= totalPages()}
                  />
                </Pagination.Item>
              </Pagination.Content>
            {/snippet}
          </Pagination.Root>
        </div>
      {/if}

      <!-- ИСПРАВЛЕНО: Информация о результатах -->
      {#if currentPagination && totalCount() > 0}
        <div class="text-center text-sm text-gray-500">
          {#if currentEvents.length === 0}
            Событий не найдено
          {:else}
            Показано {Math.max(
              1,
              (currentPageNumber() - 1) * (currentPagination.limit || 12) + 1,
            )}-{Math.min(
              currentPageNumber() * (currentPagination.limit || 12),
              totalCount(),
            )}
            из {totalCount()} событий
          {/if}
        </div>
      {:else if currentEvents.length === 0}
        <div class="text-center text-sm text-gray-500">События не найдены</div>
      {:else if currentEvents.length > 0}
        <div class="text-center text-sm text-gray-500">
          Показано {currentEvents.length} событий
        </div>
      {/if}

      <!-- ДОБАВЛЕНО: Дебаг информация (убери в продакшене) -->
      <details class="text-xs text-gray-400">
        <summary>Debug Info</summary>
        <pre>{JSON.stringify(
            {
              currentPage: currentPageNumber(),
              totalPages: totalPages(),
              totalCount: totalCount(),
              limit: currentPagination?.limit,
              offset: currentPagination?.offset,
              hasSearchAPI: !!searchAPI,
              searchAPIType: typeof searchAPI?.goToPage,
            },
            null,
            2,
          )}</pre>
      </details>
    </div>
  </div>
</Container>
