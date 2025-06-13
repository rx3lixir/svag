<script lang="ts">
  import type { Event } from "$lib/api/services/events/events.types";
  import NoResults from "$lib/components/ui/NoResults.svelte";
  import EventCard from "./EventCard.svelte";
  let { events }: { events: Event[] } = $props();
</script>

<div class="space-y-4">
  <h3 class="font-bold text-3xl">События</h3>
  {#if events.length === 0}
    <NoResults />
  {:else}
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {#each events as event}
        <EventCard {event} />
      {/each}
    </div>
  {/if}
</div>
