<script lang="ts">
  import type { AuthState } from '$lib/logic/authLogic';
  import { formValidators, type TouchedFields } from '$lib/logic/formValidation';
  import { getLoadingButtonText, hasAllRequiredFields } from '$lib/logic/uiUtils';
  import { createEventDispatcher } from 'svelte';
  import FormField from '../shared/FormField.svelte';

  export let authState: AuthState;
  export let onLogin: (email: string, password: string) => Promise<void>;

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let touchedFields: TouchedFields = {};
  let showAllErrors = false;

  $: validationErrors = formValidators.login(email, password, touchedFields, showAllErrors);
  $: canSubmit =
    hasAllRequiredFields(['email', 'password'], { email, password }) &&
    Object.keys(validationErrors).length === 0;

  function handleFieldBlur(fieldName: string): void {
    touchedFields[fieldName] = true;
    touchedFields = { ...touchedFields }; // Trigger reactivity
  }

  async function handleSubmit(): Promise<void> {
    showAllErrors = true;

    if (!canSubmit) {
      return;
    }

    try {
      await onLogin(email, password);
    } catch {
      // Error is handled by the auth logic
    }
  }
</script>

<div class="form-container">
  <div class="form-header">
    <h1>Welcome Back</h1>
    <p>Sign in to your ChordLine account</p>
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
      on:blur={() => handleFieldBlur('email')}
    />

    <FormField
      id="password"
      type="password"
      label="Password"
      placeholder="Enter your password"
      bind:value={password}
      required
      disabled={authState.isLoading}
      error={validationErrors.password}
      on:blur={() => handleFieldBlur('password')}
    />

    {#if authState.error}
      <div class="form-error">{authState.error}</div>
    {/if}

    <button type="submit" disabled={authState.isLoading || !canSubmit} class="submit-button">
      {getLoadingButtonText(authState.isLoading, 'Sign In', 'Signing In...')}
    </button>
  </form>

  <div class="form-footer">
    <p>
      Don't have an account?
      <button type="button" class="link-button" on:click={() => dispatch('switchToRegister')}>
        Create Account
      </button>
    </p>
  </div>
</div>

<style>
  @import '$lib/styles/components/forms.css';
</style>
