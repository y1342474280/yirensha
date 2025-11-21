/* ========= 异人杀：水墨引擎 & 核心数据 ========= */

const EXCEL_PATH = 'assets/card.xlsx'; 
const CARD_IMG_DIR = 'assets/cards/';
// -- 【修改点 1-1】将 BGM_ID 修改为 HTML 中 <audio> 元素的实际 ID --
const BGM_ELEMENT_ID = 'bgm'; 

// DOM 元素保持不变
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
    // -- 【修改点 1-2】使用正确的元素 ID 来获取 <audio> 元素 --
    const bgm = document.getElementById(BGM_ELEMENT_ID); 
    const toggleBtn = document.getElementById('music-toggle');
    let isPlaying = false;
    
    // 【重要修复】如果你的 HTML <source src="bgm.mp3"> 路径不对，这里修正
    // 假设正确的路径是 assets/bgm.mp3，如果你的 HTML <source> 标签没有成功加载，手动设置 src
    // ⚠️ 如果你确认你的音频文件就在项目根目录，请注释掉下面这行
    // if (bgm && bgm.currentSrc.indexOf('bgm.mp3') === -1) {
    //     bgm.src = 'assets/bgm.mp3';
    //     bgm.load(); // 重新加载音频
    // }

    function play() { 
        if (bgm) {
            // 浏览器现在通常需要用户交互后才能播放
            bgm.play().then(() => { 
                isPlaying = true; 
                if (toggleBtn) toggleBtn.classList.add('playing'); 
            }).catch(e => {
                console.warn("BGM 播放失败，可能需要用户交互:", e);
            }); 
        }
    }
    function pause() { 
        if (bgm) bgm.pause(); 
        isPlaying = false; 
        if (toggleBtn) toggleBtn.classList.remove('playing'); 
    }
    
    // 音乐开关按钮绑定
    if (toggleBtn) {
        toggleBtn.onclick = () => { if (isPlaying) pause(); else play(); };
    }
    
    // “入局”按钮点击后播放音乐
    const enterBtn = document.getElementById('enter-btn');
    if (enterBtn) {
        enterBtn.onclick = () => {  
            const gallerySection = document.getElementById('gallery-section');
            if (gallerySection) {
                gallerySection.scrollIntoView({behavior:'smooth'}); 
            }
            if (!isPlaying) play(); 
        };
    }
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
            type: row['分类'] || row['type'] || '法术', // 注意这里读取的是 '分类'
            tier: row['等阶'] || row['tier'] || '一阶',
            effect: row['效果'] || row['effect'] || '',
            image: `${CARD_IMG_DIR}${row['卡牌名称']}.png`
        }));

        // B. 读取英雄
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

        // C. 读取规则 (基础)
        let ruleBasicSheet = workbook.SheetNames.find(n => n.includes('游戏规则'));
        if (ruleBasicSheet) {
            const raw = XLSX.utils.sheet_to_json(workbook.Sheets[ruleBasicSheet]);
            // 假设规则表是标题和内容两列
            ruleBasic = raw.map(r => ({ title: r['标题']||r['一、游戏准备阶段']||'规则', content: r['内容']||JSON.stringify(r) }));
        }
        
        // D. 读取词条 (词条表)
        let ruleTermsSheet = workbook.SheetNames.find(n => n.includes('基本词条与规则'));
        if (ruleTermsSheet) {
            const raw = XLSX.utils.sheet_to_json(workbook.Sheets[ruleTermsSheet]);
            // 假设词条表是 '词条' 和 '解释' 两列
            ruleTerms = raw.map(r => ({ title: r['词条'] || r['游戏术语词条'] || '词条', content: r['解释'] || JSON.stringify(r) }));
            // 过滤掉第一行无用的标题行
            ruleTerms = ruleTerms.filter(t => t.title !== '词条');
        }

        // 渲染
        renderAll();
        loader.style.display = 'none';

    } catch (err) {
        console.warn("Excel读取失败，显示加载按钮:", err);
        loadingText.innerHTML = `天机隐匿 (${err.message})<br>请点击下方按钮加载内置数据`;
        loadingText.style.color = '#a83636';
        errorActions.style.display = 'block';
    }
}

/* 3. 内置数据 (美化后的演示数据) */
window.loadBuiltInData = function() {
    console.log("加载内置天道真言...");
    
    // === 英雄数据 (保持不变) ===
    allHeroes = [
        { name: "祖冲之", title: "缀术追圆", stats: "2/40", diff: "⭐⭐⭐⭐⭐", tags: "控制、OTK", skill: "九玄：游戏开始时将牌顶四张卡牌加入到牌河。每回合开始可以将一张手牌与牌河中的牌交换。\n精算:使用牌后，可以公开手牌，若其中某一种类型的牌数与牌河相同，引渡一张该类型卡牌并恢复1点灵能。", comment: "设计思路很简单，九玄精简牌堆，精算拿组件，控制好出牌节奏快速集齐OTK组件。缺点是没有回合外防御能力。" },
        { name: "晏婴", title: "二桃杀士", stats: "2/40", diff: "⭐⭐⭐⭐", tags: "卖血、全能", skill: "怀柔：回合开始和受到≥8的伤害时，可以将一张手牌加入到对方手牌。直到自己回合结束，摸牌数+n，灵能上限+n。\n罪资：对方获得你的牌后，根据阶数触发效果：1阶回血，2阶增伤，3阶无视限制。", comment: "起始武将唯一的卖血流，毫不吝啬的抛弃防御牌多拿回血牌和高收益的高阶卡就行。对付他尽量将伤害控制在8以下" },
        // ... (省略其他英雄以保持代码简洁，实际代码中应包含所有英雄)
    ];

    // === 【修改点 3-1】规则数据 (基础) - 精简与结构化 ===
    ruleBasic = [
        { title: "一、游戏准备阶段", content: "1. **选择英雄**：每位玩家选1名英雄，确定初始攻/血。\n2. **构建卡组**：\n - **牌堆**：30张牌（同名≤2，传说≤1）。\n - **牌河**：上限5张（额外卡组，随时可查看）。" },
        { title: "二、游戏开始流程", content: "1. 触发**“开始时”**效果，双方升阶一次。\n2. **决定先手**：掷骰定先手，后手玩家在第3回合额外升阶一次。\n3. **初始抽牌**：抽4张起始手牌。\n4. **调度阶段**：可将至多2张手牌置于牌底并重新抽取。" },
        { title: "三、回合结构", content: "回合制，由先手玩家开始，分为四个阶段：\n\n**阶段一：回合开始阶段**\n- **抽牌**：从牌堆顶抽1张。\n- **等阶提升**：从法术、装备、状态中选择**1类**，等阶+1。\n\n**阶段二：主行动阶段**\n- 打出法术卡、状态卡（耗灵能）。\n- 装备装备卡。\n- 发动普通攻击（每回合限1次）。\n\n**阶段三：弃牌阶段**\n- 弃至手牌上限（默认6）。\n\n**阶段四：回合结束阶段**\n- 结算状态卡、技能等效果。" },
        { title: "四、胜利条件", content: "1. 对方英雄生命 ≤ 0。\n2. 特殊胜利条件（如卡牌效果）。\n3. 牌库耗尽（抽牌时牌库空了，抽牌改为对方抽，双方皆空时先空者负）。" }
    ];

    // === 【修改点 3-2】规则数据 (词条) - 美化与合并，解决重复 ===
    // 采用更简洁的“词条: 解释”格式，利用 CSS 突出显示
    ruleTerms = [
        { title: "灵能", content: "限制使用卡牌的资源。每回合上限2点，自己回合开始时回满。使用卡牌通常消耗1点。" },
        { title: "等阶", content: "限制强力卡牌的手段。法术/装备/状态等阶独立计算，无法使用高于自身当前等阶的卡牌。" },
        { title: "牌河", content: "玩家的额外卡组，上限5张，可随时查看。**引渡**效果从牌河中抽取卡牌。" },
        { title: "状态", content: "只能在自己回合发动。持续生效，有持续回合数（每次回合结束计数-1）。" },
        { title: "法术分类", content: "**【吟唱】**：只能在自己回合发动，不可连锁。\n**【速攻】**：可在对方回合发动。\n**【反制】**：可在对方回合发动，能连锁任意法术。" },
        { title: "装备分类", content: "**【武器】**：有耐久度，每次攻击减一。\n**【宝具】**：影响全局属性，宝具槽满时获得【辎重】。" },
        { title: "特殊词条", content: "**【禁制】**：此卡需满足额外条件才能使用。\n**【引渡：x】**：从牌河抽取 x 张卡加入手卡，取代升阶。\n**【占卜：x】**：查看牌堆顶部 x 张牌，可调整顺序或放牌底。\n**【运势：x】**：投掷骰子，点数≥x则触发额外效果。\n**【余烬】**：在墓地的场合获得额外效果。\n**【连击】**：此前使用过卡牌则触发。\n**【瞬发】**：每回合第一张不消耗灵能。\n**【压轴】**：自己没有灵能时使用不消耗灵能（每回合限一次）。\n**【贯通】**：造成的伤害无视免疫、减免、护甲效果。" }
    ];

    // === 演示卡牌 ===
    allCards = [
        { name: "妙手空空", value: "-", type: "法术", tier: "一阶", effect: "吟唱。对手洗牌，自己从中摸一张卡牌加入自己手卡。", image: `${CARD_IMG_DIR}妙手空空.png` },
        { name: "星陨", value: "-", type: "法术", tier: "一阶", effect: "吟唱。对对方造成6伤害。", image: `${CARD_IMG_DIR}星陨.png` },
        { name: "月下美人", value: "4/3", type: "武器", tier: "三阶", effect: "新月回血，满月伤倍。", image: `${CARD_IMG_DIR}月下美人.png` }
    ];

    renderAll();
    loader.style.display = 'none';
    errorActions.style.display = 'none';
};

/* 4. 渲染总控 */
function renderAll() {
    renderCards(allCards);
    renderHeroes(allHeroes);
    // 【修改点 4-1】确保渲染时 ID 正确对应 HTML 中的容器
    renderRules(ruleBasic, 'rule-basic-list');
    renderRules(ruleTerms, 'rule-term-list'); // 渲染万物词条
}

/* 5. 渲染细节实现 */
function renderCards(data) {
    grid.innerHTML = '';
    data.forEach(card => {
        const el = document.createElement('div');
        el.className = 'card-item';
        // 渲染时使用 CARD_IMG_DIR，而不是硬编码的占位符
        el.innerHTML = `
            <img class="card-img" src="${card.image}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x400?text=${card.name}'">
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
        // 英雄技能的换行处理
        const skillsHtml = hero.skill.split('\n').map(s => {
            const parts = s.split(':');
            if (parts.length > 1) {
                return `<div class="hero-skill-item"><span class="skill-label">${parts[0]}:</span> ${parts.slice(1).join(':')}</div>`;
            }
            return `<div class="hero-skill-item">${s}</div>`;
        }).join('');
        
        div.innerHTML = `
            <div class="hero-header-row">
                <div class="hero-base">
                    <div class="hero-title">【${hero.title}】</div>
                    <div class="hero-name">${hero.name}</div>
                    <div class="hero-tags">
                        ${hero.tags.split(/、|，|,/).filter(t => t.trim()).map(t => `<span class="h-tag">${t}</span>`).join('')}
                    </div>
                </div>
                <div class="hero-stat-block">
                    <div class="hero-stat">${hero.stats}</div>
                    <div class="hero-stat-label">攻/血</div>
                    <div class="hero-diff">${hero.diff}</div>
                </div>
            </div>
            <div class="hero-skill-box">${skillsHtml}</div>
            ${hero.comment ? `<div class="hero-comment"><span class="comment-label">评:</span>${hero.comment}</div>` : ''}
        `;
        container.appendChild(div);
    });
}

// 【修改点 5-1】渲染规则函数：使用 <br> 标签而不是 <p> 来保持内容在 rule-body 内
function renderRules(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    data.forEach(rule => {
        const div = document.createElement('div');
        div.className = 'rule-block';
        
        // 将内容中的换行符 \n 替换为 <br> 以便在 HTML 中显示换行
        const contentHtml = rule.content.replace(/\n/g, '<br>');
        
        div.innerHTML = `
            <div class="rule-title">${rule.title}</div>
            <div class="rule-body">${contentHtml}</div>
        `;
        container.appendChild(div);
    });
}

/* 6. 交互逻辑 */
const knowledgeBtn = document.getElementById('knowledge-btn');
const closeKnowledge = document.getElementById('close-knowledge');
// 【注意】使用 querySelectorAll 获取 DOM 元素时，请确保 HTML 中有对应的 class 或 id
const tabs = document.querySelectorAll('.book-tab');
const pages = document.querySelectorAll('.page-content');

// 知识库模态框的显示/关闭
if (knowledgeBtn) knowledgeBtn.onclick = () => knowledgeModal.style.display = 'flex';
if (closeKnowledge) closeKnowledge.onclick = () => knowledgeModal.style.display = 'none';

// Tab 切换逻辑
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        pages.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        // 根据 data-tab 属性来激活对应的 page-content
        const targetId = 'tab-' + tab.dataset.tab;
        const targetPage = document.getElementById(targetId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    });
});

function openModal(card) {
    modal.style.display = 'flex';
    document.getElementById('m-img').src = card.image;
    document.getElementById('m-name').textContent = card.name;
    document.getElementById('m-tier').textContent = card.tier;
    document.getElementById('m-type').textContent = card.type;
    document.getElementById('m-val').textContent = card.value;
    
    // 关键字高亮处理
    let html = card.effect || '';
    ['吟唱','速攻','禁制','余烬','引渡','运势','占卜', '连击', '瞬发', '压轴', '贯通', '和鸣', '武器', '宝具', '状态'].forEach(kw => {
        // 使用正则替换，加上 class="kw" (假设你的CSS有此样式)
        html = html.replace(new RegExp(kw,'g'), `<span class="kw">${kw}</span>`); 
    });
    document.getElementById('m-effect').innerHTML = html;
}
document.querySelector('.close-modal').onclick = () => modal.style.display = 'none';

/* 7. 启动（水墨效果和数据加载） */
(function initInkTrail() {
    const canvas = document.getElementById('ink-canvas');
    if (!canvas) return; // 安全检查
    const ctx = canvas.getContext('2d');
    let w, h, trails = [];
    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();
    window.addEventListener('mousemove', e => { 
        // 只在主页区域生成，避免在模态框上生成
        if (knowledgeModal.style.display !== 'flex' && modal.style.display !== 'flex') {
            trails.push({ x: e.clientX, y: e.clientY, size: Math.random()*20+10, life: 1 }); 
        }
    });
    function animate() {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < trails.length; i++) {
            const p = trails[i];
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${p.life * 0.1})`; ctx.fill();
            p.life -= 0.02; p.size += 0.2; 
            if (p.life <= 0) { 
                trails.splice(i, 1); 
                i--; 
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
})();

document.addEventListener('DOMContentLoaded', () => {
    initData();
    initMusic();
    
    // 筛选器和搜索逻辑
    const searchInput = document.getElementById('search');
    
    const applyFilterAndSearch = () => {
        const activeBtn = document.querySelector('.filter-item.active');
        if (!activeBtn) return;
        
        const type = activeBtn.dataset.type;
        const q = searchInput.value.toLowerCase();
        
        const filtered = allCards.filter(c => 
            (type === 'all' || c.type === type) && 
            (c.name.includes(q) || c.effect.includes(q))
        );
        renderCards(filtered);
    };

    document.querySelectorAll('.filter-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilterAndSearch();
        });
    });
    
    if (searchInput) {
        // 搜索框输入事件触发筛选
        searchInput.addEventListener('input', applyFilterAndSearch);
    }
});
