// Склонение ФИО по падежам

(function () {
  'use strict';

  const fioInput     = document.getElementById('fioInput');
  const declineBtn   = document.getElementById('declineBtn');
  const resultText   = document.getElementById('resultText');
  const genderTag    = document.getElementById('genderTag');
  const copyBtn      = document.getElementById('copyBtn');
  const caseBadge    = document.getElementById('caseBadge');
  const questionBadge = document.getElementById('questionBadge');
  const resultPanel  = document.getElementById('resultPanel');
  const toast        = document.getElementById('toast');

  const customSelect   = document.getElementById('customSelect');
  const selectTrigger  = document.getElementById('customSelectTrigger');
  const triggerText    = document.getElementById('triggerText');
  const caseIcon       = document.getElementById('caseIcon');
  const dropdown       = document.getElementById('customSelectDropdown');
  const options        = document.querySelectorAll('.select-option');

  let currentCase = 'dative';
  let isOpen = false;
  let toastTimer = null;

  const autoModeToggle = document.getElementById('autoModeToggle');
  const helperText     = document.getElementById('helperText');

  const CASES = {
    nominative:    { label: 'Именительный падеж', question: 'кто?',    icon: '🏠' },
    genitive:      { label: 'Родительный падеж',  question: 'кого?',   icon: '👤' },
    dative:        { label: 'Дательный падеж',    question: 'кому?',   icon: '📖' },
    accusative:    { label: 'Винительный падеж',  question: 'кого?',   icon: '🎯' },
    instrumental:  { label: 'Творительный падеж', question: 'кем?',    icon: '🛠'  },
    prepositional: { label: 'Предложный падеж',   question: 'о ком?',  icon: '🗺'  },
  };

  // ── Селект ──────────────────────────────────────────────
  function openSelect() {
    isOpen = true;
    customSelect.classList.add('open');
    dropdown.classList.add('show');
  }
  function closeSelect() {
    isOpen = false;
    customSelect.classList.remove('open');
    dropdown.classList.remove('show');
  }

  selectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen ? closeSelect() : openSelect();
  });

  document.addEventListener('click', (e) => {
    if (!customSelect.contains(e.target)) closeSelect();
  });

  options.forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      options.forEach((o) => o.classList.remove('active'));
      opt.classList.add('active');

      currentCase = opt.dataset.value;
      triggerText.textContent = opt.dataset.label;
      caseIcon.textContent    = opt.dataset.icon;

      const meta = CASES[currentCase];
      caseBadge.textContent    = meta.label;
      questionBadge.textContent = meta.question;

      closeSelect();
      if (fioInput.value.trim()) declineFullName();
    });
  });

  // ── Морфология ──────────────────────────────────────────
  function detectGender(patronymic) {
    if (!patronymic) return 'unknown';
    const p = patronymic.toLowerCase();
    if (p.endsWith('вна') || p.endsWith('чна') || p.endsWith('на')) return 'female';
    if (p.endsWith('вич') || p.endsWith('ич'))                       return 'male';
    return 'unknown';
  }

  function declineSurname(w, c, g) {
    const lo = w.toLowerCase();
    if (/ко$|ых$|их$|аго$|яго$|цкий$|ский$/.test(lo)) {
      if (g === 'female') return w;
    }

    if (g === 'male') {
      if (c === 'nominative') return w;
      if (lo.endsWith('ский') || lo.endsWith('цкий')) {
        const base = w.slice(0, -2);
        return { genitive: base+'ого', dative: base+'ому', accusative: base+'ого',
                 instrumental: base+'им', prepositional: base+'ом' }[c] ?? w;
      }
      if (lo.endsWith('ой') && !lo.endsWith('ской')) {
        const base = w.slice(0, -2);
        return { genitive: base+'ого', dative: base+'ому', accusative: base+'ого',
                 instrumental: base+'ым', prepositional: base+'ом' }[c] ?? w;
      }
      if (lo.endsWith('ий')) {
        const base = w.slice(0, -2);
        return { genitive: base+'ия', dative: base+'ию', accusative: base+'ия',
                 instrumental: base+'ием', prepositional: base+'ии' }[c] ?? w;
      }
      if (lo.endsWith('ый')) {
        const base = w.slice(0, -2);
        return { genitive: base+'ого', dative: base+'ому', accusative: base+'ого',
                 instrumental: base+'ым', prepositional: base+'ом' }[c] ?? w;
      }
      if (lo.endsWith('ов') || lo.endsWith('ев') || lo.endsWith('ёв')) {
        return { genitive: w+'а', dative: w+'у', accusative: w+'а',
                 instrumental: w+'ым', prepositional: w+'е' }[c] ?? w;
      }
      if (lo.endsWith('ин') || lo.endsWith('ын')) {
        return { genitive: w+'а', dative: w+'у', accusative: w+'а',
                 instrumental: w+'ым', prepositional: w+'е' }[c] ?? w;
      }
      if (lo.endsWith('ь')) {
        const base = w.slice(0, -1);
        return { genitive: base+'я', dative: base+'ю', accusative: base+'я',
                 instrumental: base+'ем', prepositional: base+'е' }[c] ?? w;
      }
      const vowels = /[аеёиоуыьъяю]$/i;
      if (!vowels.test(lo)) {
        return { genitive: w+'а', dative: w+'у', accusative: w+'а',
                 instrumental: w+'ом', prepositional: w+'е' }[c] ?? w;
      }
      return w;
    }

    if (g === 'female') {
      if (c === 'nominative') return w;
      if (lo.endsWith('ская') || lo.endsWith('цкая')) {
        const base = w.slice(0, -2);
        return { genitive: base+'ой', dative: base+'ой', accusative: base+'ую',
                 instrumental: base+'ой', prepositional: base+'ой' }[c] ?? w;
      }
      if (lo.endsWith('ая')) {
        const base = w.slice(0, -2);
        return { genitive: base+'ой', dative: base+'ой', accusative: base+'ую',
                 instrumental: base+'ой', prepositional: base+'ой' }[c] ?? w;
      }
      if (lo.endsWith('ова') || lo.endsWith('ева') || lo.endsWith('ина') || lo.endsWith('ына')) {
        const base = w.slice(0, -1);
        return { genitive: base+'ой', dative: base+'ой', accusative: base+'у',
                 instrumental: base+'ой', prepositional: base+'ой' }[c] ?? w;
      }
      return w;
    }
    return w;
  }

  function declineName(w, c, g) {
    const lo = w.toLowerCase();
    if (c === 'nominative') return w;

    if (g === 'male') {
      if (lo.endsWith('й')) {
        const b = w.slice(0, -1);
        return { genitive: b+'я', dative: b+'ю', accusative: b+'я',
                 instrumental: b+'ем', prepositional: b+'е' }[c] ?? w;
      }
      if (lo.endsWith('ь')) {
        const b = w.slice(0, -1);
        return { genitive: b+'я', dative: b+'ю', accusative: b+'я',
                 instrumental: b+'ем', prepositional: b+'е' }[c] ?? w;
      }
      if (lo.endsWith('а')) {
        const b = w.slice(0, -1);
        return { genitive: b+'ы', dative: b+'е', accusative: b+'у',
                 instrumental: b+'ой', prepositional: b+'е' }[c] ?? w;
      }
      if (lo.endsWith('я')) {
        const b = w.slice(0, -1);
        return { genitive: b+'и', dative: b+'е', accusative: b+'ю',
                 instrumental: b+'ей', prepositional: b+'е' }[c] ?? w;
      }
      return { genitive: w+'а', dative: w+'у', accusative: w+'а',
               instrumental: w+'ом', prepositional: w+'е' }[c] ?? w;
    }

    if (g === 'female') {
      if (lo.endsWith('я')) {
        const b = w.slice(0, -1);
        return { genitive: b+'и', dative: b+'е', accusative: b+'ю',
                 instrumental: b+'ей', prepositional: b+'е' }[c] ?? w;
      }
      if (lo.endsWith('а')) {
        const b = w.slice(0, -1);
        return { genitive: b+'ы', dative: b+'е', accusative: b+'у',
                 instrumental: b+'ой', prepositional: b+'е' }[c] ?? w;
      }
      if (lo.endsWith('ь')) {
        const b = w.slice(0, -1);
        return { genitive: b+'и', dative: b+'и', accusative: w,
                 instrumental: b+'ью', prepositional: b+'и' }[c] ?? w;
      }
      return w;
    }
    return w;
  }

  function declinePatronymic(w, c, g) {
    const lo = w.toLowerCase();
    if (c === 'nominative') return w;

    if (g === 'male') {
      return { genitive: w+'а', dative: w+'у', accusative: w+'а',
               instrumental: lo.endsWith('ич') ? w+'ем' : w+'ом',
               prepositional: w+'е' }[c] ?? w;
    }
    if (g === 'female') {
      if (lo.endsWith('чна')) {
        const b = w.slice(0, -3);
        return { genitive: b+'чны', dative: b+'чне', accusative: b+'чну',
                 instrumental: b+'чной', prepositional: b+'чне' }[c] ?? w;
      }
      if (lo.endsWith('на')) {
        const b = w.slice(0, -2);
        return { genitive: b+'ны', dative: b+'не', accusative: b+'ну',
                 instrumental: b+'ной', prepositional: b+'не' }[c] ?? w;
      }
    }
    return w;
  }

  function toProperCase(word) {
    if (!word) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  // ── Основная функция ────────────────────────────────────
  function declineFullName(animate = true) {
    const raw = fioInput.value.trim();

    if (!raw) {
      setPlaceholder();
      return;
    }

    const parts = raw.split(/\s+/).filter(Boolean);
    const surname    = toProperCase(parts[0] || '');
    const name       = toProperCase(parts[1] || '');
    const patronymic = toProperCase(parts[2] || '');

    const genderRaw = detectGender(patronymic);
    const gender = genderRaw !== 'unknown' ? genderRaw : 'male';
    const c = currentCase;

    const declined = [
      surname    ? declineSurname(surname, c, gender)       : '',
      name       ? declineName(name, c, gender)             : '',
      patronymic ? declinePatronymic(patronymic, c, gender) : '',
    ].filter(Boolean).join(' ');

    resultText.classList.remove('placeholder', 'animate');
    void resultText.offsetWidth; // reflow
    if (animate) resultText.classList.add('animate');
    resultText.textContent = declined || '—';
    resultText.style.cssText = '';

    resultPanel.classList.add('has-result');

    genderTag.textContent = genderRaw === 'male' ? 'мужской' : genderRaw === 'female' ? 'женский' : '—';
    genderTag.className = 'gender-tag' + (genderRaw !== 'unknown' ? ' ' + genderRaw : '');

    fioInput.classList.add('has-value');
  }

  function setPlaceholder() {
    resultText.classList.remove('animate');
    resultText.classList.add('placeholder');
    resultText.textContent = '';
    resultPanel.classList.remove('has-result');
    genderTag.textContent = '—';
    genderTag.className = 'gender-tag';
    fioInput.classList.remove('has-value');
  }

  // ── Toast ───────────────────────────────────────────────
  function showToast() {
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // ── События ─────────────────────────────────────────────
  declineBtn.addEventListener('click', () => declineFullName(true));

  fioInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); declineFullName(true); }
  });

  autoModeToggle.addEventListener('change', () => {
    if (autoModeToggle.checked) {
      helperText.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Результат обновляется при каждом изменении`;
      if (fioInput.value.trim()) declineFullName(false);
    } else {
      helperText.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Выберите падеж → Введите ФИО → нажмите Enter или кнопку <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;opacity:0.6"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
    }
  });

  fioInput.addEventListener('input', () => {
    if (!fioInput.value.trim()) { setPlaceholder(); return; }
    if (autoModeToggle.checked) declineFullName(false);
  });

  copyBtn.addEventListener('click', async () => {
    const text = resultText.textContent;
    if (!text || text === '—' || text === '') return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    copyBtn.classList.add('copied');
    setTimeout(() => copyBtn.classList.remove('copied'), 1500);
    showToast();
  });

  // ── Пасхалка ────────────────────────────────────────────
  const logoBadge   = document.getElementById('logoBadge');
  const easterNum   = document.getElementById('easterNum');
  const statusPill  = document.querySelector('.status-pill');
  const statusLabel = document.querySelector('.status-label');
  let easterCount   = 6;
  let easterLocked  = false;

  const numColors = {
    6: '#8896b8', 5: '#c0aa6a', 4: '#f0c040',
    3: '#f59e0b', 2: '#f97316', 1: '#ef4444', 0: '#dc2626',
  };

  function caseWord(n) {
    if (n === 1) return 'падеж';
    if (n >= 2 && n <= 4) return 'падежа';
    return 'падежей';
  }

  function spawnGhost(value, color) {
    const rect  = easterNum.getBoundingClientRect();
    const ghost = document.createElement('span');
    ghost.className   = 'num-ghost';
    ghost.textContent = value;
    ghost.style.cssText = `left:${rect.left}px;top:${rect.top}px;color:${color};font-size:2.2rem;font-weight:800;`;
    document.body.appendChild(ghost);
    ghost.addEventListener('animationend', () => ghost.remove(), { once: true });
  }

  // ── Canvas корни ──────────────────────────────────────
  function startRoots(ox, oy, onComplete) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:5000;pointer-events:none;';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx  = canvas.getContext('2d');
    const segs = [];

    function grow(x, y, angle, len, wid, t, depth) {
      if (wid < 0.3 || len < 7 || depth > 7) return;
      const perp = angle + Math.PI / 2;
      const curl = (Math.random() - 0.5) * len * 0.4;
      const mx   = (x + x + Math.cos(angle) * len) / 2 + Math.cos(perp) * curl;
      const my   = (y + y + Math.sin(angle) * len) / 2 + Math.sin(perp) * curl;
      const ex   = x + Math.cos(angle) * len;
      const ey   = y + Math.sin(angle) * len;
      const dur  = 160 + Math.random() * 130;
      segs.push({ x, y, mx, my, ex, ey, wid, t, dur });

      const childT   = t + dur * 0.32;
      const nBranch  = depth < 2 ? 3 : 2;
      const spread   = depth < 3 ? 0.85 : 0.65;
      for (let k = 0; k < nBranch; k++) {
        grow(ex, ey,
          angle + (Math.random() - 0.5) * Math.PI * spread,
          len   * (0.60 + Math.random() * 0.16),
          wid   * 0.60,
          childT + Math.random() * 40,
          depth + 1);
      }
    }

    const baseLen = Math.max(canvas.width, canvas.height) * 0.24;
    for (let i = 0; i < 13; i++) {
      const a = (i / 13) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      grow(ox, oy, a, baseLen + Math.random() * 80, 5, i * 14, 0);
    }

    const maxT = Math.max(...segs.map(s => s.t + s.dur)) + 350;
    const t0   = performance.now();

    // Градиент фона создаём один раз
    const bgGrad = ctx.createRadialGradient(
      ox, oy, 0,
      canvas.width * 0.5, canvas.height * 0.5,
      Math.hypot(canvas.width, canvas.height) * 0.65
    );
    bgGrad.addColorStop(0,    'rgba(45, 3, 3, 1)');
    bgGrad.addColorStop(0.45, 'rgba(18, 1, 1, 1)');
    bgGrad.addColorStop(1,    'rgba( 5, 0, 0, 1)');

    function frame(now) {
      const el = now - t0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Фон с глобальным alpha вместо пересчёта rgba каждый кадр
      const pBg = Math.min(el / maxT, 1);
      ctx.globalAlpha = pBg * 0.92;
      ctx.fillStyle   = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;

      // Все тонкие ветки одним батчем (один стиль → меньше переключений контекста)
      ctx.lineCap  = 'round';
      ctx.lineJoin = 'round';

      segs.forEach(s => {
        const p = Math.min(Math.max((el - s.t) / s.dur, 0), 1);
        if (p <= 0) return;

        const c1x = s.x  + p * (s.mx - s.x);
        const c1y = s.y  + p * (s.my - s.y);
        const c2x = s.mx + p * (s.ex - s.mx);
        const c2y = s.my + p * (s.ey - s.my);
        const ex  = c1x  + p * (c2x - c1x);
        const ey  = c1y  + p * (c2y - c1y);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.quadraticCurveTo(c1x, c1y, ex, ey);
        ctx.strokeStyle = `rgba(140, 8, 8, ${Math.min(0.5 + s.wid * 0.09, 0.92)})`;
        ctx.lineWidth   = s.wid;
        ctx.stroke();
      });

      if (el < maxT) {
        requestAnimationFrame(frame);
      } else {
        onComplete && onComplete();
      }
    }
    requestAnimationFrame(frame);
  }

  // ── Doom-последовательность ───────────────────────────
  function triggerDoom() {
    easterLocked = true;
    document.documentElement.style.overflow = 'hidden';

    statusPill.classList.add('offline');
    statusLabel.textContent = 'Офлайн';

    setTimeout(() => {
      const dot  = document.querySelector('.status-dot');
      const rect = (dot || statusPill).getBoundingClientRect();
      startRoots(
        rect.left + rect.width  / 2,
        rect.top  + rect.height / 2,
        () => {
          document.body.classList.add('earthquake');
          setTimeout(() => {
            document.querySelector('.header-panel').classList.add('fly-up');
            document.querySelector('.glass-card').classList.add('fall-down');
            document.querySelector('.app-footer').classList.add('fly-right');
          }, 450);
          setTimeout(() => {
            const ov = document.createElement('div');
            ov.className = 'game-over';
            ov.innerHTML = `
              <div class="game-over-content">
                <div class="game-over-emoji">💀</div>
                <div class="game-over-title">Система уничтожена</div>
                <div class="game-over-sub">0 падежей. Доволен? 😈</div>
                <button class="game-over-btn" onclick="location.reload()">Восстановить систему</button>
              </div>`;
            document.body.appendChild(ov);
          }, 1100);
        }
      );
    }, 700);
  }

  // Порядок удаления падежей: дательный остаётся последним
  const caseRemoveOrder = ['nominative', 'prepositional', 'instrumental', 'accusative', 'genitive'];

  if (logoBadge) {
    logoBadge.addEventListener('click', () => {
      if (easterLocked || easterCount <= 0) return;

      const oldCount = easterCount;
      easterCount--;

      spawnGhost(oldCount, numColors[oldCount]);

      logoBadge.classList.remove('badge-pop');
      void logoBadge.offsetWidth;
      logoBadge.classList.add('badge-pop');
      logoBadge.addEventListener('animationend', () => logoBadge.classList.remove('badge-pop'), { once: true });

      easterNum.textContent = easterCount;
      easterNum.style.color = numColors[easterCount];

      const footerEaster = document.getElementById('footerEaster');
      if (footerEaster && footerEaster.childNodes[2]) {
        footerEaster.childNodes[2].textContent = ` ${caseWord(easterCount)} · Ничего лишнего`;
      }

      // Удаляем один падеж из дропдауна (5→1)
      if (easterCount >= 1 && easterCount <= 5) {
        const caseKey = caseRemoveOrder[5 - easterCount];
        const opt = document.querySelector(`.select-option[data-value="${caseKey}"]`);
        if (opt) {
          // Если удаляемый был выбран — переключаем на дательный
          if (currentCase === caseKey) {
            currentCase = 'dative';
            const dOpt = document.querySelector('.select-option[data-value="dative"]');
            if (dOpt) {
              options.forEach(o => o.classList.remove('active'));
              dOpt.classList.add('active');
              triggerText.textContent = 'Дательный';
              caseIcon.textContent = '🎁';
              caseBadge.textContent    = CASES.dative.label;
              questionBadge.textContent = CASES.dative.question;
              declineFullName(false);
            }
          }
          opt.classList.add('option-vanish');
          opt.addEventListener('animationend', () => opt.remove(), { once: true });
        }
      }

      // При 0: селектор падает, затем doom
      if (easterCount === 0) {
        const selector = document.getElementById('customSelect');
        if (selector) selector.classList.add('selector-fall');
        setTimeout(triggerDoom, 850);
      }
    });
  }

  // ── Инициализация ───────────────────────────────────────
  setPlaceholder();
  const meta0 = CASES[currentCase];
  caseBadge.textContent    = meta0.label;
  questionBadge.textContent = meta0.question;
})();
