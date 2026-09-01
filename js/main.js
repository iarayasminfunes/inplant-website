document.addEventListener('DOMContentLoaded', () => {

  /* Header scroll state */
  const header = document.getElementById('header');
  const scrollTopBtn = document.getElementById('scrollTop');

  const onScroll = () => {
    const scrolled = window.scrollY > 12;
    header.classList.toggle('is-scrolled', scrolled);
    scrollTopBtn.classList.toggle('is-visible', window.scrollY > 480);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* Mobile nav — scrim behind it, Escape to close, background scroll
     locked while it's open. */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const navScrim = document.getElementById('navScrim');

  const closeNav = () => {
    const wasOpen = nav.classList.contains('is-open');
    burger.classList.remove('is-open');
    nav.classList.remove('is-open');
    navScrim.classList.remove('is-visible');
    document.body.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
    if (wasOpen) burger.focus(); // return focus to the trigger
  };

  const openNav = () => {
    nav.classList.add('is-open');
    burger.classList.add('is-open');
    navScrim.classList.add('is-visible');
    document.body.classList.add('nav-open');
    burger.setAttribute('aria-expanded', 'true');
    nav.querySelector('a')?.focus(); // move focus into the panel
  };

  burger.addEventListener('click', () => {
    if (nav.classList.contains('is-open')) closeNav(); else openNav();
  });

  navScrim.addEventListener('click', closeNav);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));

  /* Active nav link on scroll */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => spy.observe(section));

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* Featured plants carousel — on mobile .plant-grid becomes a real
     horizontal scroller (see the max-width:768px CSS), so the arrows
     scroll it by one card. On tablet/desktop the grid is static (every
     card already visible) and the controls stay hidden, so this is a
     no-op there. */
  const grid = document.getElementById('plantGrid');
  const prevBtn = document.getElementById('prevPlant');
  const nextBtn = document.getElementById('nextPlant');

  if (grid && prevBtn && nextBtn) {
    const scrollByCard = (direction) => {
      const card = grid.querySelector('.plant-card');
      if (!card) return;
      const gap = parseFloat(getComputedStyle(grid).columnGap || getComputedStyle(grid).gap || 0);
      grid.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: 'smooth' });
    };
    nextBtn.addEventListener('click', () => scrollByCard(1));
    prevBtn.addEventListener('click', () => scrollByCard(-1));
  }

  /* Contact form — opens WhatsApp with the message pre-filled (immediate,
     no backend needed) AND, in parallel, POSTs the same lead to /api/contact
     so it lands as an email to Inplant even if the visitor never finishes
     the WhatsApp step. The WhatsApp number below is a PROVISIONAL / example
     number — swap it for Inplant's real one. */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const number = contactForm.dataset.whatsappNumber;
      const name = contactForm.querySelector('#contactName').value.trim();
      const phone = contactForm.querySelector('#contactPhone').value.trim();
      const query = contactForm.querySelector('#contactQuery').value.trim();

      const message =
        `Hola Inplant! Soy ${name}.\n` +
        `Mi teléfono: ${phone}\n` +
        `Consulta: ${query}`;
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');

      // Fire-and-forget — WhatsApp already opened above regardless of
      // whether this succeeds, so a failed/slow backend never blocks the
      // visitor. Errors are only logged, not shown, to keep this silent.
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, query }),
      }).catch((err) => console.error('Contact backend unreachable:', err));

      const btn = contactForm.querySelector('button');
      const status = document.getElementById('contactFormStatus');
      const original = btn.innerHTML;
      btn.classList.add('is-loading');
      btn.disabled = true;
      btn.innerHTML = 'Abriendo WhatsApp…';
      if (status) status.textContent = 'Abriendo WhatsApp en una pestaña nueva…';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.remove('is-loading');
        btn.disabled = false;
        if (status) status.textContent = 'Listo. Continuá la consulta en WhatsApp.';
      }, 2500);
    });
  }

});
