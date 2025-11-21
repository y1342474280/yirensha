/* ========= 异人杀：水墨引擎 & 核心数据 ========= */

const EXCEL_PATH = 'assets/card.xlsx'; 
const CARD_IMG_DIR = 'assets/cards/';
const BGM_ID = 'assets/bgm';

// DOM
const grid = document.getElementById('cards-grid');
const loader = document.getElementById('loading-state');
const loadingText = document.getElementById('loading-text');
const errorActions = document.getElementById('error-actions');
const modal = document.getElementById('modal');
const knowledgeModal = document.getElementById('knowledge-modal');

let allCards = [];
let allHeroes = [];
let ruleBasic = [];
let ruleTerms = [];

/* 1. 音乐控制 */
function initMusic() {
  const bgm = document.getElementById(BGM_ID);
  const toggleBtn = document.getElementById('music-toggle');
  let isPlaying = false;
  function play() { bgm.play().then(() => { isPlaying = true; toggleBtn.classList.add('playing'); }).catch(e => {}); }
  function pause() { bgm.pause(); isPlaying = false; toggleBtn.classList.remove('playing'); }
  toggleBtn.onclick = () => { if (isPlaying) pause(); else play(); };
  document.getElementById('enter-btn').onclick = () => { 
    document.getElementById('gallery-section').scrollIntoView({behavior:'smooth'}); 
    if (!isPlaying) play(); 
  };
}

/* 2. 数据加载 (Excel + 内置兜底) */
async function initData() {
  try {
    const response = await fetch(EXCEL_PATH);
    if (!response.ok) throw new Error("未检测到本地Excel文件");
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // A. 读取卡牌
    let cardSheet = workbook.SheetNames.find(n => n.includes('游戏卡牌')) || workbook.SheetNames[0];
    const cardRaw = XLSX.utils.sheet_to_json(workbook.Sheets[cardSheet]);
    allCards = cardRaw.map(row => ({
      name: row['卡牌名称'] || row['name'] || '未知',
      value: row['数值'] || row['value'] || '-',
      type: row['类型'] || row['type'] || '法术',
      tier: row['阶数'] || row['tier'] || '一阶',
      effect: row['效果'] || row['effect'] || '',
      image: `${CARD_IMG_DIR}${row['名称']}.png`
    }));

    // B. 读取英雄 (精准匹配你的CSV格式)
    let heroSheet = workbook.SheetNames.find(n => n.includes('英雄牌'));
    if (heroSheet) {
      const heroRaw = XLSX.utils.sheet_to_json(workbook.Sheets[heroSheet]);
      allHeroes = heroRaw.map(row => ({
        name: row['奇人名称'] || row['名称'] || '无名',
        title: row['称号'] || '',
        stats: row['攻/血'] || '0/30',
        diff: row['难度'] || '⭐',
        tags: row['标签'] || '',
        skill: row['技能'] || '',
        comment: row['说人话点评'] || ''
      }));
    }

    // C. 读取规则 (分表)
    let ruleBasicSheet = workbook.SheetNames.find(n => n.includes('游戏规则'));
    if (ruleBasicSheet) {
      // 你的规则表可能是大段文本，这里做简单处理
      const raw = XLSX.utils.sheet_to_json(workbook.Sheets[ruleBasicSheet]);
      ruleBasic = raw.map(r => ({ title: r['标题']||'规则', content: r['内容']||JSON.stringify(r) }));
    }

    // 渲染
    renderAll();
    loader.style.display = 'none';

  } catch (err) {
    console.warn("Excel读取失败，显示加载按钮:", err);
    loadingText.innerHTML = `天机隐匿 (${err.message})<br>请点击下方按钮加载内置数据`;
    loadingText.style.color = '#a83636';
    errorActions.style.display = 'block';
    
    // 如果你想自动加载内置数据，把下面这行注释取消：
    // loadBuiltInData();
  }
}

/* 3. 内置数据 (根据你提供的文本 Hardcode，确保绝对可用) */
window.loadBuiltInData = function() {
  console.log("加载内置天道真言...");
  
  // === 英雄数据 ===
  allHeroes = [
    { name: "祖冲之", title: "缀术追圆", stats: "2/40", diff: "⭐⭐⭐⭐⭐", tags: "控制、OTK", skill: "九玄：游戏开始时将牌顶四张卡牌加入到牌河。每回合开始可以将一张手牌与牌河中的牌交换。\n精算:使用牌后，可以公开手牌，若其中某一种类型的牌数与牌河相同，引渡一张该类型卡牌并恢复1点灵能。", comment: "设计思路很简单，九玄精简牌堆，精算拿组件，控制好出牌节奏快速集齐OTK组件。缺点是没有回合外防御能力，精算进一步削减自己的防御力。" },
    { name: "晏婴", title: "二桃杀士", stats: "2/40", diff: "⭐⭐⭐⭐", tags: "卖血、全能", skill: "怀柔：回合开始和受到≥8的伤害时，可以将一张手牌加入到对方手牌。直到自己回合结束，摸牌数+n，灵能上限+n。\n罪资：对方获得你的牌后，根据阶数触发效果：1阶回血，2阶增伤，3阶无视限制。", comment: "起始武将唯一的卖血流，毫不吝啬的抛弃防御牌多拿回血牌和高收益的高阶卡就行。对付他尽量将伤害控制在8以下" },
    { name: "萧何", title: "开国定鼎", stats: "2/40", diff: "⭐⭐", tags: "资源，节奏", skill: "攀龙：摸牌阶段多摸一张牌，摸牌结束后可以弃置一张非状态牌，本回合造成伤害提升50%。\n文心：一回合内造成或受到的伤害≥18时，固定至18。文心触发后恢复1点灵能", comment: "朴实无华的过牌和增伤兼备，但灵活性稍受局限。注意文心的负面效果。新手推荐" },
    { name: "柳如是", title: "秦淮孤影", stats: "2/40", diff: "⭐⭐⭐⭐", tags: "资源、中期", skill: "浮萍：转换技。阳：使用法术摸牌。阴：使用状态弃牌回灵能。\n托举：回合结束，摸取本回合弃置的装备数的卡牌。", comment: "最需要保持法术、状态、装备均衡的人物，推荐1：1：1.依靠法术牌和状态牌不断运转浮萍。" },
    { name: "谢道韫", title: "林下风致", stats: "2/40", diff: "⭐⭐⭐⭐⭐", tags: "控制、反制", skill: "采音：出牌阶段开始时，可观看牌堆底三张牌并用手牌替换。结束阶段可用手牌替换牌底并回灵能。\n妙弦：使用手牌时公开，若只有一张，根据类型触发强力效果。", comment: "由于采音的存在，牌底就是你的第二手牌。回合内尽量打完所有手牌，保持手牌区法术、装备、状态均只有1张最大化收益。" },
    { name: "项羽", title: "破釜成舟", stats: "2/40", diff: "⭐", tags: "爆发", skill: "战绝：出牌阶段开始时，弃置一类手牌回灵能，强化其他两类。\n背水：限定技。破坏自己所有装备牌，摸取数量翻倍的卡牌。", comment: "绝境之下拥有把装备都转化为资源的爆发能力，推荐新手。" },
    { name: "李世民", title: "贞观之治", stats: "2/40", diff: "⭐⭐⭐", tags: "资源，控制", skill: "控局：手牌满时卡牌无法破坏；手牌少时使用可减上限摸牌；手牌多时可弃牌重置上限。\n绵绵：回合外连锁1回灵能，连锁2摸牌。", comment: "技能围绕手牌管理，适合喜欢策略的玩家。" },
    { name: "李淳风", title: "推背归藏", stats: "2/35", diff: "⭐⭐⭐⭐", tags: "控制，节奏", skill: "观星：回合开始占卜2。\n司天：对方回合开始占卜2。对方使用法术时，可无消耗使用牌底卡牌响应。", comment: "擅长节奏控制，但依赖牌堆底的管理，需要预判对手行动。难度较高。" },
    { name: "红拂女", title: "风尘三侠", stats: "2/35", diff: "⭐⭐", tags: "爆发，快攻", skill: "巧慧：首次升阶额外升一次。全三阶时抽3张。\n心灯：一回合一次，回灵能，指定一种类跌2阶，其他升1阶并无视禁制。", comment: "适合快攻策略，但永久跌落等阶需要谨慎选择。" },
    { name: "杨修", title: "傲物放旷", stats: "2/30", diff: "⭐⭐⭐", tags: "控制", skill: "恃才：回合结束将使用过的牌放回牌顶，抽等量牌。\n狡黠：抽牌改为从牌底抽。恃才后回灵能，自降阶，敌降阶。", comment: "能干扰对手的抽牌并降低其等阶，但自身也会永久下降等阶。" },
    { name: "白起", title: "武安杀神", stats: "3/40", diff: "⭐", tags: "快攻，卖血", skill: "活祭：支付生命回灵能抽牌。\n浴血：每损5血+1攻。每损10血+1法伤。", comment: "适合激进玩法，保持低生命以触发浴血效果，但风险高。" },
    { name: "鲁班", title: "梓材哲匠", stats: "1/40", diff: "⭐⭐⭐", tags: "装备、墓地", skill: "机巧:初始宝具栏+1。装备可当速攻法术打出。\n开物：除外墓地装备强化状态或法术。", comment: "需要大量装备支持，续航能力强，但启动较慢。" },
    { name: "齐静春", title: "文脉薪传", stats: "0/40", diff: "⭐⭐⭐⭐", tags: "复制，全能", skill: "文运：开局给牌底【文】。对手可弃牌获【文】。\n春风/传道/合真：围绕【文】的流转，获得对手技能或回收资源。", comment: "策略复杂，适合高级玩家。" }
  ];

  // === 规则数据 (基础) ===
  ruleBasic = [
    { title: "一、游戏准备", content: "1. 选择英雄：1名，独特技能。\n2. 构建卡组：30张主卡组(同名≤2,传说≤1)，5张牌河(随时查看)。" },
    { title: "二、开始流程", content: "1. 触发“开始时”效果，双方升阶一次。\n2. 掷骰定先手，后手第3回合额外升阶。\n3. 抽4张起始手牌，可调度2张。" },
    { title: "三、回合流程", content: "1. 准备：抽1张，选一类卡牌等阶+1。\n2. 行动：打出法术/状态(耗灵能)，装备，普攻(1次)，发动技能。\n3. 弃牌：弃至手牌上限(默认6)。\n4. 结束：结算状态卡。" },
    { title: "四、胜利条件", content: "1. 对方英雄生命 ≤ 0。\n2. 特殊胜利。\n3. 牌库耗尽(抽牌改为对方抽)，双方皆空先空者负。" }
  ];

  // === 规则数据 (词条) ===
  ruleTerms = [
    { title: "基本术语", content: "【灵能】限制玩家使用卡牌频次的手段。每次使用卡牌需要消耗一点灵能。每回合灵能上限2，会在自己回合开始时回满。\n【阶数】限制强力卡牌的手段。每种类型卡牌可用的等阶会随着对局的进行而逐渐提升；无法使用高于自身可使用等级的卡牌、效果； 己方每回合开始时选择一种卡牌类型升级一次等阶； 后手第3回合，会获得一次额外升级的机会。示例：当前等阶为法术/装备/状态：2/2/1，只能使用2阶的装备和法术，一阶的状态，则下次升阶只能升级成2/2/2，不能是3/2/1。\n【牌河】玩家自定义的额外卡组，上限5张，可随时查看但不可改变顺序（初始顺序可自定义）。每次自动升阶时，可以放弃升阶改为从牌河抽取一张卡牌。" },
    { title: "卡牌类型", content: "【状态】只能自己回合用，持续生效，结算后发先至。\n【法术】吟唱(己方回合,不可连锁)、速攻(对方回合,不可连锁反制)、反制(对方回合,任意连锁)。\n【装备】武器(耐久度)、宝具(全局属性)。" },
    { title: "特殊词条", content: "【禁制】此卡需要满足额外的条件才能使用。\n【引渡：x】查看牌河，将x张卡加入手卡。\n【占卜：x】查看牌堆顶部x张牌，任意改变他们的顺序，也可以放置在牌底。。\n【运势：x】投掷一次骰子，若点数大于等于x，则执行额外效果。\n【余烬】在墓地的场合获得额外效果。\n【连击】此前用过卡牌则触发。\n【瞬发】拥有此字段的卡牌每回合第一张不消耗灵能。\n【压轴】拥有此字段的卡牌在自己没有灵能的场合使用不消耗灵能。每回合限一次\n【贯通】造成的伤害无视免疫、减免、护甲效果。\n【和鸣】当此卡在牌河时，激活新的效果。" }
  ];

  // === 演示卡牌 (只有少量，因为太多了写不下，主要看英雄和规则) ===
  allCards = [
    { name: "妙手空空", type: "法术", tier: "一阶", effect: "吟唱。对手洗牌，自己从中摸一张卡牌加入自己手卡。" },
    { name: "星陨", type: "法术", tier: "一阶", effect: "吟唱。对对方造成6伤害。" },
    { name: "月下美人", type: "武器", tier: "三阶", value: "4/3", effect: "新月回血，满月伤倍。" }
  ];

  renderAll();
  loader.style.display = 'none';
  errorActions.style.display = 'none';
};

/* 4. 渲染总控 */
function renderAll() {
  renderCards(allCards);
  renderHeroes(allHeroes);
  renderRules(ruleBasic, 'rule-basic-list');
  renderRules(ruleTerms, 'rule-term-list');
}

/* 5. 渲染细节实现 */
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

function renderHeroes(data) {
  const container = document.getElementById('hero-list');
  container.innerHTML = '';
  data.forEach(hero => {
    const div = document.createElement('div');
    div.className = 'hero-card';
    div.innerHTML = `
      <div class="hero-header-row">
        <div class="hero-base">
          <div class="hero-title">【${hero.title}】</div>
          <div class="hero-name">${hero.name}</div>
          <div class="hero-tags">
            ${hero.tags.split(/、|，|,/).map(t => `<span class="h-tag">${t}</span>`).join('')}
          </div>
        </div>
        <div class="hero-stat-block">
          <div class="hero-stat">${hero.stats}</div>
          <div class="hero-stat-label">攻/血</div>
          <div class="hero-diff">${hero.diff}</div>
        </div>
      </div>
      <div class="hero-skill-box">
        ${hero.skill.split('\n').map(s => `<div class="hero-skill-item">${s}</div>`).join('')}
      </div>
      ${hero.comment ? `<div class="hero-comment"><span class="comment-label">评:</span>${hero.comment}</div>` : ''}
    `;
    container.appendChild(div);
  });
}

function renderRules(data, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  data.forEach(rule => {
    const div = document.createElement('div');
    div.className = 'rule-block';
    div.innerHTML = `
      <div class="rule-title">${rule.title}</div>
      <div class="rule-body">${rule.content}</div>
    `;
    container.appendChild(div);
  });
}

/* 6. 交互逻辑 */
const knowledgeBtn = document.getElementById('knowledge-btn');
const closeKnowledge = document.getElementById('close-knowledge');
const tabs = document.querySelectorAll('.book-tab');
const pages = document.querySelectorAll('.page-content');

knowledgeBtn.onclick = () => knowledgeModal.style.display = 'flex';
closeKnowledge.onclick = () => knowledgeModal.style.display = 'none';

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

function openModal(card) {
  modal.style.display = 'flex';
  document.getElementById('m-img').src = card.image;
  document.getElementById('m-name').textContent = card.name;
  document.getElementById('m-tier').textContent = card.tier;
  document.getElementById('m-type').textContent = card.type;
  document.getElementById('m-val').textContent = card.value;
  
  let html = card.effect || '';
  ['吟唱','速攻','禁制','余烬','引渡','运势','占卜'].forEach(kw => {
    html = html.replace(new RegExp(kw,'g'), `<span class="kw">${kw}</span>`);
  });
  document.getElementById('m-effect').innerHTML = html;
}
document.querySelector('.close-modal').onclick = () => modal.style.display = 'none';

/* 7. 启动 */
(function initInkTrail() {
  const canvas = document.getElementById('ink-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, trails = [];
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  window.addEventListener('mousemove', e => { trails.push({ x: e.clientX, y: e.clientY, size: Math.random()*20+10, life: 1 }); });
  function animate() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < trails.length; i++) {
      const p = trails[i];
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${p.life * 0.1})`; ctx.fill();
      p.life -= 0.02; p.size += 0.2; if (p.life <= 0) { trails.splice(i, 1); i--; }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

document.addEventListener('DOMContentLoaded', () => {
  initData();
  initMusic();
  // 筛选器
  document.querySelectorAll('.filter-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.type;
      const q = document.getElementById('search').value;
      const filtered = allCards.filter(c => (type === 'all' || c.type === type) && (c.name.includes(q) || c.effect.includes(q)));
      renderCards(filtered);
    });
  });
  document.getElementById('search').addEventListener('input', e => document.querySelector('.filter-item.active').click());
});
