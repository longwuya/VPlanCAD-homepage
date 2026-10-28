const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Sticky section navigation keeps normal anchor links and browser history.
const navigation = document.querySelector('.site-nav');
const navigationInner = navigation.querySelector('.site-nav-inner');
const sectionLinks = [...navigation.querySelectorAll('.section-link')];
const navigationTargets = sectionLinks.map(link => document.getElementById(link.hash.slice(1)));
let activeLink = sectionLinks[0];
let navigationFrame = null;

function activateSection(link) {
  if (link === activeLink) return;
  activeLink = link;
  sectionLinks.forEach(item => {
    const active = item === link;
    item.classList.toggle('is-active', active);
    if (active) item.setAttribute('aria-current', 'location');
    else item.removeAttribute('aria-current');
  });
  if (navigationInner.scrollWidth > navigationInner.clientWidth) {
    navigationInner.scrollTo({
      left: link.offsetLeft - navigationInner.clientWidth / 2 + link.offsetWidth / 2,
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  }
}
function updateNavigation() {
  navigationFrame = null;
  const height = navigation.offsetHeight;
  const readingLine = height + Math.min(120, window.innerHeight * .18);
  let index = 0;
  navigationTargets.forEach((section, position) => {
    if (section.getBoundingClientRect().top <= readingLine) index = position;
  });
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
    index = sectionLinks.length - 1;
  }
  activateSection(sectionLinks[index]);
  navigation.classList.toggle('is-stuck', navigation.getBoundingClientRect().top <= .5 && window.scrollY > 0);
}
function queueNavigationUpdate() {
  if (navigationFrame === null) navigationFrame = requestAnimationFrame(updateNavigation);
}
function resizeNavigation() {
  document.documentElement.style.setProperty('--nav-height', `${navigation.offsetHeight}px`);
  queueNavigationUpdate();
}
window.addEventListener('scroll', queueNavigationUpdate, { passive: true });
window.addEventListener('resize', resizeNavigation);
window.addEventListener('hashchange', queueNavigationUpdate);
window.addEventListener('load', queueNavigationUpdate);
if ('ResizeObserver' in window) new ResizeObserver(resizeNavigation).observe(navigation);
resizeNavigation();

