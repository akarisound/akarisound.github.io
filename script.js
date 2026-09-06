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
// 리뷰 캐러셀 — 연속 무한 스크롤
// -------------------------------------------------------
(function() {
  const track = document.querySelector('.reviews-track');
  if (!track) return;

  // 카드 한 세트 복제 → 끝에 붙여서 끊김 없는 루프 구성
  const origCards = Array.from(track.children);
  const origCount = origCards.length;
  origCards.forEach(c => track.appendChild(c.cloneNode(true)));

  // 한 세트 너비 기준으로 스크롤 시간 계산 (px/s 속도 고정)
  function start() {
    const firstClone = track.children[origCount];
    const setWidth = firstClone.offsetLeft;
    const speed = 80;
    const duration = setWidth / speed;

    // var() in @keyframes is discrete in some browsers — inject exact px value
    const styleEl = document.createElement('style');
    styleEl.textContent = `@keyframes reviews-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-${setWidth}px); } }`;
    document.head.appendChild(styleEl);

    track.style.animationDuration = duration + 's';
    track.classList.add('scrolling');
  }

  // 폰트·이미지 로드 후 너비 재계산
  if (document.readyState === 'complete') { start(); }
  else { window.addEventListener('load', start); }
})();
