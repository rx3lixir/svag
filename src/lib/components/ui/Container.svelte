<script lang="ts">
  let { class: className = "", children }: { class?: string; children?: any } =
    $props();
</script>

<div class="mx-auto max-w-7xl {className}">
  {@render children?.()}
</div>
