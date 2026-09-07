import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from '../src/components/Footer';
import { PAGE_STRINGS } from '../src/constants/pageStrings';
import { useHotelStore } from '../src/store/useHotelStore';

describe('Footer Component', () => {
  it('renders official brand info, platform links, legal copyright without FAQ or engine internals', () => {
    render(<Footer />);

    const footerElem = screen.getByTestId('footer');
    expect(footerElem).toBeInTheDocument();

    const brandLogo = screen.getByTestId('brand-logo');
    expect(brandLogo).toBeInTheDocument();
    expect(brandLogo).toHaveTextContent(/Hotel/);
    expect(brandLogo).toHaveTextContent(/Finder/);
    expect(screen.getByText(PAGE_STRINGS.footer.copyright)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Platform/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Support & Legal/i })).toBeInTheDocument();

    // Navigation links work
    const searchBtn = screen.getByRole('button', { name: PAGE_STRINGS.footer.links.searchStays });
    fireEvent.click(searchBtn);
    expect(useHotelStore.getState().activeTab).toBe('search');

    // FAQ should NOT be present in footer
    expect(screen.queryByText(/Frequently Asked Questions/i)).not.toBeInTheDocument();

    // Must NOT contain AI watermarks or internal emails
    expect(screen.queryByText(/orchestrated by temporal\.io workflows/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/kaushal@tripare\.com/i)).not.toBeInTheDocument();
  });
});
