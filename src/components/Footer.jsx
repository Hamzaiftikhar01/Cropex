function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-earth-200 bg-earth-900 text-earth-400">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-crop-600 text-base">
                🌱
              </span>
              <span className="text-lg font-bold text-white">
                Crop<span className="font-semibold text-crop-400">ex</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Your AI Companion for Smarter Farming. Predict Early. Protect Crops. Empower Farmers.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2.5">
              {['Home', 'Upload', 'Features', 'Results'].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">Resources</h4>
            <ul className="mt-4 space-y-2.5">
              {['Documentation', 'Crop Database', 'API Access', 'Support'].map((item) => (
                <li key={item}>
                  <span className="cursor-default text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">Creator & Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="text-earth-200 font-medium">Hamza Iftikhar</li>
              <li>
                <a href="mailto:hamzaiftikhar@gmail.com" className="transition-colors hover:text-white underline decoration-crop-500/50 hover:decoration-white">
                  hamzaiftikhar@gmail.com
                </a>
              </li>
              <li>support@cropex.ai</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-earth-800 pt-8 sm:flex-row">
          <p className="text-sm text-earth-500">
            &copy; {currentYear} Cropex. Created by Hamza Iftikhar. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-earth-500">
            <span className="cursor-default">Privacy Policy</span>
            <span className="cursor-default">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
