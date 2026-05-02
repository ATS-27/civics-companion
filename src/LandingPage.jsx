import React from 'react';
import { ArrowRight, ShieldCheck, MapPin, Search } from 'lucide-react';
import './LandingPage.css';
import logo from './assets/civics_logo.png';

const LandingPage = ({ onStart }) => {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-header">
          <div className="logo-container">
            <img src={logo} alt="Civics Companion Logo" className="logo-image" />
          </div>
          <h1 className="landing-title">Civics Companion</h1>
          <p className="landing-subtitle">Your private, secure guide to participating in Indian democracy.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={24} className="feature-icon" />
            </div>
            <h3>Privacy First</h3>
            <p>Runs entirely in your browser. No personal data ever leaves your device.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <MapPin size={24} className="feature-icon" />
            </div>
            <h3>Location Aware</h3>
            <p>Tailored information based on your specific state or union territory.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Search size={24} className="feature-icon" />
            </div>
            <h3>Accurate Data</h3>
            <p>Provides up-to-date information on upcoming elections and ID requirements.</p>
          </div>
        </div>

        <button className="start-btn" onClick={onStart}>
          Enter Application
          <ArrowRight size={20} />
        </button>
      </div>
      
      <div className="landing-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
    </div>
  );
};

export default LandingPage;
