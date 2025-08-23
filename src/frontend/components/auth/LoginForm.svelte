<script>
  import { createEventDispatcher } from 'svelte';
  import { formValidators } from '../../logic/formValidation.ts';
  import { getLoadingButtonText, isFormReady } from '../../logic/uiUtils.ts';
  import FormField from '../shared/FormField.svelte';

  export let authState;
  export let onLogin;

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';

  $: validationErrors = formValidators.login(email, password);
  $: canSubmit = isFormReady(['email', 'password'], { email, password }, validationErrors);

  async function handleSubmit() {
    if (!canSubmit) return;

    try {
      await onLogin(email, password);
    } catch (error) {
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
  @import '../../css/components/forms.css';
</style>
