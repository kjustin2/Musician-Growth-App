<script lang="ts">
  import type { AuthState } from '$lib/logic/authLogic';
  import { formValidators, type TouchedFields } from '$lib/logic/formValidation';
  import { getLoadingButtonText, hasAllRequiredFields } from '$lib/logic/uiUtils';
  import { createEventDispatcher } from 'svelte';
  import FormField from '../shared/FormField.svelte';

  export let authState: AuthState;
  export let onRegister: (
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let confirmPassword = '';
  let touchedFields: TouchedFields = {};
  let showAllErrors = false;

  $: validationErrors = formValidators.register(
    email,
    password,
    confirmPassword,
    touchedFields,
    showAllErrors
  );
  $: canSubmit =
    hasAllRequiredFields(['email', 'password', 'confirmPassword'], {
      email,
      password,
      confirmPassword,
    }) && Object.keys(validationErrors).length === 0;

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
      await onRegister(email, password, confirmPassword);
    } catch {
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
      on:blur={() => handleFieldBlur('email')}
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
      on:blur={() => handleFieldBlur('password')}
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
      on:blur={() => handleFieldBlur('confirmPassword')}
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
  @import '$lib/styles/components/forms.css';
</style>
