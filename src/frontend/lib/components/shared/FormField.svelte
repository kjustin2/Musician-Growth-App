<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let id: string;
  export let label: string;
  export let type: string = 'text';
  export let value: string = '';
  export let placeholder: string = '';
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let error: string | undefined = undefined;

  const dispatch = createEventDispatcher();

  function handleBlur(): void {
    dispatch('blur');
  }
</script>

<div class="form-group">
  <label for={id} class="form-label">{label}</label>
  {#if type === 'email'}
    <input
      {id}
      type="email"
      bind:value
      {placeholder}
      {required}
      {disabled}
      class="form-input"
      class:error
      on:blur={handleBlur}
    />
  {:else if type === 'password'}
    <input
      {id}
      type="password"
      bind:value
      {placeholder}
      {required}
      {disabled}
      class="form-input"
      class:error
      on:blur={handleBlur}
    />
  {:else}
    <input
      {id}
      type="text"
      bind:value
      {placeholder}
      {required}
      {disabled}
      class="form-input"
      class:error
      on:blur={handleBlur}
    />
  {/if}
  {#if error}
    <span class="error-message">{error}</span>
  {/if}
</div>

<style>
  /* FormField specific styles - import shared styles in parent components */
  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
    font-weight: 500;
  }

  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  .form-input:focus {
    outline: none;
    border-color: #007bff;
  }

  .form-input.error {
    border-color: #dc3545;
  }

  .form-input:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }

  .error-message {
    display: block;
    margin-top: 0.25rem;
    color: #dc3545;
    font-size: 0.875rem;
  }
</style>
