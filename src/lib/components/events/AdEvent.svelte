<script lang="ts">
  import { Asterisk } from "lucide-svelte";
</script>

<div class="p-4 sm:p-6 lg:p-8 overflow-hidden">
  <div
    class="relative rounded-md aspect-[4/5] sm:aspect-[3/2] md:aspect-[2.4/1] overflow-hidden shadow-lg"
  >
    <img
      src="https://6moog6uaos.ufs.sh/f/ma2p7Lsp3PbaICw6QM8jVMGdmS6Jo0zkPxuXONyU7wBe1EDQ"
      alt="Событие"
      class="w-full h-full object-cover"
    />
    <!-- Название -->
    <div
      class="p-2 sm:p-3 bg-stone-50 absolute top-4 left-4 sm:top-6 sm:left-6 md:top-10 md:left-10 z-10 rounded-md"
    >
      <span
        class="flex items-center gap-2 text-xl sm:text-2xl md:text-3xl text-black font-unbounded font-normal"
      >
        <Asterisk
          class="text-orange-500 w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12"
        />
        Премьера фильма: Алтайская сага
      </span>
    </div>
    <!-- Дата -->
    <div
      class="p-2 sm:p-3 bg-orange-500 absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-10 md:right-10 z-10 rounded-md"
    >
      <span
        class="text-xl sm:text-2xl md:text-3xl text-neutral-900 font-unbounded font-normal"
        >31 мая</span
      >
    </div>
  </div>
</div>
