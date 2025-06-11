<script lang="ts">
  import AdEvent from "$lib/components/events/AdEvent.svelte";
  import EventList from "$lib/components/events/EventList.svelte";
  import Container from "$lib/components/ui/Container.svelte";

  let { data }: { data: any } = $props();
</script>

<Container>
  <div class="space-y-10 pb-10">
    <AdEvent />
    <div class="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
      <EventList categories={data} />
    </div>
  </div>
</Container>
