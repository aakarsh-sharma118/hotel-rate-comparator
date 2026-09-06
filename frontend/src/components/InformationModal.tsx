import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';
import { useHotelStore } from '../store/useHotelStore';
import { PAGE_STRINGS } from '../constants/pageStrings';
import CommonModal from './common/CommonModal';

export const InformationModal: React.FC = () => {
  const { policyModal, setPolicyModal } = useHotelStore();

  if (!policyModal) return null;

  const policyData = PAGE_STRINGS.policies[policyModal];
  if (!policyData) return null;

  const icons = {
    privacy: <ShieldCheck size={26} color="#16a34a" />,
    terms: <FileText size={26} color="#0284c7" />,
  };

  return (
    <CommonModal
      isOpen={Boolean(policyModal)}
      onClose={() => setPolicyModal(null)}
      title={policyData.title}
      subtitle={policyData.subtitle}
      badge={policyData.badge}
      icon={icons[policyModal]}
      maxWidth="680px"
      testId={`policy-modal-${policyModal}`}
      footer={
        <button
          type="button"
          className="btn-modal-primary"
          style={{ width: '100%' }}
          onClick={() => setPolicyModal(null)}
        >
          {PAGE_STRINGS.policies.agreeButton}
        </button>
      }
    >
      <div className="policy-sections-container">
        {policyData.sections.map((sec, idx) => (
          <div key={idx} className="policy-section-block">
            <h4 className="policy-section-heading">{sec.heading}</h4>
            <p className="policy-section-text">{sec.body}</p>
          </div>
        ))}
      </div>
    </CommonModal>
  );
};

export default InformationModal;
