import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { PAGE_STRINGS } from '../constants/pageStrings';

export const FaqView: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page-container">
      <div className="section-header-block">
        <span className="section-kicker">{PAGE_STRINGS.faq.kicker}</span>
        <h1 className="section-main-title">{PAGE_STRINGS.faq.title}</h1>
        <p className="section-main-desc">{PAGE_STRINGS.faq.subtitle}</p>
      </div>

      <div className="faq-list">
        {PAGE_STRINGS.faq.items.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div key={idx} className={`faq-item ${isOpen ? 'is-expanded' : ''}`}>
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
              >
                <span className="faq-q-text">
                  <HelpCircle size={18} className="faq-icon" /> {item.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`faq-chevron ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="faq-answer-pane">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="faq-support-box">
        <MessageSquare size={22} color="#0284c7" />
        <div>
          <h4>{PAGE_STRINGS.faq.supportTitle}</h4>
          <p>{PAGE_STRINGS.faq.supportSubtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default FaqView;
