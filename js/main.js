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

  /* ==========================================================================
     PROPOSAL MODE — this deployment is a concept pitch, not Inplant's live
     site yet. Nothing here should message a real (fabricated) WhatsApp
     number or send a real email. Every "send" action just shows a notice
     instead. Flip this off (and restore the real logic below) once Inplant
     approves and provides their real WhatsApp number.
     ========================================================================== */
  const PROPOSAL_NOTICE = 'Esta función se activará en la versión publicada.';
  const PLACEHOLDER_DATA_NOTICE = 'Dato de ejemplo — se reemplazará por la información real de Inplant.';

  let noticeTimer = null;
  const showProposalNotice = (message = PROPOSAL_NOTICE) => {
    let toast = document.getElementById('proposalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'proposalToast';
      toast.className = 'proposal-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  };

  // Every WhatsApp deep-link on the page uses the same provisional/example
  // number — none of them should actually open WhatsApp in this proposal.
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showProposalNotice();
    });
  });

  // The phone number and email shown around the site are placeholder /
  // example data too — don't actually dial or open a mail client with them.
  document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showProposalNotice(PLACEHOLDER_DATA_NOTICE);
    });
  });

  // Contact form — the form sits right above the footer, so the fixed
  // bottom toast would cover the footer logo when triggered from here.
  // Show the notice inline (button text swap) instead, same as the old
  // "Abriendo WhatsApp…" pattern, so it never overlaps anything below it.
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button');
      const status = document.getElementById('contactFormStatus');
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = PROPOSAL_NOTICE;
      if (status) status.textContent = PROPOSAL_NOTICE;
      setTimeout(() => {
        btn.innerHTML = original;
        btn.disabled = false;
      }, 3200);
    });
  }

  // Placeholder links (social icons, legal pages) — keep the click from
  // jumping to the top of the page via the empty "#" fragment.
  document.querySelectorAll('a[href="#"]').forEach((link) => {
    link.addEventListener('click', (e) => e.preventDefault());
  });

});
