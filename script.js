/* ========= 异人杀：天道引擎 (Core Script) ========= */

/* 配置 */
// 注意：请将你的 card.xlsx 文件放在网站根目录，或者 assets 文件夹内
const DATA_SOURCE = 'assets/card.xlsx'; 
const CARD_IMAGE_PATH = 'assets/cards/'; // 假设你把之前的PNG都放在这
const HERO_BG_PATH = 'assets/bg/hero';   // 英雄背景图前缀

/* DOM 元素 */
const grid = document.getElementById('cards-grid');
const loading = document.getElementById('loading-state');
const modal = document.getElementById('card-modal');
const searchInput = document.getElementById('search-input');
const heroLayer = document.getElementById('hero-bg-layer');

/* 全局数据缓存 */
let allCardData = [];

/* ================= 1. 核心：读取 Excel ================= */
async function initGameData() {
  try {
    // 1. 获取 Excel 文件
    const response = await fetch(DATA_SOURCE);
    if (!response.ok) {
        // 尝试去 assets 找找
        const response2 = await fetch('assets/' + DATA_SOURCE);
        if(!response2.ok) throw new Error("无法找到 card.xlsx，请确保文件已上传。");
        var arrayBuffer = await response2.arrayBuffer();
    } else {
        var arrayBuffer = await response.arrayBuffer();
    }

    // 2. 解析
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // 3. 寻找 "游戏卡牌" sheet
    // 如果找不到中文名，就默认取第4个sheet(通常是游戏卡牌)，或者第1个
    let targetSheetName = workbook.SheetNames.find(name => name.includes('游戏卡牌'));
    if (!targetSheetName) targetSheetName = workbook.SheetNames[0];
    
    const worksheet = workbook.Sheets[targetSheetName];
    
    // 4. 转换为 JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // 5. 格式化数据 (映射中文列名 -> 英文Key)
    allCardData = jsonData.map(row => {
      return {
        name: row['名称'] || '无名之辈',
        value: row['数值'] || '-',
        type: row['类型'] || '未知',
        tier: row['阶数'] || '凡阶',
        effect: row['效果'] || '此物平平无奇，并无特效。',
        // 如果Excel没图，就用名字拼路径
        image: `${CARD_IMAGE_PATH}${row['名称']}.png`
      };
    });

    console.log(`天书已解析，共收录 ${allCardData.length} 张卡牌。`);
    renderCards(allCardData);

  } catch (err) {
    console.error(err);
    loading.innerHTML = `<p style="color:#a83636">天机遮蔽，读取失败。<br>${err.message}</p>`;
  }
}

/* ================= 2. 渲染系统 ================= */

function renderCards(cards) {
  grid.innerHTML = '';
  loading.style.display = 'none';

  if (cards.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#666">未寻得相关法门。</p>';
    return;
  }

  cards.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card-item';
    
    // 简单的懒加载与错误处理
    const imgPath = card.image;
    
    cardEl.innerHTML = `
      <div class="card-inner">
        <img class="card-img" src="${imgPath}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450?text=${encodeURIComponent(card.name)}'">
        <div class="card-name-tag">${card.name}</div>
      </div>
    `;

    // 点击事件
    cardEl.onclick = () => openModal(card, cardEl.querySelector('img').src);
    
    grid.appendChild(cardEl);
  });
}

/* ================= 3. 交互与特效 ================= */

/* 详情模态框 */
function openModal(card, imgSrc) {
  modal.style.display = 'flex';
  // 强制重绘以触发 transition
  setTimeout(() => modal.classList.add('show'), 10);

  document.getElementById('modal-name').textContent = card.name;
  document.getElementById('modal-tier').textContent = card.tier;
  document.getElementById('modal-type').textContent = card.type;
  document.getElementById('modal-value').textContent = card.value;
  document.getElementById('modal-img').src = imgSrc;
  
  // 关键词高亮 (根据你的规则文件定制)
  let effectHtml = card.effect;
  const keywords = ['吟唱', '速攻', '禁制', '余烬', '引渡', '运势', '占卜', '共鸣', '反制'];
  keywords.forEach(kw => {
    const regex = new RegExp(kw, 'g');
    effectHtml = effectHtml.replace(regex, `<span style="color:#d4af37;font-weight:bold">${kw}</span>`);
  });
  document.getElementById('modal-effect').innerHTML = effectHtml;
}

// 关闭模态框
document.querySelector('.close-btn').onclick = closeModal;
document.querySelector('.modal-backdrop').onclick = closeModal;
function closeModal() {
  modal.classList.remove('show');
  setTimeout(() => modal.style.display = 'none', 300);
}

// 筛选功能
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // 样式切换
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    
    const type = e.target.dataset.type;
    const searchText = searchInput.value.trim();
    applyFilter(type, searchText);
  });
});

// 搜索功能
searchInput.addEventListener('input', (e) => {
  const type = document.querySelector('.filter-btn.active').dataset.type;
  applyFilter(type, e.target.value.trim());
});

function applyFilter(type, search) {
  const filtered = allCardData.filter(c => {
    const matchType = (type === 'all') || (c.type === type);
    const matchSearch = c.name.includes(search) || c.effect.includes(search);
    return matchType && matchSearch;
  });
  renderCards(filtered);
}

/* ================= 4. 氛围特效 (金粉粒子) ================= */
const canvas = document.getElementById('spirit-dust');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedY = Math.random() * -0.5 - 0.1; // 向上漂浮
    this.speedX = Math.random() * 0.4 - 0.2;
    this.opacity = Math.random() * 0.5;
    this.fade = Math.random() * 0.01 + 0.005;
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.opacity -= this.fade;
    if (this.opacity <= 0 || this.y < 0) this.reset();
  }
  draw() {
    ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`; // 金色
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  resizeCanvas();
  for(let i=0; i<60; i++) particles.push(new Particle());
  animateParticles();
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', resizeCanvas);

/* ================= 5. 英雄背景轮播 ================= */
let heroIndex = 1;
function rotateHeroBg() {
  // 简单的背景切换逻辑，假设有 hero1.jpg 到 hero5.jpg
  const img = new Image();
  const nextIndex = (heroIndex % 5) + 1;
  const url = `${HERO_BG_PATH}${nextIndex}.jpg`;
  
  img.onload = () => {
    heroLayer.style.backgroundImage = `url(${url})`;
    heroIndex = nextIndex;
  };
  // 即使失败也继续尝试下一张（如果你的图片没齐）
  img.onerror = () => { heroIndex = nextIndex; };
  
  img.src = url;
}

/* 初始化执行 */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initGameData(); // 加载 Excel
  
  // 启动背景轮播
  rotateHeroBg();
  setInterval(rotateHeroBg, 8000);
  
  // 页面滚动锚点
  document.getElementById('enter-btn').onclick = () => document.getElementById('gallery').scrollIntoView({behavior:'smooth'});
  document.getElementById('rules-btn').onclick = () => document.getElementById('highlights').scrollIntoView({behavior:'smooth'});
});
