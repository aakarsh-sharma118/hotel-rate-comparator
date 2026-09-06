import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CorporateFooter } from '../src/components/CorporateFooter';
import { PAGE_STRINGS } from '../src/constants/pageStrings';
import { useHotelStore } from '../src/store/useHotelStore';

describe('CorporateFooter Component', () => {
  it('renders official brand info, platform links, legal copyright without engine orchestration or architecture', () => {
    render(<CorporateFooter />);

    const brandLogo = screen.getByTestId('brand-logo');
    expect(brandLogo).toBeInTheDocument();
    expect(brandLogo).toHaveTextContent(/Hotel/);
    expect(brandLogo).toHaveTextContent(/Finder/);
    expect(screen.getByText(PAGE_STRINGS.footer.copyright)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Platform/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Support & Legal/i })).toBeInTheDocument();

    // Engine Architecture, Engine Orchestration, and Security Architecture removed as requested
    expect(screen.queryByRole('button', { name: /Engine Architecture/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Engine Orchestration/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Security Architecture/i })).not.toBeInTheDocument();

    // Navigation links work
    const searchBtn = screen.getByRole('button', { name: PAGE_STRINGS.footer.links.searchStays });
    fireEvent.click(searchBtn);
    expect(useHotelStore.getState().activeTab).toBe('search');

    // Must NOT contain AI watermarks or reviewer emails
    expect(screen.queryByText(/orchestrated by temporal\.io workflows/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/kaushal@tripare\.com/i)).not.toBeInTheDocument();
  });
});
