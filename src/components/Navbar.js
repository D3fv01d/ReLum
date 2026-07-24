import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faBookOpen,
  faFlask,
  faGaugeHigh,
  faGear,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

const navItems = [
  { to: '/dashboard', label: '概览', icon: faGaugeHigh },
  { to: '/knowledge', label: '知识库', icon: faBookOpen },
  { to: '/practice', label: '靶场', icon: faFlask },
];

const getNavLinkClass = ({ isActive }) => (
  `app-nav-link ${isActive ? 'app-nav-link-active' : ''}`
);

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="app-brand" onClick={closeMenu} aria-label="ReLum 首页">
          <span className="app-brand-mark" aria-hidden="true">R</span>
          <span>
            <strong>ReLum</strong>
            <small>LOCAL LAB</small>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={getNavLinkClass}>
              <FontAwesomeIcon icon={item.icon} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NavLink
            to="/settings"
            className={({ isActive }) => `app-icon-button ${isActive ? 'app-icon-button-active' : ''}`}
            onClick={closeMenu}
            aria-label="设置"
            title="设置"
          >
            <FontAwesomeIcon icon={faGear} aria-hidden="true" />
          </NavLink>
          <button
            type="button"
            className="app-icon-button md:hidden"
            aria-label={isMenuOpen ? '关闭导航' : '打开导航'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} aria-hidden="true" />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="app-mobile-nav md:hidden" aria-label="移动端主导航">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={getNavLinkClass} onClick={closeMenu}>
              <FontAwesomeIcon icon={item.icon} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

export default Navbar;
