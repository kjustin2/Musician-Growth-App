<script>
  export let id;
  export let label;
  export let type = 'text';
  export let value = '';
  export let placeholder = '';
  export let required = false;
  export let disabled = false;
  export let error = null;
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
    />
  {/if}
  {#if error}
    <span class="error-message">{error}</span>
  {/if}
</div>

<style>
  @import '../../css/components/forms.css';
</style>
