import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { PAGE_STRINGS } from '../../constants/pageStrings';

export interface CommonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  testId?: string;
}

export const CommonModal: React.FC<CommonModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  badge,
  children,
  footer,
  maxWidth = '640px',
  testId = 'common-modal',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      data-testid={testId}
      role="dialog"
      aria-modal="true"
      aria-labelledby="common-modal-title"
    >
      <div
        className="modal-card common-modal-card"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label={PAGE_STRINGS.common.closeModal}
        >
          <X size={18} />
        </button>

        <div className="modal-header common-modal-header">
          {icon && <div className="common-modal-icon-wrapper">{icon}</div>}
          <div className="common-modal-title-group">
            {badge && <span className="common-modal-badge">{badge}</span>}
            <h2 id="common-modal-title" className="modal-title">{title}</h2>
            {subtitle && <p className="common-modal-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className="modal-body common-modal-body">
          {children}
        </div>

        {footer && <div className="modal-actions common-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default CommonModal;
