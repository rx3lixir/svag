<script lang="ts">
  import type { Category } from "$lib/api";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import SidebarGroupContent from "../ui/sidebar/sidebar-group-content.svelte";

  let { categories }: { categories: Category[] } = $props();
</script>

<Sidebar.Root>
  <Sidebar.Content>
    <Sidebar.GroupLabel>Категории</Sidebar.GroupLabel>
    <SidebarGroupContent>
      <Sidebar.Menu>
        {#each categories as category (category.name)}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton>
              {#snippet child({ props })}
                <a href={"/"} {...props}>
                  <span>{category.name}</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        {/each}
      </Sidebar.Menu>
    </SidebarGroupContent>
  </Sidebar.Content>
</Sidebar.Root>
