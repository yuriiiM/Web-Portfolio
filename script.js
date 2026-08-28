// ============================================================
// Portfolio site behaviour — everything runs in the browser.
// Images and captions are saved in localStorage, so they're
// still there after a refresh (on the same browser/device).
// No server or Node.js required — just open the HTML files.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initProfilePhoto();
  initLightbox();
  initGallery();
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

/* ---------- profile photo (homepage) ---------- */
function initProfilePhoto(){
  const portrait = document.querySelector('[data-role="portrait"]');
  if(!portrait) return;

  const input = portrait.querySelector('input[type="file"]');
  const img = portrait.querySelector('img');
  const placeholder = portrait.querySelector('.placeholder');
  const removeBtn = document.querySelector('[data-role="remove-photo"]');

  const saved = localStorage.getItem('profilePhoto');
  if(saved) showPhoto(saved);

  portrait.addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try{
        localStorage.setItem('profilePhoto', e.target.result);
      }catch(err){
        alert("That photo couldn't be saved — your browser's storage is full. Try a smaller image.");
        return;
      }
      showPhoto(e.target.result);
    };
    reader.readAsDataURL(file);
  });

  if(removeBtn){
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      localStorage.removeItem('profilePhoto');
      img.src = '';
      img.style.display = 'none';
      placeholder.style.display = 'flex';
      input.value = '';
    });
  }

  function showPhoto(src){
    img.src = src;
    img.style.display = 'block';
    placeholder.style.display = 'none';
  }
}

/* ---------- lightbox: click a thumbnail to enlarge it ---------- */
let openLightbox = () => {}; // replaced by initLightbox() below

function initLightbox(){
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

  function close(){
    overlay.classList.remove('open');
    document.body.classList.remove('lightbox-locked');
  }

  overlay.addEventListener('click', (e) => {
    if(e.target === overlay) close(); // click outside the image
  });
  overlay.querySelector('.lightbox-close').addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') close();
  });

  openLightbox = (item) => {
    img.src = item.src;
    img.alt = item.title || 'Uploaded work, enlarged';

    const hasCaption = !!(item.title || item.description);
    titleEl.textContent = item.title || '';
    titleEl.style.display = item.title ? 'block' : 'none';
    descEl.textContent = item.description || '';
    descEl.style.display = item.description ? 'block' : 'none';
    overlay.querySelector('.lightbox-caption').style.display = hasCaption ? 'block' : 'none';

    overlay.classList.add('open');
    document.body.classList.add('lightbox-locked');
  };
}

/* ---------- work galleries (quiz / assignment / exam pages) ---------- */
function initGallery(){
  const section = document.querySelector('[data-gallery]');
  if(!section) return;

  const key = 'gallery_' + section.dataset.gallery;
  const dropzone = section.querySelector('.dropzone');
  const input = section.querySelector('input[type="file"]');
  const grid = section.querySelector('.gallery');
  const countEl = section.querySelector('.count');

  let items = loadItems();
  render();

  dropzone.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    addFiles(input.files);
    input.value = '';
  });

  ['dragenter','dragover'].forEach(evt =>
    dropzone.addEventListener(evt, e => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    })
  );
  ['dragleave','drop'].forEach(evt =>
    dropzone.addEventListener(evt, e => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
    })
  );
  dropzone.addEventListener('drop', e => {
    if(e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  });

  function addFiles(fileList){
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    let remaining = files.length;
    if(!remaining) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        items.push({
          id: Date.now() + Math.random().toString(16).slice(2),
          src: e.target.result,
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: ''
        });
        remaining -= 1;
        if(remaining === 0){
          saveItems();
          render();
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function removeItem(id){
    items = items.filter(it => it.id !== id);
    saveItems();
    render();
  }

  function updateItem(id, fields){
    const it = items.find(i => i.id === id);
    if(it) { Object.assign(it, fields); saveItems(); }
  }

  function loadItems(){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }

  function saveItems(){
    try{
      localStorage.setItem(key, JSON.stringify(items));
    }catch(e){
      alert("Your images couldn't be saved — the browser's storage is full. Try removing an older upload first.");
    }
  }

  function render(){
    countEl.textContent = items.length
      ? `${items.length} upload${items.length > 1 ? 's' : ''}`
      : 'no uploads yet';

    if(!items.length){
      grid.innerHTML = `<div class="gallery-empty">Nothing here yet — upload your first piece of work above.</div>`;
      return;
    }

    grid.innerHTML = '';
    items.forEach((it, i) => {
      const tilt = (i % 2 === 0 ? -1 : 1) * (2 + (i % 3));
      const card = document.createElement('div');
      card.className = 'card';
      card.style.setProperty('--tilt', tilt + 'deg');
      card.innerHTML = `
        <span class="pin"></span>
        <div class="thumb" role="button" tabindex="0" aria-label="View larger image">
          <img src="${it.src}" alt="${escapeHtml(it.title)}">
          <span class="thumb-zoom">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>
          </span>
        </div>
        <div class="cap">
          <input type="text" class="title-input" value="${escapeHtml(it.title)}" placeholder="add a title…" aria-label="Title">
          <button class="remove" title="Remove" aria-label="Remove image">&times;</button>
        </div>
        <textarea class="desc-input" placeholder="add a description…" aria-label="Description">${escapeHtml(it.description)}</textarea>
      `;

      const openThisLightbox = () => openLightbox(it);
      const thumb = card.querySelector('.thumb');
      thumb.addEventListener('click', openThisLightbox);
      thumb.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openThisLightbox(); }
      });

      card.querySelector('.title-input').addEventListener('change', (e) => updateItem(it.id, { title: e.target.value }));
      card.querySelector('.desc-input').addEventListener('change', (e) => updateItem(it.id, { description: e.target.value }));
      card.querySelector('.remove').addEventListener('click', () => removeItem(it.id));
      grid.appendChild(card);
    });
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
}
