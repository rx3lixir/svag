<script lang="ts">
  import type { Category } from "$lib/api";
  import { page } from "$app/state";

  // Пропсы для инсерта категорий
  let { categories = [] }: { categories: Category[] } = $props();

  // derived для реактивных вычислений
  let pathname = $derived(page.url.pathname);

  // Массив роутов из категорий
  let routes = $derived(
    categories.map((category) => ({
      href: `/category/${category.id}`,
      label: category.name,
      active: pathname === `/category/${category.id}`,
    })),
  );
</script>

<nav class="hidden md:flex mx-6 items-center space-x-4 lg:space-x-6">
  {#each routes as route}
    <a href={route.href} class="text-sm font-medium hover:opacity-60"
      >{route.label}</a
    >
  {/each}
</nav>
