<script lang="ts">
  import AdEvent from "$lib/components/events/AdEvent.svelte";
  import EventList from "$lib/components/events/EventList.svelte";
  import Container from "$lib/components/ui/Container.svelte";
  import EventSearch from "$lib/components/events/EventSearch.svelte";
  import type { Event } from "$lib/api";

  import * as Pagination from "$lib/components/ui/pagination/index.js";

  let { data }: { data: any } = $props();

  // Простое состояние событий
  let currentEvents = $state<Event[]>(data.events);
  let currentPagination = $state(data.pagination || null);

  // Обработчик результатов поиска
  const handleSearchResults = (events: Event[], pagination?: any) => {
    currentEvents = events;
    currentPagination = pagination || null;
  };
</script>

<Container>
  <div class="space-y-10 pb-10">
    <!-- Рекламный блок -->
    <AdEvent />

    <!-- Поиск с автокомплитом и фильтрами -->
    <EventSearch
      onResults={handleSearchResults}
      categories={data.categories}
      initialEvents={data.events}
    />

    <!-- Список событий -->
    <div class="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
      <EventList events={currentEvents} />

      <Pagination.Root count={currentPagination.totalCount} perPage={3}>
        {#snippet children({ pages, currentPage })}
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.PrevButton />
            </Pagination.Item>
            {#each pages as page (page.key)}
              {#if page.type === "ellipsis"}
                <Pagination.Item>
                  <Pagination.Ellipsis />
                </Pagination.Item>
              {:else}
                <Pagination.Item>
                  <Pagination.Link {page} isActive={currentPage === page.value}>
                    {page.value}
                  </Pagination.Link>
                </Pagination.Item>
              {/if}
            {/each}
            <Pagination.Item>
              <Pagination.NextButton />
            </Pagination.Item>
          </Pagination.Content>
        {/snippet}
      </Pagination.Root>

      <!-- Информация о результатах -->
      {#if currentPagination && currentPagination.total_count > 0}
        <div class="text-center text-sm text-gray-500">
          {#if currentEvents.length === 0}
            Событий не найдено
          {:else}
            Найдено событий: {currentPagination.total_count}
          {/if}
        </div>
      {:else if currentEvents.length === 0}
        <div class="text-center text-sm text-gray-500">События не найдены</div>
      {/if}
    </div>
  </div>
</Container>
