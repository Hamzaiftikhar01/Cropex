import { useState } from 'react';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Upload', href: '#upload' },
  { label: 'Features', href: '#features' },
  { label: 'Results', href: '#results' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-earth-100 bg-white/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-crop-600 text-base text-white shadow-sm shadow-crop-600/20">
            🌱
          </span>
          <span className="text-lg font-bold tracking-tight text-earth-900">
            CropCare <span className="font-semibold text-crop-600">AI</span>
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-earth-500 transition-colors hover:text-earth-900"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#upload"
          className="hidden rounded-xl bg-crop-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-crop-600/20 transition-all hover:bg-crop-700 hover:shadow-md md:inline-block"
        >
          Analyze Crop
        </a>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-earth-600 transition-colors hover:bg-earth-50 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-earth-100 bg-white px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-earth-600 transition-colors hover:bg-earth-50 hover:text-earth-900"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#upload"
            className="mt-3 block rounded-xl bg-crop-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm"
            onClick={() => setMenuOpen(false)}
          >
            Analyze Crop
          </a>
        </div>
      )}
    </header>
  );
}

export default Navbar;
