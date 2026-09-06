// -------------------------------------------------------
// 언어 전환 함수 — KR/EN 버튼 클릭 시 body 클래스 변경
// -------------------------------------------------------
function setLang(lang) {
  document.body.classList.toggle('lang-en', lang === 'en');
  document.getElementById('btn-kr').classList.toggle('active', lang === 'kr');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  // 로컬스토리지에 언어 설정 저장 (새로고침 후에도 유지)
  try { localStorage.setItem('akari-lang', lang); } catch(e) {}
}

// -------------------------------------------------------
// 테마 토글 — 다크/라이트 모드 전환
// -------------------------------------------------------
function toggleTheme() {
  const btn = document.getElementById('theme-btn');
  const isLight = document.body.classList.toggle('light-mode');
  btn.textContent = isLight ? '☀' : '☽';
  try { localStorage.setItem('akari-theme', isLight ? 'light' : 'dark'); } catch(e) {}
}

// -------------------------------------------------------
// 모바일 드로어 열기/닫기
// -------------------------------------------------------
function openDrawer()  { document.getElementById('nav-drawer').classList.add('open'); }
function closeDrawer() { document.getElementById('nav-drawer').classList.remove('open'); }

// -------------------------------------------------------
// 내비게이션 스크롤 효과 — 스크롤 시 배경 반투명 적용
// -------------------------------------------------------
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// -------------------------------------------------------
// FAQ 아코디언 — 클릭 시 열기/닫기 토글
// -------------------------------------------------------
function toggleFaq(btn) {
  const item   = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-answer');
  const isOpen = item.classList.contains('open');

  // 다른 열린 항목 닫기
  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-answer').style.maxHeight = '0';
  });

  // 현재 항목 토글
  if (!isOpen) {
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}

// -------------------------------------------------------
// 스크롤 리빌 애니메이션 — IntersectionObserver 사용
// -------------------------------------------------------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target); // 한 번만 실행
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// -------------------------------------------------------
// 히어로 배경 애니메이션 — 페이지 로드 시 천천히 스케일
// -------------------------------------------------------
window.addEventListener('load', () => {
  document.getElementById('hero').classList.add('loaded');
});

// -------------------------------------------------------
// 초기화 — 로컬스토리지에서 언어/테마 설정 복원
// -------------------------------------------------------
(function init() {
  try {
    const lang  = localStorage.getItem('akari-lang');
    const theme = localStorage.getItem('akari-theme');
    if (lang  === 'en')    setLang('en');
    if (theme === 'light') { document.body.classList.add('light-mode'); document.getElementById('theme-btn').textContent = '☀'; }
  } catch(e) {}
})();

// -------------------------------------------------------
// 리뷰 캐러셀 — 자동 순환 슬라이더
// -------------------------------------------------------
(function() {
  const track = document.querySelector('.reviews-track');
  if (!track) return;

  const cards = Array.from(track.children);
  const gap = 24;
  let current = 0;
  let autoplay;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartOffset = 0;

  // 원활한 무한 루프를 위해 앞뒤로 카드 복제
  cards.forEach(c => track.appendChild(c.cloneNode(true)));
  cards.forEach(c => track.insertBefore(c.cloneNode(true), track.firstChild));

  const allCards = () => Array.from(track.children);
  const cardWidth = () => allCards()[0].offsetWidth + gap;
  const total = cards.length;

  function getOffset(index) {
    return (index + total) * cardWidth();
  }

  function goTo(index, animated) {
    track.style.transition = animated ? 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none';
    track.style.transform = `translateX(-${getOffset(index)}px)`;
    current = index;
  }

  // 초기 위치 (복제본 중간 세트부터 시작)
  goTo(0, false);

  // 무한 루프 처리 — 트랜지션 끝나면 위치 점프
  track.addEventListener('transitionend', () => {
    if (current >= total) goTo(current - total, false);
    else if (current < 0)  goTo(current + total, false);
  });

  function next() { goTo(current + 1, true); }
  function prev() { goTo(current - 1, true); }

  function startAutoplay() {
    autoplay = setInterval(next, 4000);
  }
  function stopAutoplay() {
    clearInterval(autoplay);
  }

  startAutoplay();

  // 마우스 드래그로 수동 조작
  const carousel = document.querySelector('.reviews-carousel');
  carousel.addEventListener('mousedown', e => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartOffset = current;
    stopAutoplay();
    track.style.transition = 'none';
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const diff = dragStartX - e.clientX;
    track.style.transform = `translateX(-${getOffset(dragStartOffset) + diff}px)`;
  });
  window.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    const diff = e.clientX - dragStartX;
    if (diff < -60)      goTo(dragStartOffset + 1, true);
    else if (diff > 60)  goTo(dragStartOffset - 1, true);
    else                 goTo(dragStartOffset, true);
    startAutoplay();
  });

  // 터치 지원
  carousel.addEventListener('touchstart', e => {
    dragStartX = e.touches[0].clientX;
    dragStartOffset = current;
    stopAutoplay();
  }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - dragStartX;
    if (diff < -40)      goTo(dragStartOffset + 1, true);
    else if (diff > 40)  goTo(dragStartOffset - 1, true);
    else                 goTo(dragStartOffset, true);
    startAutoplay();
  });

  // 섹션 밖으로 나가면 자동재생 재개
  carousel.addEventListener('mouseleave', () => {
    if (!isDragging) return;
    isDragging = false;
    goTo(dragStartOffset, true);
    startAutoplay();
  });
})();
