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

  // Обработчик клика по странице в пагинации
  const handlePageClick = (page: number) => {
    if (searchAPI) {
      searchAPI.goToPage(page);
    }
  };

  // Вычисляемые значения для пагинации
  let currentPageNumber = $derived(() => {
    if (!currentPagination) return 1;
    return Math.floor(currentPagination.offset / currentPagination.limit) + 1;
  });

  let totalPages = $derived(() => {
    if (!currentPagination) return 1;
    return Math.ceil(currentPagination.total_count / currentPagination.limit);
  });

  let totalCount = $derived(() => {
    return currentPagination?.total_count || 0;
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

      <!-- Пагинация - показываем только если есть больше одной страницы -->
      {#if totalPages() > 1}
        <Pagination.Root
          count={totalCount()}
          perPage={currentPagination?.limit || 12}
        >
          {#snippet children({ pages })}
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.PrevButton
                  onclick={() =>
                    handlePageClick(Math.max(1, currentPageNumber() - 1))}
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
                      onclick={() => handlePageClick(page.value)}
                    >
                      {page.value}
                    </Pagination.Link>
                  </Pagination.Item>
                {/if}
              {/each}
              <Pagination.Item>
                <Pagination.NextButton
                  onclick={() =>
                    handlePageClick(
                      Math.min(totalPages(), currentPageNumber() + 1),
                    )}
                  disabled={currentPageNumber() >= totalPages()}
                />
              </Pagination.Item>
            </Pagination.Content>
          {/snippet}
        </Pagination.Root>
      {/if}

      <!-- Информация о результатах -->
      {#if currentPagination && totalCount() > 0}
        <div class="text-center text-sm text-gray-500">
          {#if currentEvents.length === 0}
            Событий не найдено
          {:else}
            Показано {(currentPageNumber() - 1) *
              (currentPagination.limit || 12) +
              1}-{Math.min(
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
    </div>
  </div>
</Container>
