import { useState, useEffect, useRef } from 'react';
import {  formatCurrency } from "../../utils/helpers"


export const ContribWithdrawForm = ({ t, pension, mode, onSubmit, onCancel }) => {
    const [amount, setAmount] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(Number(amount));
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            <p><strong>{t('recipientName')}:</strong> {pension?.recipientName}</p>
            <p><strong>Current {t('amount')}:</strong> {formatCurrency(pension?.amount)}</p>
            <div className="form-group"> 
                <label htmlFor="<BankName">{t('Bank Name')}</label>
                <input name="BankName" required type ="text"/>
            </div>
            <div className="form-group">
                <label htmlFor="contrib-withdraw-amount">{mode === 'contribute' ? t('contributionAmount') : t('withdrawalAmount')}</label>
                <input 
                    ref={inputRef}
                    id="contrib-withdraw-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                />
            </div>
            <div className="modal-actions">
                <button type="submit" className="primary">{t(mode)}</button>
                <button type="button" onClick={onCancel}>{t('cancel')}</button>
            </div>
        </form>
    );
};
