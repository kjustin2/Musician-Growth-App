<script>
  import { createEventDispatcher } from 'svelte';
  import { formValidators } from '../../logic/formValidation.ts';
  import { getLoadingButtonText, isFormReady } from '../../logic/uiUtils.ts';
  import FormField from '../shared/FormField.svelte';

  export let authState;
  export let onRegister;

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let confirmPassword = '';

  $: validationErrors = formValidators.register(email, password, confirmPassword);
  $: canSubmit = isFormReady(
    ['email', 'password', 'confirmPassword'],
    { email, password, confirmPassword },
    validationErrors
  );

  async function handleSubmit() {
    if (!canSubmit) return;

    try {
      await onRegister(email, password, confirmPassword);
    } catch (error) {
      // Error is handled by the auth logic
    }
  }
</script>

<div class="form-container">
  <div class="form-header">
    <h1>Create Account</h1>
    <p>Join ChordLine to track your musical journey</p>
  </div>

  <form on:submit|preventDefault={handleSubmit}>
    <FormField
      id="email"
      type="email"
      label="Email Address"
      placeholder="Enter your email"
      bind:value={email}
      required
      disabled={authState.isLoading}
      error={validationErrors.email}
    />

    <FormField
      id="password"
      type="password"
      label="Password"
      placeholder="Create a password"
      bind:value={password}
      required
      disabled={authState.isLoading}
      error={validationErrors.password}
    />

    <FormField
      id="confirmPassword"
      type="password"
      label="Confirm Password"
      placeholder="Confirm your password"
      bind:value={confirmPassword}
      required
      disabled={authState.isLoading}
      error={validationErrors.confirmPassword}
    />

    {#if authState.error}
      <div class="form-error">{authState.error}</div>
    {/if}

    <button type="submit" disabled={authState.isLoading || !canSubmit} class="submit-button">
      {getLoadingButtonText(authState.isLoading, 'Create Account', 'Creating Account...')}
    </button>
  </form>

  <div class="form-footer">
    <p>
      Already have an account?
      <button type="button" class="link-button" on:click={() => dispatch('switchToLogin')}>
        Sign In
      </button>
    </p>
  </div>
</div>

<style>
  @import '../../css/components/forms.css';
</style>
