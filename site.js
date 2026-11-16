// Nav border on scroll, reveal-on-scroll, screenshot carousel arrows and a zoomable lightbox.
(() => {
  const nav = document.querySelector('.nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px' });
    els.forEach((el) => io.observe(el));
  } else els.forEach((el) => el.classList.add('in'));

  // Carousel arrows
  document.querySelectorAll('[data-carousel]').forEach((nav) => {
    const track = document.getElementById(nav.dataset.carousel);
    nav.querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => track.scrollBy({ left: Number(b.dataset.dir) * 320, behavior: 'smooth' })));
  });

  // Lightbox
  const items = [...document.querySelectorAll('[data-zoom]')];
  if (!items.length) return;
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = `
    <button class="lb-btn lb-close" aria-label="Close">✕</button>
    <button class="lb-btn lb-prev" aria-label="Previous">←</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button class="lb-btn lb-next" aria-label="Next">→</button>`;
  document.body.append(lb);
  const fig = lb.querySelector('figure');
  const img = lb.querySelector('img');
  const cap = lb.querySelector('figcaption');
  let i = 0, last = null;

  const show = (n) => {
    i = (n + items.length) % items.length;
    fig.classList.remove('zoomed');
    img.src = items[i].dataset.zoom;
    img.alt = items[i].querySelector('img')?.alt || '';
    cap.textContent = items[i].dataset.caption || '';
  };
  const open = (n) => { last = document.activeElement; show(n); lb.classList.add('open'); document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); };
  const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; last && last.focus(); };

  items.forEach((el, n) => el.addEventListener('click', () => open(n)));
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => show(i - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(i + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  img.addEventListener('click', (e) => {
    const r = img.getBoundingClientRect();
    fig.style.setProperty('--ox', `${((e.clientX - r.left) / r.width) * 100}%`);
    fig.style.setProperty('--oy', `${((e.clientY - r.top) / r.height) * 100}%`);
    fig.classList.toggle('zoomed');
  });
  addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
  let x0 = null;
  lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (x0 === null || fig.classList.contains('zoomed')) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
