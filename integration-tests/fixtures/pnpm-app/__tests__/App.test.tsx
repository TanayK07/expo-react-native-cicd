import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  it('renders hello world text', () => {
    render(<App />);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });
});
