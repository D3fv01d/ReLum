import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faChartLine,
  faBook,
  faLaptopCode,
  faBell,
  faUser,
  faCog,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: faChartLine },
  { to: '/knowledge', label: '知识', icon: faBook },
  { to: '/practice', label: '练习', icon: faLaptopCode },
];

const getNavLinkClass = ({ isActive }) => (
  `nav-link ${isActive ? 'active' : ''} text-white hover:text-primary transition-colors duration-200 px-3 py-2`
);

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#222222] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 lg:gap-8">
            <NavLink to="/" className="font-['Pacifico'] text-primary text-2xl" onClick={() => setIsMenuOpen(false)}>
              ReLum
            </NavLink>
            <div className="hidden md:flex md:space-x-4 lg:space-x-6">
              {navItems.map(item => (
                <NavLink key={item.to} to={item.to} className={getNavLinkClass}>
                  <FontAwesomeIcon icon={item.icon} className="mr-2" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <button
                className="!rounded-button bg-secondary hover:bg-secondary/90 text-white p-2 whitespace-nowrap transition-colors duration-200"
                aria-label="通知"
                type="button"
              >
                <FontAwesomeIcon icon={faBell} />
              </button>
              <Link
                to="/settings"
                className="!rounded-button bg-secondary hover:bg-secondary/90 text-white p-2 whitespace-nowrap transition-colors duration-200 inline-flex items-center"
                aria-label="系统设置"
                onClick={() => setIsMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faCog} />
                <span className="sr-only">系统设置</span>
              </Link>
              <button
                className="!rounded-button bg-secondary hover:bg-secondary/90 text-white p-2 whitespace-nowrap transition-colors duration-200"
                aria-label="用户中心"
                type="button"
              >
                <FontAwesomeIcon icon={faUser} />
              </button>
              <button
                className="md:hidden !rounded-button bg-secondary hover:bg-secondary/90 text-white p-2 whitespace-nowrap transition-colors duration-200"
                aria-label={isMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
                aria-expanded={isMenuOpen}
                type="button"
                onClick={() => setIsMenuOpen(open => !open)}
              >
                <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-3">
            <div className="flex flex-col gap-1">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={getNavLinkClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={item.icon} className="mr-2" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
