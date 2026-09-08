document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initLightbox();
});

/* ---------- mobile nav ---------- */
function initNavToggle(){
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
}

/* ---------- lightbox: click any .thumb to enlarge its image ---------- */
function initLightbox(){
  const thumbs = document.querySelectorAll('.thumb');
  if(!thumbs.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = `
    <div class="lightbox-inner">
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <img class="lightbox-img" alt="">
      <div class="lightbox-caption">
        <h3 class="lightbox-title"></h3>
        <p class="lightbox-desc"></p>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const img = overlay.querySelector('.lightbox-img');
  const titleEl = overlay.querySelector('.lightbox-title');
  const descEl = overlay.querySelector('.lightbox-desc');
  const captionBox = overlay.querySelector('.lightbox-caption');

  function close(){
    overlay.classList.remove('open');
    document.body.classList.remove('lightbox-locked');
  }

  function open(thumb){
    const src = thumb.querySelector('img').src;
    const title = thumb.dataset.title || '';
    const desc = thumb.dataset.desc || '';

    img.src = src;
    img.alt = title || 'Enlarged photo';

    titleEl.textContent = title;
    titleEl.style.display = title ? 'block' : 'none';
    descEl.textContent = desc;
    descEl.style.display = desc ? 'block' : 'none';
    captionBox.style.display = (title || desc) ? 'block' : 'none';

    overlay.classList.add('open');
    document.body.classList.add('lightbox-locked');
  }

  thumbs.forEach(thumb => {
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('tabindex', '0');
    thumb.setAttribute('aria-label', 'View larger image');
    thumb.addEventListener('click', () => open(thumb));
    thumb.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(thumb); }
    });
  });

  overlay.addEventListener('click', (e) => { if(e.target === overlay) close(); });
  overlay.querySelector('.lightbox-close').addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') close(); });
}
