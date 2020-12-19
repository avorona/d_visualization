import PerfectScrollbar from 'perfect-scrollbar';

const scrolly = document.querySelector('.js-c-scrollbar');

if (scrolly) {
  makeScrollbarKindaCool(scrolly);
}

function makeScrollbarKindaCool(target) {
  const ps = new PerfectScrollbar(target, {
    wheelSpeed: 0.5,
    wheelPropagation: true,
    minScrollbarLength: 10
  });
}
