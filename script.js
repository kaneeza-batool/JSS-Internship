// ===========================================================
// JobSkillShare homepage — interactions
// ===========================================================
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Header scroll elevation ---------- */
  const header = document.querySelector('header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Active nav link for current page ---------- */
  const here = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.menu > a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (href.includes('#')) return; // anchor links (Pricing, Success Stories) aren't page destinations
    const target = href || 'index.html';
    if (target === here) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mainMenu = document.getElementById('mainMenu');
  if (menuToggle && mainMenu) {
    menuToggle.addEventListener('click', () => {
      const open = mainMenu.classList.toggle('open');
      menuToggle.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mainMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mainMenu.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---------- Notify me form ---------- */
  const notifyForm = document.getElementById('notifyForm');
  const notifyThanks = document.getElementById('notifyThanks');
  if (notifyForm) {
    notifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('notifyEmail');
      if (!email || !email.checkValidity()) { email?.reportValidity(); return; }
      notifyForm.hidden = true;
      if (notifyThanks) notifyThanks.hidden = false;
      email.value = '';
    });
  }

  /* ---------- Preview terminal (typing effect) ---------- */
  const scripts = {
    'CompTIA A+ Lab Demo': [
      { cls: 'prompt', text: '$ jss lab start comptia-aplus/hardware-01' },
      { cls: 'ok', text: '✓ Provisioning virtual workstation…' },
      { cls: 'ok', text: '✓ Environment ready — Windows 10, 2 vCPU' },
      { cls: '', text: 'Task: replace the failing PSU and verify POST' },
      { cls: 'ok', text: '✓ 4 of 4 checks passing' }
    ],
    'Roles and Careers in Power BI': [
      { cls: 'prompt', text: '$ jss lab start data/power-bi-roles' },
      { cls: 'ok', text: '✓ Loading sample sales dataset (12,480 rows)' },
      { cls: '', text: 'Task: build a report for a Business Analyst persona' },
      { cls: 'ok', text: '✓ Dashboard published' }
    ],
    'LinkedIn Profile Optimization': [
      { cls: 'prompt', text: '$ jss career-lab start linkedin-optimizer' },
      { cls: 'ok', text: '✓ Importing your draft profile…' },
      { cls: '', text: 'Task: rewrite headline for an IT Support role' },
      { cls: 'ok', text: '✓ Suggested keywords: Help Desk, Active Directory, ITIL' }
    ],
    'Project: OS & DNS Basics': [
      { cls: 'prompt', text: '$ jss lab start networking/os-dns-fundamentals' },
      { cls: 'ok', text: '✓ Booting Ubuntu Server 22.04 sandbox…' },
      { cls: '', text: 'Task: configure a local DNS zone and resolve jss.local' },
      { cls: 'ok', text: '✓ 3 of 3 checks passing' }
    ],
    'Route 53 Demo': [
      { cls: 'prompt', text: '$ jss lab start aws/route53-demo' },
      { cls: 'ok', text: '✓ Connecting to sandbox AWS account (read-only)…' },
      { cls: '', text: 'Task: create a hosted zone and an A record' },
      { cls: 'ok', text: '✓ Record resolves in under 60s' }
    ]
  };

  const termBody = document.getElementById('termBody');
  const termTitle = document.getElementById('termTitle');
  const previewCaption = document.getElementById('previewCaption');
  const previewItems = document.querySelectorAll('.preview-item');
  let typeTimer = null;

  function typeLines(lines) {
    if (typeTimer) clearTimeout(typeTimer);
    if (!termBody) return;
    termBody.innerHTML = '';
    let li = 0, ci = 0;
    const lineEl = () => {
      const div = document.createElement('div');
      div.className = 'ln';
      termBody.appendChild(div);
      return div;
    };
    let current = lineEl();
    function step() {
      if (li >= lines.length) {
        current.insertAdjacentHTML('beforeend', '<span class="cursor"></span>');
        return;
      }
      const line = lines[li];
      if (ci === 0 && line.cls) current.classList.add(line.cls);
      if (ci < line.text.length) {
        current.textContent = line.text.slice(0, ci + 1);
        ci++;
        typeTimer = setTimeout(step, 14 + Math.random() * 18);
      } else {
        li++; ci = 0;
        if (li < lines.length) {
          current = lineEl();
          typeTimer = setTimeout(step, 220);
        } else {
          typeTimer = setTimeout(step, 120);
        }
      }
    }
    step();
  }

  function activatePreview(item) {
    previewItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    const title = item.dataset.title;
    const term = item.dataset.term;
    if (previewCaption) previewCaption.textContent = title;
    if (termTitle) termTitle.textContent = term;
    typeLines(scripts[title] || scripts['CompTIA A+ Lab Demo']);
  }

  previewItems.forEach(item => item.addEventListener('click', () => activatePreview(item)));
  if (previewItems.length) activatePreview(previewItems[0]);

  /* ---------- FAQ accordion (Programs page) ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- Program level filter (Programs page) ---------- */
  const programChips = document.getElementById('programFilter');
  const fullGrid = document.querySelector('.full-prog-grid');
  if (programChips && fullGrid) {
    const chips = programChips.querySelectorAll('button');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;
        fullGrid.querySelectorAll('.full-prog').forEach(card => {
          const show = filter === 'all' || card.dataset.level === filter;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Course search + category filter (Programs page) ---------- */
  const courseChips = document.getElementById('courseFilter');
  const courseGrid = document.querySelector('.course-grid');
  const courseSearch = document.getElementById('courseSearch');
  const noResults = document.querySelector('.no-results');
  function applyCourseFilter() {
    if (!courseGrid) return;
    const term = (courseSearch?.value || '').toLowerCase().trim();
    const activeCat = courseChips?.querySelector('button.active')?.dataset.filter || 'all';
    let visible = 0;
    courseGrid.querySelectorAll('.course-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      const cats = (card.dataset.cat || '').split(',');
      const matchesTerm = !term || text.includes(term);
      const matchesCat = activeCat === 'all' || cats.includes(activeCat);
      const show = matchesTerm && matchesCat;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (noResults) noResults.classList.toggle('show', visible === 0);
  }
  if (courseChips) {
    const chips = courseChips.querySelectorAll('button');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        applyCourseFilter();
      });
    });
  }
  if (courseSearch) courseSearch.addEventListener('input', applyCourseFilter);

  /* ---------- Reveal on scroll (single + staggered) ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Stat count-up ---------- */
  const statNums = document.querySelectorAll('.stat b[data-count]');
  if (statNums.length) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const duration = 1100;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const val = Math.round(target * eased);
          el.textContent = val.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    statNums.forEach(el => countIO.observe(el));
  }

});