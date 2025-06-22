<!-- src/routes/+page.svelte -->
<script lang="ts">
  import AdEvent from "$lib/components/events/AdEvent.svelte";
  import EventList from "$lib/components/events/EventList.svelte";
  import Container from "$lib/components/ui/Container.svelte";
  import type { Event } from "$lib/api";
  import EventSearch from "$lib/components/events/EventSearch.svelte";

  let { data }: { data: any } = $props();

  // Единое состояние для событий
  let currentEvents = $state<Event[]>(data.events);

  // Простой обработчик результатов поиска
  function handleSearchResults(events: Event[]) {
    currentEvents = events;
  }
</script>

<Container>
  <div class="space-y-10 pb-10">
    <AdEvent />

    <!-- Упрощенный поиск -->
    <EventSearch
      onResults={handleSearchResults}
      categories={data.categories}
      initialEvents={data.events}
    />

    <!-- Список событий -->
    <div class="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
      <EventList events={currentEvents} />
    </div>
  </div>
</Container>
