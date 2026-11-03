// ===== Открытие/закрытие меню =====
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

function toggleMenu() {
  menuBtn.classList.toggle('open');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
}
menuBtn.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

// ===== Переключение страниц =====
const navBtns = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.page;
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + target).classList.add('active');

    menuBtn.classList.remove('open');
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// ===== Редактируемый текст =====
document.querySelectorAll('.editable').forEach(el => {
  el.setAttribute('contenteditable', 'true');
});

// ===== РЕСАЙЗ ФОТО ЗА КРУЖОК =====
document.querySelectorAll('.photo-card').forEach(card => {
  const wrap   = card.querySelector('.photo-wrap');
  const img    = card.querySelector('.photo');
  const handle = card.querySelector('.resize-handle');
  if (!wrap || !img || !handle) return;

  const photoId = card.dataset.photo || img.alt;
  const sizeKey = 'size_' + photoId;

  // стартовый размер
  let currentWidth = parseInt(localStorage.getItem(sizeKey)) || img.naturalWidth || 240;
  if (localStorage.getItem(sizeKey)) {
    img.style.width = currentWidth + 'px';
    img.style.height = 'auto';
  }

  let startX, startY, startW, ratio;

  function onPointerDown(e) {
    e.preventDefault();
    e.stopPropagation();

    // фиксируем стартовые значения
    ratio = img.naturalWidth && img.naturalHeight
      ? img.naturalWidth / img.naturalHeight
      : 1.25;

    startX = e.clientX;
    startY = e.clientY;
    startW = img.getBoundingClientRect().width;

    // фиксируем текущую ширину явно
    img.style.width = startW + 'px';
    img.style.height = 'auto';

    document.body.classList.add('resizing');

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // берём наибольшее смещение (диагональ)
    const delta = Math.max(dx, dy);
    let newW = startW + delta;

    // ограничения
    newW = Math.max(100, Math.min(900, newW));

    img.style.width = newW + 'px';
    img.style.height = 'auto';
  }

  function onPointerUp() {
    document.body.classList.remove('resizing');
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);

    // сохраняем итоговый размер
    const finalW = parseInt(img.style.width);
    if (finalW) localStorage.setItem(sizeKey, finalW);
  }

  handle.addEventListener('pointerdown', onPointerDown);
});

// ===== Клик по фото — увеличить =====
document.querySelectorAll('.photo').forEach(img => {
  img.addEventListener('click', (e) => {
    // если это был ресайз — не открывать
    if (document.body.classList.contains('resizing')) return;

    const viewer = document.createElement('div');
    viewer.style.cssText = `
      position: fixed; inset: 0; z-index: 2000;
      background: rgba(0,0,0,0.92);
      display: flex; align-items: center; justify-content: center;
      cursor: zoom-out;
    `;
    const bigImg = document.createElement('img');
    bigImg.src = img.src;
    bigImg.alt = img.alt;
    bigImg.style.cssText = `
      max-width: 90vw; max-height: 90vh;
      border: 4px solid #6b7a4a; border-radius: 8px;
      box-shadow: 0 0 50px rgba(0,0,0,1);
    `;
    viewer.appendChild(bigImg);
    document.body.appendChild(viewer);
    viewer.addEventListener('click', () => viewer.remove());
  });
});

// ===== Сохранение редактируемого текста =====
document.querySelectorAll('.editable').forEach((el, i) => {
  const key = 'edit_' + i;
  const saved = localStorage.getItem(key);
  if (saved) el.innerHTML = saved;
  el.addEventListener('input', () => {
    localStorage.setItem(key, el.innerHTML);
  });
});