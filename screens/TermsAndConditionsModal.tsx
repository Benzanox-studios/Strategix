import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAppContext } from '../contexts/AppContext';

interface TermsAndConditionsModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({ onAccept, onDecline }) => {
  const [isChecked, setIsChecked] = useState(false);
  const { t } = useAppContext();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-brand-accent">{t('termsModal.title')}</h2>
            <button 
                onClick={onDecline} 
                className="bg-brand-primary px-3 py-1 rounded hover:bg-brand-secondary text-sm"
            >
                {t('common.back')}
            </button>
        </div>
        <div className="bg-brand-primary p-4 rounded-lg max-h-64 overflow-y-auto text-brand-text-dim mb-6">
          <p className="text-sm whitespace-pre-wrap">
            {t('termsModal.content')}
          </p>
        </div>
        <div className="flex items-center space-x-3 mb-6">
          <input
            type="checkbox"
            id="terms-agree"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
            className="w-5 h-5 rounded bg-brand-primary border-brand-accent text-brand-accent focus:ring-brand-accent"
          />
          <label htmlFor="terms-agree" className="text-brand-text cursor-pointer">
            {t('termsModal.agree')}
          </label>
        </div>
        <Button onClick={onAccept} disabled={!isChecked}>
          {t('termsModal.accept')}
        </Button>
      </Card>
    </div>
  );
};

export default TermsAndConditionsModal;
