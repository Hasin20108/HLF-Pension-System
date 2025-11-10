import React, { useState,}from 'react';
import { ROLES} from "../../utils/constants"


export const AuthForm = ({ t, mode, onSubmit }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(ROLES.VIEWER);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock authentication
        if (username && password) {
            onSubmit({ username, role: mode === 'register' ? role : (username.toLowerCase() === 'admin' ? ROLES.ADMIN : ROLES.CLERK) });
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
                <label htmlFor="auth-username">{t('username')}</label>
                <input id="auth-username" value={username} onChange={e => setUsername(e.target.value)} required type='text'/>
            </div>
            <div className="form-group">
                <label htmlFor="auth-password">{t('password')}</label>
                <input id="auth-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {mode === 'register' && (
                <div className="form-group">
                    <label htmlFor="auth-role">{t('role')}</label>
                    <select id="auth-role" value={role} onChange={e => setRole(e.target.value)}>
                        {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            )}
            <div className="modal-actions">
                <button type="submit" className="primary">{t(mode)}</button>
            </div>
        </form>
    );
};
