guideBtn.onclick   = () => guide.classList.toggle('open');
grabber.onclick    = () => backpack.classList.toggle('closed');
barFill.style.width = score + '%';
barFill.className  = 'bar-fill ' + (score >= 80 ? '' : score >= 40 ? 'mid' : 'low');

//item database
const ITEMS = [
  { id:'bench',    name:'bench',    img:'img/bench.png',    happy:0.8, note:'for sitting',   verb:'left a bench' },
  { id:'tree',     name:'tree',     img:'img/tree.png',     happy:0.8, note:'to look at',    verb:'planted a tree' },
  { id:'lemon',    name:'lemon',    img:'img/lemon.png',    happy:0.8, note:'wow so sour',   verb:'left a lemon' },
  { id:'slide',    name:'slide',    img:'img/slide.png',    happy:0.7, note:'this is helpful', verb:'built a slide' },
  { id:'fountain', name:'fountain', img:'img/fountain.png', happy:1.2, note:'splashy',       verb:'built a fountain' },
  { id:'cat',      name:'cat',      img:'img/cat.png',      happy:1.5, note:'she owns you',  verb:'adopted a town cat' },
];

//backpack
const SLOT_COUNT = 5;
let selectedItem = null;

function renderBackpack() {
  const wrap = document.getElementById('slots');
  wrap.innerHTML = '';

  for (let s = 0; s < SLOT_COUNT; s++) {
    const item = ITEMS[s];
    const slot = document.createElement('div');

    /* empty trailing slot */
    if (!item) {
      slot.className = 'slot slot-empty';
      wrap.appendChild(slot);
      continue;
    }

    slot.className = 'slot';
    slot.dataset.id = item.id;

    slot.innerHTML = `
      <span class="slot-happy">+${item.happy}%</span>
      <img class="slot-img" src="${item.img}" alt="${item.name}"
           loading="lazy" draggable="false">
      <div class="slot-foot">
        <span class="slot-name">${item.name}</span>
        <span class="slot-note">${item.note}</span>
      </div>
    `;

    slot.addEventListener('click', () => selectItem(item.id));
    wrap.appendChild(slot);
  }
}

function selectItem(id) {
  if (state().actions >= 2) {
    toast("you're out of actions today");
    return;
  }
  selectedItem = (selectedItem === id) ? null : id;   // click again to deselect

  document.querySelectorAll('.slot').forEach(el =>
    el.classList.toggle('selected', el.dataset.id === selectedItem)
  );

  document.body.classList.toggle('placing', !!selectedItem);
}

renderBackpack();
