/* ========= 异人杀：水墨引擎 ========= */

const EXCEL_PATH = './assets/card.xlsx'; // 确保这个文件在根目录
const CARD_IMG_DIR = './assets/cards/';

// DOM 元素
const grid = document.getElementById('cards-grid');
const loader = document.getElementById('loading-state');
const loadingText = document.getElementById('loading-text');
const errorArea = document.getElementById('error-actions');
const modal = document.getElementById('modal');

let allCards = [];

/* 1. 初始化：水墨鼠标轨迹 */
(function initInkTrail() {
  const canvas = document.getElementById('ink-canvas');
  const ctx = canvas.getContext('2d');
  let w, h;
  let trails = [];

  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  // 鼠标移动生成墨点
  window.addEventListener('mousemove', e => {
    trails.push({ x: e.clientX, y: e.clientY, size: Math.random()*20 + 10, life: 1 });
  });

  function animate() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < trails.length; i++) {
      const p = trails[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${p.life * 0.1})`; // 淡墨
      ctx.fill();
      p.life -= 0.02; // 慢慢消失
      p.size += 0.2;  // 慢慢扩散
      if (p.life <= 0) { trails.splice(i, 1); i--; }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

/* 2. 核心：加载数据 */
async function initData() {
  try {
    console.log("正在尝试读取 Excel...");
    
    // 1. 尝试 Fetch
    const response = await fetch(EXCEL_PATH);
    
    // === 关键排查点：如果是 404，说明文件路径不对 ===
    if (response.status === 404) throw new Error(`找不到文件 (404)。请确认 card.xlsx 是否在根目录。`);
    
    // === 关键排查点：如果是 index.html 内容，说明服务器配置错误 ===
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) throw new Error("路径返回了HTML而非文件，请检查服务器配置。");

    if (!response.ok) throw new Error(`网络错误: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // 找到正确的 Sheet
    let sheetName = workbook.SheetNames.find(n => n.includes('游戏卡牌')) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    // 映射数据
    allCards = rawData.map(row => ({
      name: row['卡牌名称'] || row['name'] || '未知',
      value: row['数值'] || row['value'] || '-',
      type: row['类型'] || row['type'] || '法术',
      tier: row['阶数'] || row['tier'] || '一阶',
      effect: row['效果'] || row['effect'] || '',
      image: `${CARD_IMG_DIR}${row['卡牌名称']}.png`
    }));

    renderCards(allCards);
    loader.style.display = 'none';

  } catch (err) {
    console.error("加载失败详情:", err);
    loadingText.innerHTML = `召唤失败：${err.message}`;
    loadingText.style.color = '#a83636';
    // 显示手动加载按钮
    errorArea.style.display = 'block';
  }
}

/* 3. 渲染逻辑 */
function renderCards(data) {
  grid.innerHTML = '';
  data.forEach(card => {
    const el = document.createElement('div');
    el.className = 'card-item';
    el.innerHTML = `
      <img class="card-img" src="${card.image}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x400?text=Card'">
      <div class="card-name">${card.name}</div>
    `;
    el.onclick = () => openModal(card);
    grid.appendChild(el);
  });
}

/* 4. 详情弹窗 */
function openModal(card) {
  modal.style.display = 'flex';
  document.getElementById('m-img').src = card.image;
  document.getElementById('m-img').onerror = function(){this.src='https://via.placeholder.com/300x400?text=Card'};
  document.getElementById('m-name').textContent = card.name;
  document.getElementById('m-tier').textContent = card.tier;
  document.getElementById('m-type').textContent = card.type;
  document.getElementById('m-val').textContent = card.value;
  
  // 关键词高亮
  let html = card.effect || '';
  ['吟唱','速攻','禁制','余烬','引渡','运势','占卜'].forEach(kw => {
    html = html.replace(new RegExp(kw,'g'), `<span class="kw">${kw}</span>`);
  });
  document.getElementById('m-effect').innerHTML = html;
}

document.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
window.onclick = e => { if(e.target === modal) modal.style.display = 'none'; };

/* 5. 筛选 */
document.querySelectorAll('.filter-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const type = btn.dataset.type;
    const q = document.getElementById('search').value;
    
    const filtered = allCards.filter(c => 
      (type === 'all' || c.type === type) && 
      (c.name.includes(q) || c.effect.includes(q))
    );
    renderCards(filtered);
  });
});

document.getElementById('search').addEventListener('input', e => {
  document.querySelector('.filter-item.active').click(); // 触发筛选
});

/* 6. 备用方案：加载演示数据 */
window.loadDemoData = function() {
  allCards = [
    { name: "妙手空空", type: "法术", tier: "一阶", value: "-", effect: "吟唱。对手洗牌，自己从中摸一张卡牌加入自己手卡。" },
    { name: "月下美人", type: "武器", tier: "三阶", value: "4/3", effect: "装备后开启月相切換。新月：回复生命。满月：伤害翻倍。" },
    { name: "星陨", type: "法术", tier: "一阶", value: "-", effect: "吟唱。对对方造成6伤害。" }
  ];
  renderCards(allCards);
  loader.style.display = 'none';
  alert("已加载演示数据（仅供预览）。请查看控制台修复 Excel 读取问题。");
};

// 启动
document.addEventListener('DOMContentLoaded', initData);
