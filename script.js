// ============================================================
// Portfolio site behaviour — nav toggle, photo uploader, galleries
// All data is saved in the browser's localStorage, so it stays
// put after a refresh, but only on the device/browser you used.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    initEditableHints();
    initProfilePhoto();
    initGallery();
});

/* ---------- mobile nav ---------- */
function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => links.classList.remove('open'))
    );
}

/* ---------- let clicking editable text show a tiny hint once ---------- */
function initEditableHints() {
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.addEventListener('focus', () => {
            if (!localStorage.getItem('seenEditHint')) {
                localStorage.setItem('seenEditHint', '1');
            }
        });
    });
}

/* ---------- profile photo (homepage) ---------- */
function initProfilePhoto() {
    const portrait = document.querySelector('[data-role="portrait"]');
    if (!portrait) return;

    const input = portrait.querySelector('input[type="file"]');
    const img = portrait.querySelector('img');
    const placeholder = portrait.querySelector('.placeholder');
    const removeBtn = document.querySelector('[data-role="remove-photo"]');

    const saved = localStorage.getItem('profilePhoto');
    if (saved) showPhoto(saved);

    portrait.addEventListener('click', () => input.click());

    input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            localStorage.setItem('profilePhoto', e.target.result);
            showPhoto(e.target.result);
        };
        reader.readAsDataURL(file);
    });

    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            localStorage.removeItem('profilePhoto');
            img.src = '';
            img.style.display = 'none';
            placeholder.style.display = 'flex';
            input.value = '';
        });
    }

    function showPhoto(src) {
        img.src = src;
        img.style.display = 'block';
        placeholder.style.display = 'none';
    }
}

/* ---------- work galleries (quiz / assignment / exam pages) ---------- */
function initGallery() {
    const section = document.querySelector('[data-gallery]');
    if (!section) return;

    const key = 'gallery_' + section.dataset.gallery;
    const dropzone = section.querySelector('.dropzone');
    const input = section.querySelector('input[type="file"]');
    const grid = section.querySelector('.gallery');
    const countEl = section.querySelector('.count');

    let items = loadItems();
    render();

    // click / browse
    dropzone.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
        addFiles(input.files);
        input.value = '';
    });

    // drag & drop
    ['dragenter', 'dragover'].forEach(evt =>
        dropzone.addEventListener(evt, e => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        })
    );
    ['dragleave', 'drop'].forEach(evt =>
        dropzone.addEventListener(evt, e => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
        })
    );
    dropzone.addEventListener('drop', e => {
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    });

    function addFiles(fileList) {
        const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
        let remaining = files.length;
        if (!remaining) return;
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = e => {
                items.push({
                    id: Date.now() + Math.random().toString(16).slice(2),
                    src: e.target.result,
                    name: file.name.replace(/\.[^/.]+$/, '')
                });
                remaining -= 1;
                if (remaining === 0) {
                    saveItems();
                    render();
                }
            };
            reader.readAsDataURL(file);
        });
    }

    function removeItem(id) {
        items = items.filter(it => it.id !== id);
        saveItems();
        render();
    }

    function renameItem(id, newName) {
        const it = items.find(i => i.id === id);
        if (it) { it.name = newName; saveItems(); }
    }

    function loadItems() {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function saveItems() {
        try {
            localStorage.setItem(key, JSON.stringify(items));
        } catch (e) {
            alert("Your images couldn't be saved — the browser's storage is full. Try removing an older upload first.");
        }
    }

    function render() {
        countEl.textContent = items.length
            ? `${items.length} upload${items.length > 1 ? 's' : ''}`
            : 'no uploads yet';

        if (!items.length) {
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
        <div class="thumb"><img src="${it.src}" alt="${escapeHtml(it.name)}"></div>
        <div class="cap">
          <input type="text" value="${escapeHtml(it.name)}" aria-label="Caption">
          <button class="remove" title="Remove" aria-label="Remove image">&times;</button>
        </div>
      `;
            card.querySelector('input').addEventListener('change', (e) => renameItem(it.id, e.target.value));
            card.querySelector('.remove').addEventListener('click', () => removeItem(it.id));
            grid.appendChild(card);
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}