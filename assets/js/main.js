(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- мобильное меню ---------- */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  var mq = window.matchMedia('(max-width: 1023px)');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle__label').textContent = open ? 'Закрыть меню' : 'Открыть меню';
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (header && toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    var onChange = function (e) { if (!e.matches) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---------- мобильный первый экран ----------
     Нижняя граница портрета находится выше основной кнопки на половину её высоты.
     Измерение, а не фиксированная высота, сохраняет это на всех ширинах телефона. */
  var hero = document.querySelector('.hero');
  var heroPrimaryAction = hero && hero.querySelector('.hero__actions .btn--primary');
  var heroMobileMq = window.matchMedia('(max-width: 767px)');

  function syncMobileHeroMedia() {
    if (!hero || !heroPrimaryAction) return;
    if (!heroMobileMq.matches) {
      hero.style.removeProperty('--hero-mobile-media-height');
      return;
    }
    var heroTop = hero.getBoundingClientRect().top;
    var actionRect = heroPrimaryAction.getBoundingClientRect();
    var mediaBottom = actionRect.top - actionRect.height / 2;
    hero.style.setProperty('--hero-mobile-media-height', Math.max(0, Math.round(mediaBottom - heroTop)) + 'px');
  }

  syncMobileHeroMedia();
  window.addEventListener('resize', syncMobileHeroMedia);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncMobileHeroMedia);

  /* ---------- появление блоков при прокрутке ---------- */
  var items = document.querySelectorAll('[data-reveal]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- «Что входит в работу»: плавное раскрытие ---------- */
  document.querySelectorAll('details.more').forEach(function (box) {
    var summary = box.querySelector('summary');
    var list = box.querySelector('.more__list');
    if (!summary || !list || reduce || !list.animate) return;
    var running = null;

    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (running) running.cancel();
      var opening = !box.open;
      if (opening) box.open = true;
      var full = list.scrollHeight;
      var anim = list.animate(
        { height: opening ? ['0px', full + 'px'] : [full + 'px', '0px'], overflow: ['hidden', 'hidden'] },
        { duration: 350, easing: 'cubic-bezier(.22, .61, .36, 1)' }
      );
      running = anim;
      var done = function () {
        if (running !== anim) return;   // уже запущена следующая анимация
        running = null;
        if (!opening) box.open = false;
      };
      anim.onfinish = done;
      setTimeout(done, 400);   // страховка, если вкладка в фоне и анимация не доиграла
    });
  });

  /* ---------- окно «Свяжитесь любым способом» ----------
     Без поддержки <dialog> кнопки остаются ссылками на блок #contact. */
  var contactModal = document.getElementById('contact-modal');

  if (contactModal && typeof contactModal.showModal === 'function') {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-contact]')) {
        e.preventDefault();
        contactModal.showModal();
        document.body.style.overflow = 'hidden';
      } else if (e.target === contactModal || e.target.closest('[data-contact-close]')) {
        contactModal.close();   // клик по затемнению или по крестику
      }
    });
    contactModal.addEventListener('close', function () { document.body.style.overflow = ''; });
  }

  /* ---------- год в подвале ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
