<script lang="ts">
  import type { Event } from "$lib/api/services/events/events.types";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { HeartIcon } from "lucide-svelte";
  let { event }: { event: Event } = $props();
</script>

<div class="h-full">
  <div
    class="group cursor-pointer border p-3 space-y-4 hover:shadow transition h-full flex flex-col"
  >
    <!-- Верх: фото, бейджи, кнопки избранное-->
    <div class="aspect-square relative overflow-hidden flex-shrink-0">
      <!-- Картинка ивента -->
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

    <!-- Контентная часть - растягивается на оставшееся место -->
    <div class="flex flex-col flex-grow justify-between space-y-4">
      <!-- Название и дата - верхняя часть -->
      <div class="space-y-2">
        <p class="font-semibold text-lg leading-tight">{event.name}</p>
        <p class="font-normal text-sm text-gray-600">
          {event.date} | {event.time}
        </p>
      </div>

      <!-- Цена - нижняя часть, прижимается к низу -->
      <div class="flex items-center justify-between mt-auto">
        <span class="font-semibold">{event.price}</span>
      </div>
    </div>
  </div>
</div>
