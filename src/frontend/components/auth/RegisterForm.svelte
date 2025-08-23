<script>
  import { createEventDispatcher } from 'svelte';
  import { validateRegistrationForm } from '../../logic/formValidation.ts';
  import { getLoadingButtonText, isFormReady } from '../../logic/uiUtils.ts';

  export let authState;
  export let onRegister;

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let confirmPassword = '';
  let validationErrors = {};

  // Real-time validation
  $: validationErrors = validateRegistrationForm(email, password, confirmPassword);

  async function handleSubmit() {
    if (!email || !password || !confirmPassword) {
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      await onRegister(email, password, confirmPassword);
    } catch (error) {
      // Error is handled by the auth logic
    }
  }

  function switchToLogin() {
    dispatch('switchToLogin');
  }
</script>

<div class="form-container">
  <div class="form-header">
    <h1>Create Account</h1>
    <p>Join ChordLine to track your musical journey</p>
  </div>

  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="email" class="form-label">Email Address</label>
      <input
        id="email"
        type="email"
        bind:value={email}
        placeholder="Enter your email"
        required
        disabled={authState.isLoading}
        class="form-input"
        class:error={validationErrors.email}
      />
      {#if validationErrors.email}
        <span class="error-message">{validationErrors.email}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="password" class="form-label">Password</label>
      <input
        id="password"
        type="password"
        bind:value={password}
        placeholder="Create a password"
        required
        disabled={authState.isLoading}
        class="form-input"
        class:error={validationErrors.password}
      />
      {#if validationErrors.password}
        <span class="error-message">{validationErrors.password}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="confirmPassword" class="form-label">Confirm Password</label>
      <input
        id="confirmPassword"
        type="password"
        bind:value={confirmPassword}
        placeholder="Confirm your password"
        required
        disabled={authState.isLoading}
        class="form-input"
        class:error={validationErrors.confirmPassword}
      />
      {#if validationErrors.confirmPassword}
        <span class="error-message">{validationErrors.confirmPassword}</span>
      {/if}
    </div>

    {#if authState.error}
      <div class="form-error">
        {authState.error}
      </div>
    {/if}

    <button
      type="submit"
      disabled={authState.isLoading ||
        !isFormReady(
          ['email', 'password', 'confirmPassword'],
          { email, password, confirmPassword },
          validationErrors
        )}
      class="submit-button"
    >
      {getLoadingButtonText(authState.isLoading, 'Create Account', 'Creating Account...')}
    </button>
  </form>

  <div class="form-footer">
    <p>
      Already have an account?
      <button type="button" class="link-button" on:click={switchToLogin}> Sign In </button>
    </p>
  </div>
</div>

<style>
  @import '../../css/components/forms.css';
</style>
