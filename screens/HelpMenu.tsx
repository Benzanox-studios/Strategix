import React, { useState } from 'react';
import { Screen } from '../types';
import Button from '../components/Button';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/Card';
import Modal from '../components/Modal';

const HelpMenu: React.FC<{ navigateTo: (screen: Screen) => void; }> = ({ navigateTo }) => {
  const { t } = useAppContext();
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const rules = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
  const faqs = ['faq1'];

  return (
    <>
      <Card>
        <h2 className="text-3xl font-bold text-center text-brand-accent mb-6">{t('helpMenu.title')}</h2>
        
        <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
          <div>
            <h3 className="text-xl font-bold text-brand-accent border-b border-brand-accent pb-1 mb-3">{t('helpMenu.rules')}</h3>
            <ul className="space-y-2 list-disc list-inside text-brand-text-dim">
              {rules.map(rule => <li key={rule}>{t(`helpMenu.${rule}`)}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-brand-accent border-b border-brand-accent pb-1 mb-3">{t('helpMenu.faq')}</h3>
            <div className="space-y-3">
              {faqs.map(faq => (
                <div key={faq}>
                  <p className="font-bold text-brand-text">{t(`helpMenu.${faq}_q`)}</p>
                  <p className="text-brand-text-dim">{t(`helpMenu.${faq}_a`)}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-brand-accent border-b border-brand-accent pb-1 mb-3">{t('termsModal.title')}</h3>
            <div className="mt-2">
              <Button onClick={() => setIsTermsModalOpen(true)} variant="secondary">
                {t('helpMenu.viewTerms')}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={() => navigateTo('main')} variant="secondary">{t('common.back')}</Button>
        </div>
      </Card>

      <Modal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} title={t('termsModal.title')}>
        <div className="bg-brand-primary p-4 rounded-lg max-h-[60vh] overflow-y-auto text-brand-text-dim">
          <p className="text-sm whitespace-pre-wrap">
            {t('termsModal.content')}
          </p>
        </div>
        <div className="mt-6">
            <Button onClick={() => setIsTermsModalOpen(false)}>{t('common.back')}</Button>
        </div>
      </Modal>
    </>
  );
};

export default HelpMenu;