// HomePage.jsx
import React, { useState } from "react";
import bgImage from '../assets/bg1.jpg'

const HomePage = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen w-full bg-center bg-cover" style={{backgroundImage: `url(${bgImage})` }}>
      <div className="min-h-screen w-full bg-gradient-to-r from-black/35 via-black/10 to-black/25">
        {/* NAVBAR */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <br />
          <nav className="flex items-center justify-between py-5">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm">$</div>
              <div className="text-white text-sm font-semibold tracking-wider uppercase">SecureLedger25</div>
            </div>

            {/* Menu */}
            <div className="flex items-center gap-4">
              <ul className="hidden md:flex gap-8 text-md text-white/90 font-medium">
                <li><a href="#" className="nav-link hover:text-white transition">Home</a></li>
                <li><a href="#services" className="nav-link hover:text-white transition">Services</a></li>
                <li><a href="#community" className="nav-link hover:text-white transition">Community</a></li>
                <li><a href="#contact" className="nav-link hover:text-white transition">Contact Us</a></li>
              </ul>

              {/* Mobile Hamburger */}
              <button 
                onClick={toggleMobileMenu} 
                aria-label="Toggle navigation" 
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white/90 hover:bg-white/10 focus:outline-none"
              >
                <svg id="icon-open" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                </svg>
                <svg id="icon-close" xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isMobileMenuOpen ? 'block' : 'hidden'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </nav>

          {/* Mobile Menu */}
          <div id="mobile-menu" className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <ul className="bg-black/40 backdrop-blur-sm rounded-lg p-4 space-y-2 text-white/95">
              <li><a href="#" className="mobile-link block py-2 px-3 rounded hover:bg-white/5 transition nav-link">Home</a></li>
              <li><a href="#services" className="mobile-link block py-2 px-3 rounded hover:bg-white/5 transition nav-link">Services</a></li>
              <li><a href="#community" className="mobile-link block py-2 px-3 rounded hover:bg-white/5 transition nav-link">Community</a></li>
              <li><a href="#contact" className="mobile-link block py-2 px-3 rounded hover:bg-white/5 transition nav-link">Contact Us</a></li>
              <li><a href="#" className="mobile-link block text-center py-2 px-3 rounded border border-white/30 hover:bg-white/5 transition font-semibold">Discover</a></li>
            </ul>
          </div>
        </header>

        {/* HERO SECTION */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <br />
          <br />
          <div className="flex flex-col lg:flex-row items-stretch gap-8">
            <div className="hidden lg:block lg:w-1/2"></div>
            <section className="w-full lg:w-1/2 flex items-center">
              <div className="w-full bg-transparent p-6 sm:p-10 lg:p-12 rounded-md">
                <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight uppercase drop-shadow-md">
                  Tamper-Proof 
                  <span className="block text-3xl sm:text-4xl lg:text-5xl text-white/95 mt-1">Pension</span>
                </h2>

                <p className="mt-5 text-md sm:text-base text-white/90 max-w-xl leading-relaxed">
Unlock enterprise innovation with Hyperledger — a secure, scalable, and collaborative blockchain framework for building trusted solutions.                </p>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
                  <a href="/dashbord"
                     className="hero-button inline-block px-6 py-3 rounded-md text-sm sm:text-base font-semibold border border-white/40 text-white text-center">
                    DISCOVER NOW ›››
                  </a>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
