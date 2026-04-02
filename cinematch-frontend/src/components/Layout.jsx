import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background text-on-surface font-manrope antialiased selection:bg-primary/30 selection:text-primary-fixed">
      {/* We use main container as the central stage for the cinematic layout */}
      <main className="mx-auto w-full max-w-[1440px] px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}
