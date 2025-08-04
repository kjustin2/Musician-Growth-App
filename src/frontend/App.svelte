<script>
  import { createAppLogic } from './logic/appLogic.ts';
  import MainContent from './components/MainContent.svelte';

  const appLogic = createAppLogic();
</script>

<MainContent
  newItemName={appLogic.newItemName}
  newItemDescription={appLogic.newItemDescription}
  loading={appLogic.loading}
  items={appLogic.items}
  addItem={appLogic.addItem}
  deleteItem={appLogic.deleteItem}
/>
