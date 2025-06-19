<script lang="ts">
  import AdEvent from "$lib/components/events/AdEvent.svelte";
  import EventList from "$lib/components/events/EventList.svelte";
  import EventSearch from "$lib/components/events/EventSearch.svelte";
  import Container from "$lib/components/ui/Container.svelte";
  import type { EventsListResponse } from "$lib/api";

  let { data }: { data: any } = $props();

  // Состояние для результатов поиска
  let searchResults = $state(data.events);

  // Обработчик результатов поиска
  function handleSearchResults(result: EventsListResponse) {
    searchResults = result.events;
  }
</script>

<Container>
  <div class="space-y-10 pb-10">
    <AdEvent />
    <EventSearch
      onSearchResults={handleSearchResults}
      categories={data.categories}
    />
    <div class="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
      <EventList events={searchResults} />
    </div>
  </div>
</Container>
