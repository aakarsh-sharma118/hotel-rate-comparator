import React from 'react';
import { useHotelStore } from '../store/useHotelStore';
import { useUrlRouting } from '../hooks/useUrlRouting';
import { PAGE_STRINGS } from '../constants/pageStrings';
import BrandLogo from './common/BrandLogo';

/**
 * Site footer component providing brand identity, navigation links,
 * legal modal triggers, and platform copyright notice.
 */
export const Footer: React.FC = () => {
  const { setPolicyModal } = useHotelStore();
  const { navigateToTab } = useUrlRouting();

  const handleNav = (tab: 'search' | 'bookings') => {
    navigateToTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="corporate-footer" data-testid="footer">
      {/* Navigation Columns */}
      <div className="footer-columns-grid">
        <div className="footer-brand-col">
          <BrandLogo size="md" />
          <p className="footer-brand-desc">{PAGE_STRINGS.footer.about}</p>
          <span className="company-legal-name">{PAGE_STRINGS.footer.company}</span>
        </div>

        {/* Platform Navigation */}
        <div className="footer-links-col">
          <h4>{PAGE_STRINGS.footer.headings.platform}</h4>
          <ul>
            <li>
              <button type="button" onClick={() => handleNav('search')}>
                {PAGE_STRINGS.footer.links.searchStays}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => handleNav('bookings')}>
                {PAGE_STRINGS.footer.links.myReservations}
              </button>
            </li>
          </ul>
        </div>

        {/* Support & Legal */}
        <div className="footer-links-col">
          <h4>{PAGE_STRINGS.footer.headings.supportLegal}</h4>
          <ul>
            <li>
              <button type="button" onClick={() => setPolicyModal('privacy')}>
                {PAGE_STRINGS.footer.links.privacy}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setPolicyModal('terms')}>
                {PAGE_STRINGS.footer.links.terms}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="footer-bottom-bar">
        <p className="footer-copyright-text">{PAGE_STRINGS.footer.copyright}</p>
      </div>
    </footer>
  );
};

export default Footer;
