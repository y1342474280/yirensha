/* ========= 异人杀：核心交互脚本 (Excel 动态版) ========= */

/* ----------------- 配置区 ----------------- */
const HERO_COUNT = 5; 
const HERO_PATH_PREFIX = 'https://cdn.jsdelivr.net/gh/y1342474280/yirensha@main/assets/bg/hero';
const CARD_DIR = 'https://cdn.jsdelivr.net/gh/y1342474280/yirensha@main/assets/cards/';

// [重要] 这里设置你的 Excel 文件路径
// 如果文件在根目录，写 './cards.xlsx'
// 如果在 assets 文件夹，写 './assets/cards.xlsx'
const EXCEL_PATH = './assets/cards.xlsx'; 

/* DOM 元素 */
const carouselEl = document.getElementById('hero-carousel');
const dotsEl = document.getElementById('carousel-dots');
const grid = document.getElementById('cards-grid');
const loading = document.getElementById('loading');
const modal = document.getElementById('card-modal');

/* ================= 1. Excel 数据加载核心逻辑 ================= */

// 字段映射：把 Excel 的中文表头 映射为 代码里的英文属性
const FIELD_MAP = {
  '名称': 'name',
  '数值': 'value',
  '类型': 'type',
  '阶数': 'tier',
  '效果': 'effect',
  '图片': 'image' // 可选，如果Excel里有图片链接列
};

async function loadCardDataFromExcel() {
  try {
    loading.style.display = 'block';
    loading.innerHTML = '<div class="spinner"></div><p>正在读取天道金书 (解析 Excel)...</p>';

    // 1. 下载 Excel 文件
    const response = await fetch(EXCEL_PATH);
    if (!response.ok) throw new Error("无法找到 Excel 文件，请检查路径");
    
    const arrayBuffer = await response.arrayBuffer();

    // 2. 使用 SheetJS 解析
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // 3. 获取指定工作表 "游戏卡牌" (如果没有这个名字，就取第一个表)
    const sheetName = workbook.SheetNames.includes("游戏卡牌") ? "游戏卡牌" : workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 4. 转换为 JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    // 5. 数据清洗与映射
    const cleanData = rawData.map(row => {
      const newCard = {};
      // 遍历每一列，转换 key
      for (let key in row) {
        // 去除空格
        const cleanKey = key.trim();
        const mappedKey = FIELD_MAP[cleanKey] || cleanKey; // 如果在映射表里就转英文，否则保留原名
        newCard[mappedKey] = row[key];
      }
      
      // 处理一下空值
      if(!newCard.tier) newCard.tier = "一阶"; 
      if(!newCard.value) newCard.value = "";
      
      return newCard;
    });

    console.log("成功加载卡牌数据:", cleanData);
    return cleanData;

  } catch (error) {
    console.error("加载失败:", error);
    loading.innerHTML = `<p style="color:var(--accent-3)">数据读取失败: ${error.message}<br>请确保 Excel 文件已上传且名称正确。</p>`;
    return [];
  }
}

/* ================= 2. 视觉与交互 (保持炫酷) ================= */

// --- 3D Tilt ---
function init3DTilt(element) {
  element.addEventListener('mousemove', (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;  
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10; 
    const rotateY = ((x - centerX) / centerX) * 10;  
    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  });
  element.addEventListener('mouseleave', () => {
    element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  });
}

// --- 粒子背景 ---
(function particleBg(){
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  function resize(){ w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();
  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w; this.y = Math.random() * h;
      this.size = Math.random() * 2;
      this.speedX = Math.random() * 0.5 - 0.25; this.speedY = Math.random() * 0.5 - 0.25;
      this.life = Math.random() * 0.5 + 0.5;
      this.color = Math.random() > 0.5 ? '77, 238, 234' : '116, 0, 216';
    }
    update() {
      this.x += this.speedX; this.y += this.speedY;
      if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.life * 0.5})`; ctx.fill();
    }
  }
  for(let i=0; i<Math.floor(w*h/15000); i++) particles.push(new Particle());
  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ================= 3. 轮播系统 ================= */
let heroSlides = [];
let heroIndex = 0;
function tryLoadHeroImages() {
  for (let i = 1; i <= HERO_COUNT; i++) {
    const div = document.createElement('div');
    div.className = 'hero-slide';
    carouselEl.appendChild(div);
    const img = new Image();
    img.onload = () => {
      div.style.backgroundImage = `url('${img.src}')`;
      heroSlides.push(div);
      createDot(heroSlides.length - 1);
      if (heroSlides.length === 1) div.classList.add('active');
    };
    img.src = `${HERO_PATH_PREFIX}${i}.jpg`;
  }
  setInterval(() => {
    if(heroSlides.length < 2) return;
    heroIndex = (heroIndex + 1) % heroSlides.length;
    heroSlides.forEach(s => s.classList.remove('active'));
    heroSlides[heroIndex].classList.add('active');
    Array.from(dotsEl.children).forEach((b,i) => b.classList.toggle('active', i===heroIndex));
  }, 6000);
}
function createDot(idx){
  const btn = document.createElement('button');
  if (idx === 0) btn.classList.add('active');
  dotsEl.appendChild(btn);
}

/* ================= 4. 渲染与业务逻辑 ================= */
let globalCardData = []; // 存储解析后的数据

function renderCards(cards) {
  grid.innerHTML = '';
  if (!cards || cards.length === 0) {
    loading.style.display = 'block';
    loading.innerHTML = '<p>暂无卡牌数据，请检查筛选或数据源。</p>';
    return;
  }
  loading.style.display = 'none';

  cards.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card-item';
    cardEl.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.03}s`;
    
    // 智能判断图片：如果Excel没填图片，就用名字去 assets 找
    let imgUrl = card.image; 
    if (!imgUrl) {
      imgUrl = `${CARD_DIR}${card.name}.png`; // 默认 png
    }

    cardEl.innerHTML = `
      <img class="card-image" src="${imgUrl}" loading="lazy" onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(45deg, #1a1f2e, #2a2f3e)'" alt="${card.name}" />
      <div class="card-label">${card.name}</div>
    `;
    
    cardEl.onclick = () => showCardModal(card, imgUrl);
    init3DTilt(cardEl);
    grid.appendChild(cardEl);
  });
}

function showCardModal(card, img) {
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('show'), 10);
  
  document.getElementById('modal-name').textContent = card.name || '未知';
  document.getElementById('modal-class').textContent = card.type || '未知';
  document.getElementById('modal-tier').textContent = card.tier || '-';
  document.getElementById('modal-effect').innerHTML = highlightKeywords(card.effect || '');
  document.getElementById('modal-value').textContent = card.value || '-';
  
  // 模态框图片处理
  const modalImg = document.getElementById('modal-image');
  modalImg.src = img;
  modalImg.onerror = () => { modalImg.src = 'https://via.placeholder.com/300x400?text=No+Image'; };
  
  document.getElementById('download-link').href = img;
}

function highlightKeywords(text) {
  if(!text) return '';
  // 将字符串转为 String 避免报错
  const str = String(text); 
  return str.replace(/(吟唱|速攻|禁制|余烬|运势|占卜|引渡|共鸣|反制|状态|法术|武器|宝具)/g, '<span style="color:var(--accent-1);font-weight:bold;">$1</span>');
}

/* 筛选逻辑 */
function filterGrid() {
  const typeBtn = document.querySelector('.filter-btn.active');
  const type = typeBtn ? typeBtn.dataset.type : 'all';
  const q = document.getElementById('search').value.toLowerCase();
  
  const filtered = globalCardData.filter(c => {
    const cName = c.name ? c.name.toLowerCase() : '';
    const cType = c.type || '';
    
    const matchType = type === 'all' || cType === type;
    const matchName = cName.includes(q);
    return matchType && matchName;
  });
  renderCards(filtered);
}

/* 事件绑定 */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterGrid();
  });
});
document.getElementById('search').addEventListener('input', filterGrid);
document.querySelector('.close').onclick = () => { modal.classList.remove('show'); setTimeout(()=>modal.style.display='none',300); };
window.onclick = e => { if(e.target === modal) document.querySelector('.close').click(); };

/* 初始化 */
document.addEventListener('DOMContentLoaded', async () => {
  tryLoadHeroImages();
  
  // 核心：等待 Excel 加载完毕
  globalCardData = await loadCardDataFromExcel();
  renderCards(globalCardData);

  // 滚动交互
  document.getElementById('enter-btn').onclick = () => document.getElementById('gallery').scrollIntoView({behavior:'smooth'});
  document.getElementById('rules-btn').onclick = () => document.getElementById('rules').scrollIntoView({behavior:'smooth'});
  document.getElementById('toggle-rules').onclick = () => {
    document.getElementById('rules-content').classList.toggle('expanded');
  };
});
