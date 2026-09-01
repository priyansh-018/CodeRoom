import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/Auth/AuthModal';
import { ProfileModal } from '../components/Profile/ProfileModal';
import { SupportModal } from '../components/Support/SupportModal';
import type { UserRole } from '../types';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<UserRole>('CANDIDATE');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const openAuth = (mode: 'login' | 'register', role: UserRole = 'CANDIDATE') => {
    setAuthMode(mode);
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="cr-landing">
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        initialRole={authRole}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Help & Support Modal */}
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />

      {/* ─── 1. NAVBAR ─── */}
      <header className="cr-nav">
        <div className="cr-nav-inner">
          <div className="cr-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Coderoom
          </div>

          <nav className="cr-nav-links">
            <button onClick={() => scrollTo('features')} className="cr-nav-link">Product</button>
            <button onClick={() => scrollTo('architecture')} className="cr-nav-link">Features</button>
            <button onClick={() => setSupportModalOpen(true)} className="cr-nav-link">Help / Support</button>
            <button onClick={() => scrollTo('cta')} className="cr-nav-link">Docs</button>
          </nav>

          <div className="cr-nav-actions">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="cr-btn-primary"
                >
                  Dashboard ({user?.role === 'HOST' ? 'Interviewer' : 'Candidate'})
                </button>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="cr-btn-outline"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  {user?.name || 'Profile'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuth('login')}
                  className="cr-nav-login-btn"
                >
                  Login
                </button>
                <button
                  onClick={() => openAuth('register', 'CANDIDATE')}
                  className="cr-btn-primary"
                >
                  Start Coding
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── 2. HERO SECTION ─── */}
      <section className="cr-hero">
        <h1 className="cr-hero-title">
          Code together,<br />
          in real time.
        </h1>
        <p className="cr-hero-desc">
          The high-performance workspace for engineering teams. Build, debug, and ship
          faster with multiplayer editing that feels instantaneous.
        </p>
        <div className="cr-hero-actions">
          <button
            onClick={() => {
              if (isAuthenticated) {
                navigate('/dashboard');
              } else {
                openAuth('register', 'HOST');
              }
            }}
            className="cr-btn-primary cr-btn-lg"
          >
            Start a Room
          </button>
        </div>
      </section>

      {/* ─── 3. ASYMMETRIC BENTO GRID (EXACT MATCH MOCKUP) ─── */}
      <section id="features" className="cr-bento-section">
        <div className="cr-bento-grid">
          {/* Card 1: Real-time sync (Black Card, Spans 2 cols) */}
          <div className="cr-card cr-card-black cr-card-col-2">
            <div className="cr-card-header">
              <div className="cr-card-icon cr-card-icon-green">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                </svg>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '2px', height: '24px', background: '#72F000' }} />
                <span style={{
                  border: '1.5px solid rgba(114, 240, 0, 0.4)',
                  background: 'rgba(114, 240, 0, 0.12)',
                  color: '#72F000',
                  borderRadius: '12px',
                  padding: '2px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em'
                }}>
                  ALICE
                </span>
              </div>
            </div>
            <div className="cr-card-body">
              <h3 className="cr-card-title">Real-time sync</h3>
              <p className="cr-card-desc">
                Zero latency collaborative editing. See keystrokes as they happen across the globe.
              </p>
            </div>
          </div>

          {/* Card 2: Voice & video chat (Gray Card, Spans 1 col) */}
          <div className="cr-card cr-card-gray">
            <div className="cr-card-header">
              <div className="cr-card-icon cr-card-icon-black">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M19 8a3 3 0 0 1 0 6"/>
                </svg>
              </div>
            </div>
            <div className="cr-card-body">
              <h3 className="cr-card-title">Voice &amp; video chat</h3>
              <p className="cr-card-desc">
                Integrated communication without leaving the editor.
              </p>
            </div>
          </div>

          {/* Card 3: Multi-language support (Neon Green Card, Spans 1 col) */}
          <div className="cr-card cr-card-green">
            <div className="cr-card-header">
              <div className="cr-card-icon cr-card-icon-black">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
            </div>
            <div className="cr-card-body">
              <h3 className="cr-card-title">Multi-language support</h3>
              <p className="cr-card-desc">
                Syntax highlighting for over 50+ languages out of the box.
              </p>
            </div>
          </div>

          {/* Card 4: Session recording (Black Card, Spans 1 col) */}
          <div className="cr-card cr-card-black">
            <div className="cr-card-header">
              <div className="cr-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="9" stroke="#FFFFFF"/>
                  <circle cx="12" cy="12" r="4" fill="#FFFFFF"/>
                </svg>
              </div>
            </div>
            <div className="cr-card-body">
              <h3 className="cr-card-title">Session recording</h3>
              <p className="cr-card-desc">
                Playback coding sessions for code reviews or tutorials.
              </p>
            </div>
          </div>

          {/* Card 5: Instant room links (Gray Card, Spans 1 col) */}
          <div className="cr-card cr-card-gray">
            <div className="cr-card-header">
              <div className="cr-card-icon cr-card-icon-black">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
            </div>
            <div className="cr-card-body">
              <h3 className="cr-card-title">Instant room links</h3>
              <p className="cr-card-desc">
                Share a secure URL and start coding together immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. SPLIT PANEL SECTION (EXACT MOCKUP) ─── */}
      <section id="architecture" className="cr-split-section">
        <div className="cr-split-card">
          <div>
            <h2 className="cr-split-title">
              See changes as<br />
              they happen.
            </h2>
            <p className="cr-split-desc">
              Experience true multiplayer coding. Conflict-free editing built on advanced
              CRDTs ensures your team stays perfectly in sync.
            </p>
            <button
              onClick={() => openAuth('register', 'CANDIDATE')}
              className="cr-split-link"
            >
              Start Coding Now →
            </button>
          </div>

          <div className="cr-code-window">
            <div className="cr-code-dots">
              <div className="cr-code-dot"></div>
              <div className="cr-code-dot"></div>
              <div className="cr-code-dot"></div>
            </div>
            <div>
              <div className="cr-code-line">
                <span className="cr-code-num">1</span>
                <span><span className="cr-code-keyword">function</span> <span className="cr-code-fn">initializeSync</span>() &#123;</span>
              </div>
              <div className="cr-code-line">
                <span className="cr-code-num">2</span>
                <span>  <span className="cr-code-keyword">const</span> <span className="cr-code-var">room</span> = <span className="cr-code-keyword">new</span> <span className="cr-code-fn">Coderoom</span>(<span className="cr-code-str">'dev-alpha'</span>);</span>
              </div>
              <div className="cr-code-line">
                <span className="cr-code-num">3</span>
                <span>  <span className="cr-code-var">room</span>.<span className="cr-code-fn">on</span>(<span className="cr-code-str">'connect'</span>, () =&gt; &#123;</span>
              </div>
              <div className="cr-code-line">
                <span className="cr-code-num">4</span>
                <span>    <span className="cr-code-var">console</span>.<span className="cr-code-fn">log</span>(<span className="cr-code-str">'Sync active'</span>); <span className="cr-code-cursor-pill">ALICE</span></span>
              </div>
              <div className="cr-code-line">
                <span className="cr-code-num">5</span>
                <span>  &#125;);</span>
              </div>
              <div className="cr-code-line">
                <span className="cr-code-num">6</span>
                <span>&#125;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. READY TO BUILD BANNER ─── */}
      <section id="cta" className="cr-banner-section">
        <div className="cr-banner-card">
          <h2 className="cr-banner-title">
            Ready to build together?
          </h2>
          <button
            onClick={() => {
              if (isAuthenticated) {
                navigate('/dashboard');
              } else {
                openAuth('register', 'CANDIDATE');
              }
            }}
            className="cr-banner-btn"
          >
            Create your first room — free
          </button>
        </div>
      </section>

      {/* ─── 6. FOOTER ─── */}
      <footer className="cr-footer">
        <div className="cr-footer-inner">
          <div className="cr-footer-brand">
            <div className="cr-footer-logo">Coderoom</div>
            <div className="cr-footer-copy">
              © 2026 Coderoom. Built for the next generation of engineers.
            </div>
          </div>

          <div className="cr-footer-links">
            <button onClick={() => setSupportModalOpen(true)} className="cr-footer-link">Help / Support</button>
            <button className="cr-footer-link">Privacy Policy</button>
            <button className="cr-footer-link">Terms of Service</button>
            <button className="cr-footer-link">Status</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
