function Contact() {
  const contactInfo = {
    name: 'Hamza Iftikhar',
    role: 'Lead AI Engineer & Fullstack Developer',
    email: 'hamzaiftikhar@gmail.com',
    github: 'https://github.com/Hamzaiftikhar01',
    linkedin: 'https://linkedin.com/in/hamza-iftikhar',
    portfolio: 'https://github.com/Hamzaiftikhar01/Crop-Medic-Ai',
    description: 'Specializing in computer vision integrations, robust offline architectures, and modular targeted crawlers for agricultural technologies.'
  };

  return (
    <section id="contact" className="bg-earth-50/50 py-16 sm:py-24 text-left transition-colors duration-200 dark:bg-earth-900/50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-crop-50 px-3 py-1 text-xs font-semibold text-crop-800 ring-1 ring-crop-100 dark:bg-crop-950/30 dark:text-crop-300 dark:ring-crop-900/30">
            <Mail size={18} className="inline mr-2" aria-hidden="true" /> Contact Developer
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl dark:text-earth-50">
            Get In Touch
          </h2>
          <p className="mt-4 text-earth-500 max-w-xl mx-auto dark:text-earth-400">
            Have questions, feedback, or interest in expanding the crop knowledge base scrapers? Reach out using the channels below.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          {/* Main Card */}
          <div className="rounded-2xl border border-earth-100 bg-white p-8 shadow-soft transition-all hover:shadow-card dark:border-earth-800 dark:bg-earth-850">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-earth-100 dark:border-earth-800">
              <div>
                <h3 className="text-xl font-bold text-earth-900 dark:text-earth-100">
                  {contactInfo.name}
                </h3>
                <p className="text-sm text-crop-600 font-semibold mt-0.5">
                  {contactInfo.role}
                </p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-crop-50 text-2xl text-crop-700 dark:bg-crop-950/30 dark:text-crop-350">
                <Code2 size={24} className="text-brand-primary" aria-hidden="true" />
              </span>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-earth-650 dark:text-earth-350">
              {contactInfo.description}
            </p>

            <div className="mt-8 space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-earth-50 dark:bg-earth-900/50 hover:bg-earth-100/50 dark:hover:bg-earth-900 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail size={16} aria-label="Email" className="text-neutral-high" />
                  <span className="text-sm font-semibold text-earth-700 dark:text-earth-300">Email Address</span>
                </div>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-sm font-bold text-crop-600 hover:text-crop-700 dark:text-crop-400 dark:hover:text-crop-300"
                >
                  {contactInfo.email}
                </a>
              </div>

              {/* GitHub */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-earth-50 dark:bg-earth-900/50 hover:bg-earth-100/50 dark:hover:bg-earth-900 transition-colors">
                <div className="flex items-center gap-3">
                  <Github size={16} aria-label="Github" className="text-neutral-high" />
                  <span className="text-sm font-semibold text-earth-700 dark:text-earth-300">GitHub Profile</span>
                </div>
                <a
                  href={contactInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-crop-600 hover:text-crop-700 dark:text-crop-400 dark:hover:text-crop-300 flex items-center gap-1"
                >
                  github.com/Hamzaiftikhar01
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* LinkedIn */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-earth-50 dark:bg-earth-900/50 hover:bg-earth-100/50 dark:hover:bg-earth-900 transition-colors">
                <div className="flex items-center gap-3">
                  <Linkedin size={16} aria-label="LinkedIn" className="text-neutral-high" />
                  <span className="text-sm font-semibold text-earth-700 dark:text-earth-300">LinkedIn Connect</span>
                </div>
                <a
                  href={contactInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-crop-600 hover:text-crop-700 dark:text-crop-400 dark:hover:text-crop-300 flex items-center gap-1"
                >
                  linkedin.com/in/hamza-iftikhar
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
import { Mail, Code2, Github, Linkedin } from 'lucide-react';

function Contact() {
  const contactInfo = {
    name: 'Hamza Iftikhar',
    role: 'Lead AI Engineer & Fullstack Developer',
    email: 'hamzaiftikhar@gmail.com',
    github: 'https://github.com/Hamzaiftikhar01',
    linkedin: 'https://linkedin.com/in/hamza-iftikhar',
    portfolio: 'https://github.com/Hamzaiftikhar01/Crop-Medic-Ai',
    description: 'Specializing in computer vision integrations, robust offline architectures, and modular targeted crawlers for agricultural technologies.'
  };

  return (
    <section id="contact" className="bg-earth-50/50 py-16 sm:py-24 text-left transition-colors duration-200 dark:bg-earth-900/50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-crop-50 px-3 py-1 text-xs font-semibold text-crop-800 ring-1 ring-crop-100 dark:bg-crop-950/30 dark:text-crop-300 dark:ring-crop-900/30">
            <Mail size={18} className="inline mr-2" aria-hidden="true" /> Contact Developer
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl dark:text-earth-50">
            Get In Touch
          </h2>
          <p className="mt-4 text-earth-500 max-w-xl mx-auto dark:text-earth-400">
            Have questions, feedback, or interest in expanding the crop knowledge base scrapers? Reach out using the channels below.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          {/* Main Card */}
          <div className="rounded-2xl border border-earth-100 bg-white p-8 shadow-soft transition-all hover:shadow-card dark:border-earth-800 dark:bg-earth-850">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-earth-100 dark:border-earth-800">
              <div>
                <h3 className="text-xl font-bold text-earth-900 dark:text-earth-100">
                  {contactInfo.name}
                </h3>
                <p className="text-sm text-crop-600 font-semibold mt-0.5">
                  {contactInfo.role}
                </p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-crop-50 text-2xl text-crop-700 dark:bg-crop-950/30 dark:text-crop-350">
                <Code2 size={24} className="text-brand-primary" aria-hidden="true" />
              </span>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-earth-650 dark:text-earth-350">
              {contactInfo.description}
            </p>

            <div className="mt-8 space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-earth-50 dark:bg-earth-900/50 hover:bg-earth-100/50 dark:hover:bg-earth-900 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail size={16} aria-label="Email" className="text-neutral-high" />
                  <span className="text-sm font-semibold text-earth-700 dark:text-earth-300">Email Address</span>
                </div>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-sm font-bold text-crop-600 hover:text-crop-700 dark:text-crop-400 dark:hover:text-crop-300"
                >
                  {contactInfo.email}
                </a>
              </div>

              {/* GitHub */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-earth-50 dark:bg-earth-900/50 hover:bg-earth-100/50 dark:hover:bg-earth-900 transition-colors">
                <div className="flex items-center gap-3">
                  <Github size={16} aria-label="Github" className="text-neutral-high" />
                  <span className="text-sm font-semibold text-earth-700 dark:text-earth-300">GitHub Profile</span>
                </div>
                <a
                  href={contactInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-crop-600 hover:text-crop-700 dark:text-crop-400 dark:hover:text-crop-300 flex items-center gap-1"
                >
                  github.com/Hamzaiftikhar01
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* LinkedIn */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-earth-50 dark:bg-earth-900/50 hover:bg-earth-100/50 dark:hover:bg-earth-900 transition-colors">
                <div className="flex items-center gap-3">
                  <Linkedin size={16} aria-label="LinkedIn" className="text-neutral-high" />
                  <span className="text-sm font-semibold text-earth-700 dark:text-earth-300">LinkedIn Connect</span>
                </div>
                <a
                  href={contactInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-crop-600 hover:text-crop-700 dark:text-crop-400 dark:hover:text-crop-300 flex items-center gap-1"
                >
                  linkedin.com/in/hamza-iftikhar
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default Contact;
