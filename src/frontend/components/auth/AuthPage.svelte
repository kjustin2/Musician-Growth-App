<script>
  import LoginForm from './LoginForm.svelte';
  import RegisterForm from './RegisterForm.svelte';

  export let authLogic;
  const { authState, login, register, initialize } = authLogic;

  let currentView = 'login';
  let registrationSuccess = false;

  function switchToLogin() {
    currentView = 'login';
    registrationSuccess = false;
    authLogic.clearError();
  }

  function switchToRegister() {
    currentView = 'register';
    registrationSuccess = false;
    authLogic.clearError();
  }

  async function handleLogin(email, password) {
    console.log('AuthPage: handleLogin called', { email });
    try {
      await login(email, password);
      console.log('AuthPage: login successful');
    } catch (error) {
      console.error('AuthPage: login failed', error);
      throw error;
    }
  }

  // Add reactive logging for auth state changes in AuthPage
  $: {
    console.log('AuthPage: Auth state changed:', {
      isLoading: $authState.isLoading,
      isAuthenticated: $authState.isAuthenticated,
      hasUser: !!$authState.user,
      error: $authState.error,
    });
  }

  async function handleRegister(email, password, confirmPassword) {
    try {
      await register(email, password, confirmPassword);
      // Registration successful - switch to login view with success message
      registrationSuccess = true;
      currentView = 'login';
      // Clear any previous errors
      authLogic.clearError();
    } catch (error) {
      // Error is already handled by authLogic, just re-throw to prevent view switch
      throw error;
    }
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
  @import '../../css/components/auth.css';
</style>
