// ===========================================================
// JobSkillShare — interactions (v5, week 4: affiliate tracking)
// ===========================================================

// ---- Affiliate link capture -------------------------------------------
// Real affiliate ID: kaneeza-batool (from https://www.jobskillshare.org/certificate-program?ref=kaneeza-batool)
// This runs immediately (not inside DOMContentLoaded) so it captures the
// ?ref= param before the visitor clicks anything. Untagged visits to this
// prototype default to the owner's own ID; an explicit ?ref=/?aff= in the
// URL always overrides that, so partner-link testing still works.
const DEFAULT_AFFILIATE_ID = 'kaneeza-batool';
(function captureAffiliateRef() {
  try {
    const params = new URLSearchParams(window.location.search);
    const incoming = params.get('ref') || params.get('aff');
    if (incoming) {
      sessionStorage.setItem('jss_aff_ref', incoming);
    } else if (!sessionStorage.getItem('jss_aff_ref')) {
      sessionStorage.setItem('jss_aff_ref', DEFAULT_AFFILIATE_ID);
    }
  } catch (err) {
    // sessionStorage unavailable (e.g. privacy mode) — attribution simply
    // won't persist across pages, which is an acceptable degrade.
  }
})();
function getAffiliateRef() {
  try { return sessionStorage.getItem('jss_aff_ref'); } catch (err) { return null; }
}

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
    if (href.includes('#')) return;
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

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- Program Track / Level / Delivery filters (Programs page) ---------- */
  const progGrid = document.querySelector('.full-prog-grid');
  const progFilterGroups = document.querySelectorAll('#programFilters .chip-filter');
  const noProgResults = document.getElementById('noProgResults');
  if (progGrid && progFilterGroups.length) {
    const applyProgFilters = () => {
      const active = {};
      progFilterGroups.forEach(group => {
        const btn = group.querySelector('button.active');
        active[group.dataset.ftype] = btn ? btn.dataset.filter : 'all';
      });
      let visible = 0;
      progGrid.querySelectorAll('.full-prog').forEach(card => {
        const okLevel = active.level === 'all' || card.dataset.level === active.level;
        const tracks = (card.dataset.track || '').split(',');
        const okTrack = active.track === 'all' || tracks.includes(active.track);
        const okDelivery = active.delivery === 'all' || card.dataset.delivery === active.delivery;
        const show = okLevel && okTrack && okDelivery;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (noProgResults) noProgResults.classList.toggle('show', visible === 0);
    };
    progFilterGroups.forEach(group => {
      group.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          applyProgFilters();
        });
      });
    });
    applyProgFilters();
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

  /* ---------- Billing toggle (Membership page pricing table) ---------- */
  const billToggle = document.querySelectorAll('.bt-opt');
  if (billToggle.length) {
    billToggle.forEach(btn => {
      btn.addEventListener('click', () => {
        billToggle.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const yearly = btn.dataset.bill === 'yearly';
        const priceEl = document.querySelector('.plan.featured .price');
        if (priceEl) {
          const amt = priceEl.querySelector('.price-amt');
          const suf = priceEl.querySelector('.price-suffix');
          if (amt && suf) {
            amt.textContent = yearly ? priceEl.dataset.priceYearly : priceEl.dataset.priceMonthly;
            suf.textContent = yearly ? ' / month, billed yearly' : ' / month';
          }
        }
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
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

  /* ===========================================================
     Auth modal — signup / login / forgot password
     One shared component so the plan chosen on either the
     homepage pricing cards or the membership page carries
     straight into checkout without an extra page hop.
     =========================================================== */
  const overlay = document.getElementById('authOverlay');
  if (!overlay) return; // page has no modal mounted

  const modalEl = overlay.querySelector('.auth-modal');
  const bodyEl = document.getElementById('authBody');
  const stepperEl = document.getElementById('authStepper');
  const closeBtn = document.getElementById('authClose');

  const PLANS = {
    free:    { id: 'free',    name: 'Free',           price: '$0',   amount: 0,   suffix: '/ 3 months', features: ['Foundation courses', 'Community access', 'Progress tracking'] },
    monthly: { id: 'monthly', name: 'Premium Monthly', price: '$50',  amount: 50,  suffix: '/ month',    features: ['All 6 programs', 'Hands-on labs', 'AI career tools'], popular: true },
    yearly:  { id: 'yearly',  name: 'Premium Yearly',  price: '$549', amount: 549, suffix: '/ year · save $51', features: ['Everything monthly', 'Priority support', 'Resume review'] },
  };

  // Coupon codes are a demo mechanic only, no real backend. Flat 10% off
  // for any recognized code, shown live in the payment order summary.
  // Never offered on the Free plan since there is nothing to discount.
  const COUPONS = { JSS10: 0.10, WELCOME10: 0.10 };
  let appliedCoupon = null;

  let state = { flow: 'signup', step: 'plan', plan: null };

  // Builds the step dots to match whichever path is actually being taken:
  // Free skips Payment entirely, Premium goes through it. Same markup and
  // CSS classes as before, just generated so the dot count is always right
  // instead of a fixed 3 dots that didn't account for payment.
  function buildStepperDots() {
    const paid = state.plan && state.plan.id !== 'free';
    const steps = paid
      ? [['plan', '1', 'Plan'], ['account', '2', 'Account'], ['payment', '3', 'Payment'], ['details', '4', 'Finish']]
      : [['plan', '1', 'Plan'], ['account', '2', 'Account'], ['details', '3', 'Finish']];
    stepperEl.innerHTML = steps.map(([key, num, label]) =>
      `<div class="auth-step-dot" data-step="${key}"><span>${num}</span>${label}</div>`
    ).join('');
  }

  const eyeOpen = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const eyeClosed = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a21.6 21.6 0 0 1-2.66 3.79M14.12 14.12A3 3 0 1 1 9.88 9.88"/><path d="M1 1l22 22"/></svg>';

  function passwordField(id, labelText) {
    return `
      <div class="auth-field">
        <label for="${id}">${labelText}</label>
        <div class="auth-input-wrap">
          <input type="password" id="${id}" autocomplete="new-password" required minlength="8" />
          <button type="button" class="pw-toggle" data-pw-toggle-for="${id}" aria-label="Show password">${eyeOpen}</button>
        </div>
      </div>`;
  }

  function planCardsMarkup(selectedId) {
    return Object.values(PLANS).map(p => `
      <button type="button" class="auth-plan-card ${selectedId === p.id ? 'selected' : ''}" data-select-plan="${p.id}">
        ${p.popular ? '<span class="apc-flag">MOST POPULAR</span>' : ''}
        <h4>${p.name}</h4>
        <div class="apc-price">${p.price} <span>${p.suffix}</span></div>
        <ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
      </button>
    `).join('');
  }

  function renderStep() {
    stepperEl.hidden = state.flow !== 'signup';
    if (state.flow === 'signup') {
      buildStepperDots();
      const order = state.plan && state.plan.id !== 'free'
        ? ['plan', 'account', 'payment', 'details']
        : ['plan', 'account', 'details'];
      const curIdx = order.indexOf(state.step);
      stepperEl.querySelectorAll('.auth-step-dot').forEach(dot => {
        const dotIdx = order.indexOf(dot.dataset.step);
        dot.classList.toggle('active', dot.dataset.step === state.step);
        dot.classList.toggle('done', dotIdx > -1 && dotIdx < curIdx);
      });
    }

    if (state.flow === 'signup' && state.step === 'plan') {
      modalEl.classList.add('wide');
      bodyEl.innerHTML = `
        <div class="auth-eyebrow">Join JobSkillShare</div>
        <h2 class="auth-title" id="authTitle">Choose how you want to learn</h2>
        <p class="auth-sub">Pick a plan — you can switch or cancel anytime. Payment is securely handled by Stripe.</p>
        <div class="auth-plans">${planCardsMarkup(state.plan?.id)}</div>
        <div class="auth-actions">
          <button type="button" class="btn btn-primary" id="authNext" ${state.plan ? '' : 'disabled'}>Continue</button>
        </div>
        <div class="auth-link-row">Already have an account? <a href="#" data-switch-flow="login">Log in</a></div>
      `;
      bodyEl.querySelectorAll('[data-select-plan]').forEach(card => {
        card.addEventListener('click', () => {
          state.plan = PLANS[card.dataset.selectPlan];
          renderStep();
        });
      });
      const nextBtn = document.getElementById('authNext');
      if (nextBtn) nextBtn.addEventListener('click', () => { state.step = 'account'; renderStep(); });
      wireSwitchLinks();
    }

    else if (state.flow === 'signup' && state.step === 'account') {
      modalEl.classList.remove('wide');
      const ref = getAffiliateRef();
      const paid = state.plan.id !== 'free';
      bodyEl.innerHTML = `
        <div class="auth-eyebrow">Step 2 of ${paid ? '4' : '3'}</div>
        <h2 class="auth-title" id="authTitle">Create your account</h2>
        <div class="auth-plan-summary">
          <span>Plan: <b>${state.plan.name}</b> &mdash; ${state.plan.price} ${state.plan.suffix}</span>
          <button type="button" data-back-to="plan">Change plan</button>
        </div>
        ${ref ? `<div class="auth-hint ok" style="margin:-10px 0 16px;">Referred by <b>${ref}</b> &mdash; this account will be attributed to that partner.</div>` : ''}
        <button type="button" class="btn btn-ghost auth-oauth" id="googleSignup">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l6-6C33.5 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c2.8 0 5.3 1 7.3 2.7l6-6C33.5 6.5 29 4.5 24 4.5c-7.8 0-14.5 4.5-17.7 10.2z"/><path fill="#4CAF50" d="M24 43.5c5.1 0 9.7-2 13.2-5.2l-6.1-5.2C29.1 34.7 26.7 35.5 24 35.5c-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.4 39 16.1 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.1 5.2C40.9 36 43.5 30.6 43.5 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
          Continue with Google
        </button>
        <div class="auth-divider"><span>or continue with email</span></div>
        <form id="accountForm" novalidate>
          <div class="auth-field">
            <label for="accUsername">Username</label>
            <input type="text" id="accUsername" autocomplete="username" required />
          </div>
          <div class="auth-row2">
            ${passwordField('accPassword', 'Password')}
            ${passwordField('accPasswordConfirm', 'Confirm password')}
          </div>
          <div class="auth-field">
            <label for="accEmail">Email address</label>
            <input type="email" id="accEmail" autocomplete="email" required />
          </div>
          <div class="auth-actions">
            <button type="button" class="btn auth-back" data-back-to="plan">Back</button>
            <button type="submit" class="btn btn-primary">Continue</button>
          </div>
        </form>
        <div class="auth-link-row">Already have an account? <a href="#" data-switch-flow="login">Log in</a></div>
      `;
      wirePasswordToggles();
      wireBackLinks();
      wireSwitchLinks();
      // Demo only: no real OAuth is wired up, this simulates the account
      // being created instantly and moves straight to the next real step.
      document.getElementById('googleSignup').addEventListener('click', () => {
        state.step = paid ? 'payment' : 'details';
        renderStep();
      });
      const form = document.getElementById('accountForm');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const pw = document.getElementById('accPassword');
        const pwc = document.getElementById('accPasswordConfirm');
        clearHints(form);
        if (pw.value.length < 8) return showHint(pw, 'Use at least 8 characters.');
        if (pw.value !== pwc.value) return showHint(pwc, 'Passwords don\'t match.');
        state.step = paid ? 'payment' : 'details';
        renderStep();
      });
    }

    else if (state.flow === 'signup' && state.step === 'payment') {
      // Only reachable for Premium Monthly / Yearly. Free never routes here,
      // renderStep() sends Free straight from account to details instead.
      modalEl.classList.remove('wide');
      const base = state.plan.amount;
      const discount = appliedCoupon ? Math.round(base * appliedCoupon.rate * 100) / 100 : 0;
      const total = (base - discount).toFixed(2);
      bodyEl.innerHTML = `
        <div class="auth-eyebrow">Step 3 of 4</div>
        <h2 class="auth-title" id="authTitle">Payment details</h2>
        <div class="auth-plan-summary">
          <span>Plan: <b>${state.plan.name}</b> &mdash; ${state.plan.price} ${state.plan.suffix}</span>
          <button type="button" data-back-to="account">Change plan</button>
        </div>
        <div class="coupon-row">
          <input type="text" id="couponInput" placeholder="Coupon code" value="${appliedCoupon ? appliedCoupon.code : ''}" ${appliedCoupon ? 'disabled' : ''} />
          <button type="button" class="btn btn-ghost" id="couponBtn">${appliedCoupon ? 'Remove' : 'Apply'}</button>
        </div>
        <div id="couponMsg"></div>
        <div class="auth-order-summary">
          <div class="auth-order-row"><span>${state.plan.name}</span><span>$${base.toFixed(2)}</span></div>
          ${appliedCoupon ? `<div class="auth-order-row discount"><span>Coupon ${appliedCoupon.code}</span><span>&minus;$${discount.toFixed(2)}</span></div>` : ''}
          <div class="auth-order-row total"><span>Total due today</span><span>$${total}</span></div>
        </div>
        <form id="paymentForm" novalidate>
          <div class="auth-field">
            <label for="cardName">Name on card</label>
            <input type="text" id="cardName" autocomplete="cc-name" required />
          </div>
          <div class="auth-field">
            <label for="cardNumber">Card number</label>
            <input type="text" id="cardNumber" inputmode="numeric" autocomplete="cc-number" placeholder="1234 1234 1234 1234" required minlength="12" />
          </div>
          <div class="auth-card-row2">
            <div class="auth-field">
              <label for="cardExpiry">Expiry</label>
              <input type="text" id="cardExpiry" autocomplete="cc-exp" placeholder="MM / YY" required />
            </div>
            <div class="auth-field">
              <label for="cardCvc">CVC</label>
              <input type="text" id="cardCvc" inputmode="numeric" autocomplete="cc-csc" placeholder="123" required minlength="3" maxlength="4" />
            </div>
          </div>
          <div class="auth-actions">
            <button type="button" class="btn auth-back" data-back-to="account">Back</button>
            <button type="submit" class="btn btn-primary">Pay $${total}</button>
          </div>
          <div class="auth-secure-note">&#128274; Payment is a prototype form only, no real card processing.</div>
        </form>
      `;
      wireBackLinks();
      const couponBtn = document.getElementById('couponBtn');
      couponBtn.addEventListener('click', () => {
        const msgEl = document.getElementById('couponMsg');
        if (appliedCoupon) {
          appliedCoupon = null;
          renderStep();
          return;
        }
        const code = document.getElementById('couponInput').value.trim().toUpperCase();
        if (COUPONS[code]) {
          appliedCoupon = { code, rate: COUPONS[code] };
          renderStep();
        } else {
          msgEl.innerHTML = `<p class="coupon-msg err">That code isn't valid. Try JSS10.</p>`;
        }
      });
      document.getElementById('paymentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        state.step = 'details';
        renderStep();
      });
    }

    else if (state.flow === 'signup' && state.step === 'details') {
      modalEl.classList.remove('wide');
      const paid = state.plan.id !== 'free';
      bodyEl.innerHTML = `
        <div class="auth-eyebrow">Step ${paid ? '4 of 4' : '3 of 3'} &middot; optional</div>
        <h2 class="auth-title" id="authTitle">Tell us a bit more</h2>
        <p class="auth-sub">Totally optional — helps us point you at the right courses first. You can finish without answering.</p>
        <form id="detailsForm">
          <div class="auth-field">
            <label for="goal">What are your career goals? <span class="optional-tag">(optional)</span></label>
            <textarea id="goal" placeholder="e.g. Land my first help-desk role"></textarea>
          </div>
          <div class="auth-field">
            <label for="ref">How did you hear about JobSkillShare? <span class="optional-tag">(optional)</span></label>
            <input type="text" id="ref" placeholder="e.g. Discord, a friend, search" />
          </div>
          <div class="auth-actions">
            <button type="button" class="btn auth-back" data-back-to="${paid ? 'payment' : 'account'}">Back</button>
            <button type="submit" class="btn btn-primary">Finish</button>
          </div>
        </form>
        <div class="auth-link-row"><a href="#" id="skipDetails">Skip this step</a></div>
      `;
      wireBackLinks();
      document.getElementById('detailsForm').addEventListener('submit', (e) => { e.preventDefault(); state.step = 'done'; renderStep(); });
      document.getElementById('skipDetails').addEventListener('click', (e) => { e.preventDefault(); state.step = 'done'; renderStep(); });
    }

    else if (state.flow === 'signup' && state.step === 'done') {
      modalEl.classList.remove('wide');
      const ref = getAffiliateRef();
      bodyEl.innerHTML = `
        <div class="auth-done">
          <div class="ok-circle">&#10003;</div>
          <h2 class="auth-title" id="authTitle">You're in!</h2>
          <p class="auth-sub">Your <b>${state.plan.name}</b> account is ready. Jump into your first program whenever you like.</p>
          ${ref ? `<p class="auth-hint ok">Attributed to partner <b>${ref}</b>.</p>` : ''}
          <div class="auth-actions">
            <button type="button" class="btn btn-primary" id="authDoneBtn">Go to my learning</button>
          </div>
        </div>
      `;
      document.getElementById('authDoneBtn').addEventListener('click', closeAuth);
    }

    else if (state.flow === 'login') {
      modalEl.classList.remove('wide');
      bodyEl.innerHTML = `
        <div class="auth-eyebrow">Welcome back</div>
        <h2 class="auth-title" id="authTitle">Continue your learning</h2>
        <p class="auth-sub">Log in to return to your learning portal.</p>
        <form id="loginForm">
          <div class="auth-field">
            <label for="loginUser">Email or username</label>
            <input type="text" id="loginUser" autocomplete="username" required />
          </div>
          ${passwordField('loginPw', 'Password')}
          <a href="#" class="auth-forgot" data-switch-flow="forgot">Forgot your password?</a>
          <div class="auth-check-row"><input type="checkbox" id="keepLogged" /><label for="keepLogged">Keep me logged in</label></div>
          <div class="auth-actions">
            <button type="submit" class="btn btn-primary">Log in &amp; continue</button>
          </div>
        </form>
        <div class="auth-link-row">New to JobSkillShare? <a href="#" data-switch-flow="plan">Create a free or Premium account</a></div>
      `;
      wirePasswordToggles();
      wireSwitchLinks();
      document.getElementById('loginForm').addEventListener('submit', (e) => { e.preventDefault(); closeAuth(); });
    }

    else if (state.flow === 'forgot') {
      // Single-purpose screen: only what's needed to reset a password —
      // no course-helper or "new here" links repeated (audit #6).
      modalEl.classList.remove('wide');
      bodyEl.innerHTML = `
        <div class="auth-eyebrow">Reset password</div>
        <h2 class="auth-title" id="authTitle">Let's get you back in</h2>
        <p class="auth-sub">Enter the email or username on your account and we'll send reset instructions.</p>
        <form id="forgotForm">
          <div class="auth-field">
            <label for="forgotUser">Email or username</label>
            <input type="text" id="forgotUser" required />
          </div>
          <div class="auth-actions">
            <button type="submit" class="btn btn-primary">Send reset email</button>
          </div>
        </form>
        <div class="auth-link-row"><a href="#" data-switch-flow="login">&larr; Back to login</a></div>
      `;
      wireSwitchLinks();
      document.getElementById('forgotForm').addEventListener('submit', (e) => {
        e.preventDefault();
        bodyEl.innerHTML = `
          <div class="auth-done">
            <div class="ok-circle">&#9993;</div>
            <h2 class="auth-title">Check your inbox</h2>
            <p class="auth-sub">If that account exists, reset instructions are on the way.</p>
            <div class="auth-actions">
              <button type="button" class="btn btn-primary" id="backToLoginBtn">Back to login</button>
            </div>
          </div>`;
        document.getElementById('backToLoginBtn').addEventListener('click', () => { state.flow = 'login'; renderStep(); });
      });
    }
  }

  function wireBackLinks() {
    bodyEl.querySelectorAll('[data-back-to]').forEach(btn => {
      btn.addEventListener('click', () => { state.step = btn.dataset.backTo; renderStep(); });
    });
  }
  function wireSwitchLinks() {
    bodyEl.querySelectorAll('[data-switch-flow]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.dataset.switchFlow;
        if (target === 'plan') { state.flow = 'signup'; state.step = 'plan'; }
        else { state.flow = target; }
        renderStep();
      });
    });
  }
  function wirePasswordToggles() {
    bodyEl.querySelectorAll('[data-pw-toggle-for]').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.pwToggleFor);
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = show ? eyeClosed : eyeOpen;
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      });
    });
  }
  function showHint(input, msg) {
    let hint = input.parentElement.parentElement.querySelector('.auth-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'auth-hint err';
      input.closest('.auth-field, .auth-row2').appendChild(hint);
    }
    hint.textContent = msg;
    hint.classList.add('err');
    input.focus();
  }
  function clearHints(scope) {
    scope.querySelectorAll('.auth-hint').forEach(h => h.remove());
  }

  function openAuth(startStep, planId) {
    state = { flow: 'signup', step: 'plan', plan: planId ? PLANS[planId] : null };
    appliedCoupon = null;
    if (startStep === 'login') state = { flow: 'login', step: 'login', plan: null };
    else if (planId) { state.step = 'account'; }
    overlay.hidden = false;
    document.body.classList.add('modal-open');
    renderStep();
    closeBtn.focus();
  }
  function closeAuth() {
    overlay.hidden = true;
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('[data-open-auth]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openAuth(trigger.dataset.openAuth, trigger.dataset.plan);
    });
  });
  closeBtn.addEventListener('click', closeAuth);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAuth(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) closeAuth(); });

});

// ===========================================================
// Motion layer — scroll progress, magnetic buttons, tilt cards,
// button ripple, cursor spotlight. Runs independently of the
// auth-modal block above so it applies on every page.
// ===========================================================
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    const updateProgress = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      progressBar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  if (reduceMotion) return; // skip pointer-driven motion for reduced-motion users

  /* ---------- Cursor spotlight on dark hero-style sections ---------- */
  document.querySelectorAll('.hero, .page-hero, .final').forEach(section => {
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      section.style.setProperty('--mx', x + '%');
      section.style.setProperty('--my', y + '%');
    });
  });

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      btn.style.setProperty('--tx', (relX * 0.18) + 'px');
      btn.style.setProperty('--ty', (relY * 0.28) + 'px');
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.setProperty('--tx', '0px');
      btn.style.setProperty('--ty', '0px');
    });
  });

  /* ---------- 3D tilt on cards ---------- */
  const tiltEls = document.querySelectorAll('.tilt');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    tiltEls.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;   // 0..1
        const py = (e.clientY - rect.top) / rect.height;   // 0..1
        const ry = (px - 0.5) * 10;  // rotateY range
        const rx = (0.5 - py) * 8;   // rotateX range
        card.style.setProperty('--rx', rx + 'deg');
        card.style.setProperty('--ry', ry + 'deg');
        card.classList.add('tilting');
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('tilting');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- Button ripple on click ---------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ---------- Campaign page sticky CTA bar ---------- */
  const stickyCta = document.getElementById('stickyCta');
  if (stickyCta) {
    const heroEl = document.querySelector('.camp-hero');
    const onCampScroll = () => {
      const threshold = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : 500;
      stickyCta.classList.toggle('show', window.scrollY > threshold);
    };
    window.addEventListener('scroll', onCampScroll, { passive: true });
    onCampScroll();
  }
});
