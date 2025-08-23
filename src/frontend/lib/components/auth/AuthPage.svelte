<script lang="ts">
  import type { createAuthLogic } from '$lib/logic/authLogic';
  import LoginForm from './LoginForm.svelte';
  import RegisterForm from './RegisterForm.svelte';

  export let authLogic: ReturnType<typeof createAuthLogic>;
  const { authState, login, register } = authLogic;

  let currentView = 'login';
  let registrationSuccess = false;

  function switchToLogin(): void {
    currentView = 'login';
    registrationSuccess = false;
    authLogic.clearError();
  }

  function switchToRegister(): void {
    currentView = 'register';
    registrationSuccess = false;
    authLogic.clearError();
  }

  async function handleLogin(email: string, password: string): Promise<void> {
    await login(email, password);
  }

  async function handleRegister(
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<void> {
    await register(email, password, confirmPassword);
    // Registration successful - switch to login view with success message
    registrationSuccess = true;
    currentView = 'login';
    // Clear any previous errors
    authLogic.clearError();
  }
</script>

<div class="auth-page">
  <div class="auth-container">
    <div class="auth-header">
      <h1 class="app-title">ChordLine</h1>
      <p class="app-subtitle">Track your musical journey</p>
    </div>

    <div class="auth-forms">
      {#if registrationSuccess}
        <div class="success-message">
          Account created successfully! Please sign in with your credentials.
        </div>
      {/if}

      {#if currentView === 'login'}
        <LoginForm
          authState={$authState}
          onLogin={handleLogin}
          on:switchToRegister={switchToRegister}
        />
      {:else}
        <RegisterForm
          authState={$authState}
          onRegister={handleRegister}
          on:switchToLogin={switchToLogin}
        />
      {/if}
    </div>
  </div>
</div>

<style>
  @import '$lib/styles/components/auth.css';
</style>
