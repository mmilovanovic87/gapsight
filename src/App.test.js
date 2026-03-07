import { render, screen } from '@testing-library/react';
import App from './App';

test('renders GapSight header', () => {
  render(<App />);
  const headings = screen.getAllByText(/GapSight/i);
  expect(headings.length).toBeGreaterThan(0);
});
