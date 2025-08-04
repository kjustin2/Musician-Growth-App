import App from './App.svelte';
import './css/app.css';

const appElement = document.getElementById('app');
if (!appElement) {
  throw new Error('Could not find app element');
}

const app = new App({
  target: appElement,
});

export default app;
