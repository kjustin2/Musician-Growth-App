<script>
  import { createEventDispatcher } from 'svelte';
  import { validateLoginForm } from '../../logic/formValidation.ts';
  import { getLoadingButtonText, isFormReady } from '../../logic/uiUtils.ts';

  export let authState;
  export let onLogin;

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let validationErrors = {};

  // Real-time validation
  $: validationErrors = validateLoginForm(email, password);

  async function handleSubmit() {
    console.log('LoginForm: handleSubmit called', { email, hasPassword: !!password });

    if (!email || !password) {
      console.log('LoginForm: missing email or password');
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      console.log('LoginForm: validation errors present', validationErrors);
      return;
    }

    try {
      console.log('LoginForm: calling onLogin');
      await onLogin(email, password);
      console.log('LoginForm: onLogin completed successfully');
    } catch (error) {
      console.error('LoginForm: onLogin failed', error);
      // Error is handled by the auth logic
    }
  }

  function switchToRegister() {
    dispatch('switchToRegister');
  }
</script>

<div class="form-container">
  <div class="form-header">
    <h1>Welcome Back</h1>
    <p>Sign in to your ChordLine account</p>
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
        placeholder="Enter your password"
        required
        disabled={authState.isLoading}
        class="form-input"
        class:error={validationErrors.password}
      />
      {#if validationErrors.password}
        <span class="error-message">{validationErrors.password}</span>
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
        !isFormReady(['email', 'password'], { email, password }, validationErrors)}
      class="submit-button"
    >
      {getLoadingButtonText(authState.isLoading, 'Sign In', 'Signing In...')}
    </button>
  </form>

  <div class="form-footer">
    <p>
      Don't have an account?
      <button type="button" class="link-button" on:click={switchToRegister}>
        Create Account
      </button>
    </p>
  </div>
</div>

<style>
  @import '../../css/components/forms.css';
</style>
