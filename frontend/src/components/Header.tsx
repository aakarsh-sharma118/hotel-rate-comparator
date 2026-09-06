import React, { useState } from 'react';
import { Search, BookOpen, GitBranch, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useHotelStore, AppTab } from '../store/useHotelStore';
import { useUrlRouting } from '../hooks/useUrlRouting';
import { PAGE_STRINGS } from '../constants/pageStrings';
import BrandLogo from './common/BrandLogo';

export const Header: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();
  const { activeTab, bookings } = useHotelStore();
  const { navigateToTab } = useUrlRouting();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: AppTab) => {
    navigateToTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;

  return (
    <header className="site-header">
      {/* Logo */}
      <div className="header-brand" onClick={() => handleNavClick('search')} style={{ cursor: 'pointer' }}>
        <BrandLogo size="md" />
      </div>

      {/* Navigation */}
      <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <button
          type="button"
          className={`nav-link ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => handleNavClick('search')}
        >
          <Search size={15} /> {PAGE_STRINGS.nav.search}
        </button>

        <button
          type="button"
          className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => handleNavClick('bookings')}
        >
          <BookOpen size={15} /> {PAGE_STRINGS.nav.bookings}
          {confirmedCount > 0 && <span className="nav-badge-count">{confirmedCount}</span>}
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          aria-label={PAGE_STRINGS.nav.themeToggleLabel}
          data-testid="theme-toggle-btn"
        >
          {isDark ? (
            <>
              <Sun size={15} className="theme-icon sun-icon" />
              <span className="theme-text">{PAGE_STRINGS.nav.lightMode}</span>
            </>
          ) : (
            <>
              <Moon size={15} className="theme-icon moon-icon" />
              <span className="theme-text">{PAGE_STRINGS.nav.darkMode}</span>
            </>
          )}
        </button>

        <a
          href="https://github.com/aakarsh-sharma118/hotel-rate-comparator"
          target="_blank"
          rel="noreferrer"
          className="nav-link github-pill"
          title={PAGE_STRINGS.nav.github}
          onClick={() => setMobileMenuOpen(false)}
        >
          <GitBranch size={14} /> {PAGE_STRINGS.nav.github}
        </a>
      </nav>

      {/* Mobile Menu */}
      <div className="mobile-header-actions">
        <button
          type="button"
          className="theme-toggle-btn mobile-theme-btn"
          onClick={toggleTheme}
          aria-label={PAGE_STRINGS.nav.themeToggleLabel}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={PAGE_STRINGS.nav.mobileMenuToggleLabel}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
