import React from 'react';
import logoImg from '../../assets/logo.png';
import { PAGE_STRINGS } from '../../constants/pageStrings';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  return (
    <div className={`brand-logo-container size-${size} ${className}`} data-testid="brand-logo">
      <img
        src={logoImg}
        alt={PAGE_STRINGS.brand.logoAlt}
        className="brand-logo-img"
      />

      {/* Brand Title */}
      <div className="brand-titles">
        <span className="brand-name">
          {PAGE_STRINGS.brand.namePrefix}
          <span className="brand-highlight">{PAGE_STRINGS.brand.nameHighlight}</span>
        </span>
        {showTagline && (
          <>
            <span className="brand-divider">|</span>
            <span className="brand-tag">{PAGE_STRINGS.brand.tagline}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
