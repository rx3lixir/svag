<script lang="ts">
  import type { Category } from "$lib/api";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Hash, Settings } from "lucide-svelte";

  let { categories }: { categories: Category[] } = $props();
</script>

<Sidebar.Root side="left" variant="sidebar" collapsible="offcanvas">
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Категории</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each categories as category (category.name)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton>
                {#snippet child({ props })}
                  <a href="/" {...props} class="flex items-center gap-2">
                    <span
                      class="transition-all group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:overflow-hidden"
                      >{category.name}</span
                    >
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>

  <Sidebar.Rail />
</Sidebar.Root>
