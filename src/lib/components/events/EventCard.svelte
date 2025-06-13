<script lang="ts">
  import type { Event } from "$lib/api/services/events/events.types";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { HeartIcon } from "lucide-svelte";
  let { event }: { event: Event } = $props();
</script>

<div>
  <div
    class="group cursor-pointer border p-3 space-y-4 hover:shadow transition"
  >
    <!-- Верх: фото, бейджи, кнопки избранное-->
    <div class="aspect-square relative overflow-hidden">
      <img
        src={event.image}
        alt={event.name}
        class="absolute inset-0 w-full h-full object-cover"
      />
      <!-- Бейджик категории -->
      <Badge variant="default" class="absolute top-2 left-2 z-10">
        {event.category_id || "Н/и"}
      </Badge>
      <!-- Кнопка с избранным -->
      <div
        class="opacity-0 group-hover:opacity-100 transition absolute inset-0 flex items-end justify-center pb-5 z-10"
      >
        <div class="flex gap-x-6">
          <HeartIcon
            size={20}
            class="hover:cursor-pointer text-white drop-shadow-lg"
          />
        </div>
      </div>
    </div>
    <!-- Низ: имя, дата и время -->
    <div>
      <p class="font-semibold text-lg">{event.name}</p>
      <p class="font-normal text-sm text-gray-600">
        {event.date} | {event.time}
      </p>
    </div>
    <!-- Низ: цена -->
    <div class="flex items-center justify-between">
      <span class="font-semibold">{event.price}</span>
    </div>
  </div>
</div>
