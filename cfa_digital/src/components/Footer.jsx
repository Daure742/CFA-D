import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/cfadigital',
    bg: 'bg-blue-600',
    icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z'
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/cfadigital',
    bg: 'bg-pink-500',
    icon: 'M7.75 2A5.75 5.75 0 002 7.75v8.5A5.75 5.75 0 007.75 22h8.5A5.75 5.75 0 0022 16.25v-8.5A5.75 5.75 0 0016.25 2h-8.5zM12 7.25a4.75 4.75 0 110 9.5 4.75 4.75 0 010-9.5zm5.5-.5a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z'
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/cfadigital',
    bg: 'bg-sky-700',
    icon: 'M4 3.5A1.5 1.5 0 105 5a1.5 1.5 0 00-1-1.5zm.5 4.5H2V21h2.5V8zm5 0H7.5V21H10V13.5c0-1.757 2-1.898 2 0V21h2.5V13.25c0-4.269-5-4.107-5 0V8z'
  },
  {
    label: 'X',
    href: 'https://x.com/cfadigital',
    bg: 'bg-slate-800',
    icon: 'M23 3.5L18.5 9 23 14.5 18.5 20 13 14.5 8.5 20 4 14.5 8.5 9 4 3.5 8.5 0 13 5.5 17.5 0 22 5.5z'
  }
];

export default function Footer() {
  const containerRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="bg-slate-50 text-slate-900 border-t border-slate-200">
      <div
        ref={containerRef}
        className={`container mx-auto px-6 py-12 transition duration-700 ease-out ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div className="grid gap-10 xl:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-8 sm:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                Contactez-nous
              </span>
              <h2 className="mt-4 text-2xl font-semibold text-slate-950">Notre équipe est à votre écoute</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Notre équipe est disponible pour toute question liée aux formations, à l'inscription ou à votre espace CFA DIGITAL.
              </p>
              <div className="mt-6 space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="mt-1 text-lg">📍</span>
                  <div>
                    <p className="font-semibold text-slate-900">Adresse</p>
                    <p>25 avenue de l'Innovation, 75000 Paris, France</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 text-lg">☎</span>
                  <div>
                    <p className="font-semibold text-slate-900">Téléphone</p>
                    <a href="tel:+33789384734" className="text-indigo-700 hover:text-indigo-900 transition">+33 7 89 38 47 34</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 text-lg">✉</span>
                  <div>
                    <p className="font-semibold text-slate-900">E-mail</p>
                    <a href="mailto:contact@cfadigital.com" className="text-indigo-700 hover:text-indigo-900 transition">contact@cfadigital.com</a>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-slate-950 p-8 shadow-sm text-white">
              <h3 className="text-xl font-semibold">Horaires d'ouverture</h3>
              <div className="mt-6 space-y-4 text-sm leading-7 text-slate-200">
                <div className="rounded-2xl bg-slate-900/90 p-4">
                  <p className="font-semibold">Lundi – Vendredi</p>
                  <p>08h00 – 17h00</p>
                </div>
                <div className="rounded-2xl bg-slate-900/90 p-4">
                  <p className="font-semibold">Samedi</p>
                  <p>08h00 – 12h00</p>
                </div>
                <div className="rounded-2xl bg-slate-900/90 p-4">
                  <p className="font-semibold">Dimanche</p>
                  <p>Fermé</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-slate-900 p-8 shadow-lg text-white flex flex-col justify-between transition hover:-translate-y-1 hover:shadow-xl">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-indigo-200">Besoin d'informations ?</p>
              <h3 className="mt-4 text-3xl font-semibold leading-tight">Une question concernant CFA DIGITAL ?</h3>
              <p className="mt-4 text-sm leading-7 text-slate-200/90">
                Une question concernant les formations, les inscriptions ou l'utilisation de CFA DIGITAL ? Écrivez-nous, nous vous répondrons dans les meilleurs délais.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-900/10 transition duration-300 hover:bg-slate-100"
              >
                Nous contacter
              </Link>
              <div className="grid grid-cols-4 gap-3 pt-4">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className={`group inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.bg} text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current transition duration-300 group-hover:scale-110">
                      <path d={item.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-4">
              <a href="/terms" className="hover:text-slate-900 transition">Conditions générales d'utilisation</a>
              <a href="/privacy" className="hover:text-slate-900 transition">Politique de confidentialité</a>
              <a href="/#faq" className="hover:text-slate-900 transition">FAQ</a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Langue</span>
              <button className="rounded-full border border-slate-300 bg-white px-3 py-1 text-slate-900 transition hover:border-slate-400">FR</button>
              <button className="rounded-full border border-slate-300 bg-white px-3 py-1 text-slate-900 transition hover:border-slate-400">EN</button>
            </div>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            © 2026 CFA DIGITAL — Plateforme conforme Qualiopi. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
