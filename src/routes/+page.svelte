<!-- src/routes/+page.svelte -->
<script lang="ts">
  import AdEvent from "$lib/components/events/AdEvent.svelte";
  import EventList from "$lib/components/events/EventList.svelte";
  import Container from "$lib/components/ui/Container.svelte";
  import type { Event } from "$lib/api";
  import EventSearch from "$lib/components/events/EventSearch.svelte";

  let { data }: { data: any } = $props();

  // Состояние событий и пагинации
  let currentEvents = $state<Event[]>(data.events);
  let currentPagination = $state(data.pagination || null);

  /**
   * Обработчик результатов поиска
   * Принимает события и опциональную информацию о пагинации
   */
  function handleSearchResults(events: Event[], pagination?: any) {
    currentEvents = events;
    currentPagination = pagination || null;
  }
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

      <!-- Дополнительная информация о пагинации (опционально) -->
      {#if currentPagination && currentPagination.total_count > 0}
        <div class="text-center text-sm text-gray-500">
          {#if currentEvents.length === 0}
            Событий не найдено
          {:else}
            Найдено событий: {currentPagination.total_count}
          {/if}
        </div>
      {/if}
    </div>
  </div>
</Container>
