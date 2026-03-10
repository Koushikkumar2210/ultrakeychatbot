
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
    it('renders the main application container', () => {
        render(<App />);
        expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('renders the chat header', () => {
        render(<App />);
        expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('renders the chat messages area', () => {
        render(<App />);
        expect(screen.getByRole('log')).toBeInTheDocument();
    });

    it('renders the chat input', () => {
        render(<App />);
        expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('renders the toggle button', () => {
        render(<App />);
        expect(screen.getByLabelText('Toggle chat window')).toBeInTheDocument();
    });
});
