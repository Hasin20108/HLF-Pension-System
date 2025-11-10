// ===== SECTION: Sub-components =====
import { LogoIcon, UserIcon, LogoutIcon, MoonIcon, SunIcon, CloseIcon} from "../utils/icon"

export const Navbar = ({ t, user, theme, language, onLoginClick, onRegisterClick, onLogout, onThemeToggle, onLangToggle }) => (
  <nav className="navbar">
    <div className="navbar-left">
      <LogoIcon />
      <h1>{t('appTitle')}</h1>
    </div>
    <div className="navbar-right">
      <button className="icon-button" onClick={onThemeToggle} aria-label={theme === 'light' ? t('darkMode') : t('lightMode')}>
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>
      <div className="lang-toggle">
        <button onClick={onLangToggle} className={language === 'bn' ? 'active' : ''}>BN</button>
        <span>/</span>
        <button onClick={onLangToggle} className={language === 'en' ? 'active' : ''}>EN</button>
      </div>
      {user ? (
        <div className="user-menu">
          <button className="user-avatar">
              <UserIcon /> {user.username} ({user.role})
          </button>
          <div className="user-dropdown">
              <button onClick={onLogout}><LogoutIcon/> {t('logout')}</button>
          </div>
        </div>
      ) : (
        <div className="auth-buttons">
          <button onClick={onLoginClick}>{t('login')}</button>
          <button onClick={onRegisterClick}>{t('register')}</button>
        </div>
      )}
    </div>
  </nav>
);
