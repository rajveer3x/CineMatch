import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row antialiased font-manrope selection:bg-primary/30 selection:text-primary-fixed text-on-surface">
      
      {/* Left side: Cinematic Hero Immersive Background */}
      <div className="relative w-full lg:w-[55%] flex-shrink-0 min-h-[40vh] lg:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image / Overlay */}
        <div className="absolute inset-0 bg-surface-container-lowest">
          {/* A cinematic placeholder gradient or image for the film vibe */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.35] mix-blend-luminosity"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2625&auto=format&fit=crop')` 
            }}
          ></div>
          {/* Deep shadow gradient blending into the right panel */}
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-background via-background/80 to-transparent"></div>
        </div>
        
        {/* Cinematic Branding */}
        <div className="relative z-10 w-full max-w-lg px-8 text-center lg:text-left mt-10 lg:mt-0">
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary-gradient flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.35)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-primary">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 3v18M17 3v18M3 9h18M3 15h18" />
              </svg>
            </div>
            <h1 className="font-newsreader text-5xl lg:text-7xl font-bold tracking-tight text-on-surface">
              CineMatch
            </h1>
          </div>
          <p className="text-xl lg:text-2xl font-light text-on-surface-variant max-w-sm mx-auto lg:mx-0">
            Your personal AI movie guide.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="relative flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-background z-10">
        
        {/* Soft immersive glow for the form panel */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md mx-auto relative z-10">
          <h2 className="font-newsreader text-4xl font-bold mb-3">Welcome Back</h2>
          <p className="text-on-surface-variant mb-10 text-base">Enter your credentials to access your library.</p>
          
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant block tracking-wide">EMAIL ADDRESS</label>
              <input 
                type="email" 
                placeholder="aria@example.com"
                className="w-full h-14 bg-surface-container-low border border-outline-variant/[0.15] rounded-xl px-5 text-on-surface placeholder:text-outline-variant/60 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60 transition-all font-manrope"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-on-surface-variant block tracking-wide">PASSWORD</label>
                <a href="#" className="text-sm font-semibold text-primary hover:text-primary-fixed transition-colors">Forgot?</a>
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full h-14 bg-surface-container-low border border-outline-variant/[0.15] rounded-xl px-5 text-on-surface placeholder:text-outline-variant/60 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60 transition-all font-manrope"
              />
            </div>

            <button className="w-full h-14 bg-primary-gradient rounded-xl text-on-primary font-bold text-[1rem] shadow-[0_6_20px_rgba(245,158,11,0.25)] hover:shadow-[0_8_28px_rgba(245,158,11,0.4)] hover:-translate-y-[1px] transition-all flex items-center justify-center gap-2 mt-8">
              Sign In
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </form>

          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/[0.15]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-on-surface-variant font-medium">Or continue with</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button className="h-12 flex items-center justify-center rounded-xl border border-outline-variant/[0.2] bg-surface-container-low hover:bg-surface-container-highest focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors group">
              <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Google</span>
            </button>
            <button className="h-12 flex items-center justify-center rounded-xl border border-outline-variant/[0.2] bg-surface-container-low hover:bg-surface-container-highest focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors group">
               <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Apple</span>
            </button>
          </div>

          <div className="mt-12 text-center text-sm text-on-surface-variant">
            New to CineMatch?{' '}
            <NavLink to="/register" className="font-semibold text-primary hover:text-primary-fixed transition-colors">
              Register here
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
