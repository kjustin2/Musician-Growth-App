import { render } from '@testing-library/react';
import { AppProvider } from './context/AppContext';

const customRender = (ui: React.ReactElement, options?: any) =>
  render(ui, { wrapper: AppProvider, ...options });

export * from '@testing-library/react';
export { customRender as render };
