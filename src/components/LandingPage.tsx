import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LandingPageProps {
  user: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({ user }) => {
  // TODO: Add payment gateway when upgrade to pro feature is available
  const handleProUpgrade = () => {
    alert('Upgrade to Pro is not available yet.');
  };
  const navigate = useNavigate();

  return (
    <div className="bg-background text-slate-800 font-sans min-h-screen overflow-x-hidden selection:bg-accent selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-16 py-6 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-base">sync</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">QuickSync</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-10 items-center text-[13px] font-semibold text-slate-500">
          <a className="hover:text-slate-900 transition-colors" href="#how-it-works">Features</a>
          <a className="hover:text-slate-900 transition-colors" href="#security">Security</a>
          <a className="hover:text-slate-900 transition-colors" href="#">Docs</a>
        </nav>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/app')}
                className="hidden md:flex items-center gap-2 text-[14px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">grid_view</span>
                Dashboard
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden hover:border-accent transition-colors flex-shrink-0 flex items-center justify-center bg-accent text-white font-bold text-lg shadow-sm"
                title="Profile"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-500">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/auth')} className="px-6 py-2.5 rounded-full text-[13px] font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm">
              Get Started
            </button>
          )}
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-32 md:pt-40 pb-20">        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            v2.0 P2P Engine
          </div>

          <h1 className="text-5xl md:text-8xl font-bold text-slate-900 tracking-tighter leading-[0.9] max-w-4xl mb-8">
            Sync your workspace <br />
            <span className="text-slate-300">everywhere.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-12 font-medium leading-relaxed">
            Move files and clipboard data instantly between devices.
            Direct encrypted transfer without the cloud.
          </p>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/app')} className="px-10 py-4 rounded-full text-base font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
              Start Syncing
            </button>
            <a href="#how-it-works" className="text-sm font-bold text-slate-900 hover:opacity-60 transition-opacity flex items-center gap-2">
              Learn more
              <span className="material-symbols-outlined text-base">expand_more</span>
            </a>
          </div>
        </section>

        {/* How it Works / 3-Step Section - Clean Version */}
        <section id="how-it-works" className="py-12md:py-24 border-t border-slate-50">
          <div className="mb-20 text-center md:text-left">
            <p className="text-[11px] font-bold text-accent uppercase tracking-[0.2em] mb-4">The Workflow</p>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">How it works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col p-10 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm hover:shadow-soft transition-all group">
              <div className="text-4xl font-light text-slate-200 mb-6 transition-colors duration-500 tracking-tighter">01</div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Open QuickSync</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed font-medium mb-8">
                Load the app on any device. No accounts or downloads required—it's that simple.
              </p>
              <div className="mt-auto pt-8 border-t border-slate-50 flex items-center gap-1 opacity-60">
                <span className="material-symbols-outlined text-slate-700">laptop</span>
                <div className="w-8 h-[1px] bg-slate-700"></div>
                <span className="material-symbols-outlined text-slate-700">smartphone</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col p-10 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm hover:shadow-soft transition-all group">
              <div className="text-4xl font-light text-slate-200 mb-6 transition-colors duration-500 tracking-tighter">02</div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Pair Devices</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed font-medium mb-8">
                Scan the QR or enter your ID. A secure P2P bridge is established instantly.
              </p>
              <div className="mt-auto pt-8 border-t border-slate-50 flex items-center gap-3 opacity-60">
                <span className="material-symbols-outlined text-slate-700">qr_code</span>
                <div className="w-8 h-[1px] bg-slate-700"></div>
                <span className="material-symbols-outlined text-slate-700">verified_user</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col p-10 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm hover:shadow-soft transition-all group">
              <div className="text-4xl font-light text-slate-200 mb-6 transition-colors duration-500 tracking-tighter">03</div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Sync Instantly</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed font-medium mb-8">
                Copy here, paste there. Drop files to move them. Data never touches our servers.
              </p>
              <div className="mt-auto pt-8 border-t border-slate-50 flex items-center gap-3 opacity-60">
                <span className="material-symbols-outlined text-slate-700">sync_alt</span>
                <div className="w-8 h-[1px] bg-slate-700"></div>
                <span className="material-symbols-outlined text-slate-700">check_circle</span>
              </div>
            </div>
          </div>
        </section>

        {/* Security / Sharing section */}
        <section id="security" className="py-32 md:py-34 border-t border-slate-50">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">The smart way to share</h2>
            <p className="text-sm md:text-lg text-slate-500 max-w-xl mx-auto">Everything you need to seamlessly transition your workflow between devices, without the cloud getting in the middle.</p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Direct P2P Security */}
            <div className="col-span-1 md:col-span-2 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-soft transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">enhanced_encryption</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Direct P2P Security</h3>
              <p className="text-slate-500 leading-relaxed max-w-md">
                Your data never touches our servers. QuickSync establishes a direct, encrypted WebRTC tunnel between your devices.
              </p>
            </div>

            {/* Instant Clipboard */}
            <div className="col-span-1 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-soft transition-shadow">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">content_paste_go</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Instant Clipboard</h3>
              <p className="text-slate-500 leading-relaxed">
                Copy on your phone. Paste on your laptop. It's magic, but we call it technical necessity.
              </p>
            </div>

            {/* Zero Config */}
            <div className="col-span-1 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-soft transition-shadow flex flex-col">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Zero-Config Setup</h3>
              <p className="text-slate-500 leading-relaxed flex-grow">
                Open the app and your devices are permanently paired.
              </p>
            </div>

            {/* Multi-Platform */}
            <div className="col-span-1 md:col-span-2 bg-slate-900 rounded-3xl p-8 shadow-soft text-white overflow-hidden relative">
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-accent rounded-full blur-3xl opacity-30"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <span className="material-symbols-outlined">devices</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Works Everywhere</h3>
                <p className="text-slate-300 leading-relaxed max-w-md mb-6">
                  Windows, macOS, Linux, iOS, Android. The web client handles the rest. Break out of the walled gardens.
                </p>
                <div className="flex gap-2 flex-wrap">
                  {['macOS', 'Windows', 'Linux', 'iOS', 'Android'].map(os => (
                    <span key={os} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-slate-200">
                      {os}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="md:py-18">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Simple, transparent pricing</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Start syncing for free. Upgrade when you need cloud persistence and advanced routing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Basic</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-500 font-medium mb-1">/ forever</span>
              </div>
              <p className="text-slate-500 mb-8 leading-relaxed">Perfect for quick, direct transfers when both devices are in front of you.</p>

              <ul className="flex flex-col gap-4 mb-10 flex-grow">
                {['Direct P2P Sync (Must be online)', 'Transfer files up to 100MB', 'Standard WebRTC connection', 'Auto-expiring clipboard', 'Community support'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-500 text-xl shrink-0">check_circle</span>
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button onClick={() => navigate('/app')} className="w-full py-4 rounded-full font-semibold bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors">
                Start for Free
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-soft-lg flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</span>
              </div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent rounded-full blur-3xl opacity-20"></div>

              <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Pro</h3>
              <div className="flex items-end gap-1 mb-6 relative z-10">
                <span className="text-4xl font-bold text-white">$4.99</span>
                <span className="text-slate-400 font-medium mb-1">/ month</span>
              </div>
              <p className="text-slate-400 mb-8 leading-relaxed relative z-10">For professionals who need offline syncing and zero restrictions.</p>

              <ul className="flex flex-col gap-4 mb-10 flex-grow relative z-10">
                {['Asynchronous Transfer (Cloud Vault)', 'Unlimited File Sizes', 'Premium TURN Servers (100% Success)', 'Sync 3+ devices in a Room', 'Custom link quicksync.app/name'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-accent text-xl shrink-0">check_circle</span>
                    <span className="text-slate-200 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button onClick={handleProUpgrade} className="w-full py-4 rounded-full font-semibold bg-accent text-white hover:bg-blue-600 shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 transition-all relative z-10">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </section>

        {/* Big CTA Section - Clean Professional Version */}
        <section className="border-t border-slate-200 py-10 sm:py-24 mt-10">
          <div className="bg-slate-900 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-24 text-center shadow-2xl relative overflow-hidden mx-1 sm:mx-0">
            {/* Subtle Accent Glow */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6 sm:mb-8 tracking-tight leading-[1.1]">
                Stop emailing files <br className="hidden md:block" /> to yourself.
              </h2>
              <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto mb-12 font-medium leading-relaxed">
                Join thousands of users who have streamlined their multi-device workflow with QuickSync.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/app')}
                  className="w-full md:w-auto bg-white text-slate-900 px-10 py-4 rounded-full text-base font-bold shadow-xl hover:bg-slate-50 hover:-translate-y-1 transition-all active:scale-95"
                >
                  Start Syncing Now
                </button>
                <a
                  href="https://instagram.com/dwykee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto text-white px-8 py-4 rounded-full text-base font-bold hover:bg-white/5 transition-all text-center"
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 sm:py-12 px-6 md:px-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-row flex-wrap justify-between items-center gap-y-8 gap-x-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[14px]">sync</span>
            </div>
            <span className="font-bold tracking-tight text-slate-900">QuickSync</span>
          </div>

          <div className="flex gap-4 sm:gap-6 text-sm text-slate-500 font-medium">
            <a className="hover:text-slate-900 transition-colors" href="#">Privacy</a>
            <a className="hover:text-slate-900 transition-colors" href="#">Terms</a>
            <a className="hover:text-slate-900 transition-colors" href="https://github.com/dwykee">Github</a>
          </div>

          <div className="text-[10px] sm:text-sm text-slate-400 w-full sm:w-auto text-center sm:text-right">
            © 2026 QuickSync P2P. Secure by default.
          </div>
        </div>
      </footer>
    </div>
  );
};
