import { useState, useEffect } from 'react';
import {  Modal } from "../ReusableComponents.jsx"
import {  PENSION_STATUSES} from "../../utils/constants.js"



export const FormCreateEdit = ({ t, isVisible, isEditing, initialData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <Modal isVisible={isVisible} onClose={onClose} title={isEditing ? t('editPension') : t('createPension')}>
        <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group"> 
                <label htmlFor="recipientName">{t('formRecipientName')}</label>
                <input id="recipientName" name="recipientName" value={formData.recipientName} onChange={handleChange} required type ="text"/>
            </div>
            <div className="form-group">
                <label htmlFor="amount">{t('formAmountBdt')}</label>
                <input id="amount" name="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="status">{t('status')}</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} required>
                    {PENSION_STATUSES.map(s => <option key={s} value={s}>{t(s.toLowerCase())}</option>)}
                </select>
            </div>
            <div className="modal-actions">
                <button type="submit" className="primary">{isEditing ? t('saveChanges') : t('createPension')}</button>
                <button type="button" onClick={onClose}>{t('cancel')}</button>
            </div>
        </form>
    </Modal>
  );
};