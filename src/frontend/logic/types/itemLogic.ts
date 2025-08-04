import { get, writable } from 'svelte/store';
import { getItemEntity, items } from '../../../backend/database/types/item/Item';
import * as errors from '../errors';

export function createItemLogic(): {
  newItemName: ReturnType<typeof writable<string>>;
  newItemDescription: ReturnType<typeof writable<string>>;
  items: typeof items;
  itemEntity: ReturnType<typeof getItemEntity>;
  addItem: () => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
} {
  const newItemName = writable('');
  const newItemDescription = writable('');

  // Get the item entity instance
  const itemEntity = getItemEntity();

  // Add new item
  async function addItem(): Promise<void> {
    const nameValue = get(newItemName);
    const descriptionValue = get(newItemDescription);

    if (!nameValue.trim()) {
      alert('Please enter an item name');
      return;
    }

    try {
      await itemEntity.add({
        name: nameValue.trim(),
        description: descriptionValue.trim(),
      });

      // Clear form
      newItemName.set('');
      newItemDescription.set('');
    } catch (error) {
      alert(`Failed to add item: ${errors.getErrorMessage(error)}`);
    }
  }

  // Delete item
  async function deleteItem(id: number): Promise<void> {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await itemEntity.delete(id);
      } catch (error) {
        alert(`Failed to delete item: ${errors.getErrorMessage(error)}`);
      }
    }
  }

  return {
    // Reactive stores
    newItemName,
    newItemDescription,
    items,

    // Entity instance
    itemEntity,

    // Functions
    addItem,
    deleteItem,
  };
}
