// 卡牌数据（从你提供的 CSV 表格中提取）
const cardData = [
  { name: "妙手空空", value: "", type: "法术", tier: "一阶", effect: "吟唱。禁制：对方手牌>2才能发动。对手洗牌，自己从中摸一张卡牌加入自己手卡。自己没有手牌的场合，额外摸一张。" },
  { name: "偷梁换柱", value: "", type: "法术", tier: "二阶", effect: "吟唱。选择对手两张手牌和自己一张手牌进行交换。" },
  { name: "破魔封禁", value: "3", type: "状态", tier: "二阶", effect: "选定对手2张卡牌暂时移除游戏。" },
  { name: "百辟刀", value: "3/2", type: "武器", tier: "二阶", effect: "攻击后破坏自己状态区所有卡牌。" },
  { name: "月下美人", value: "4/3", type: "武器", tier: "三阶", effect: "装备后开启月相切換。新月：攻击后回复4点生命。弦月：抽牌结束时若手牌<3，则额外摸一张；若手牌>4，则丢弃一张卡牌。满月：本次攻击伤害翻倍。" },
  { name: "痛觉残留", value: "", type: "法术", tier: "二阶", effect: "吟唱.对对方造成3+对方上回合受到的伤害一半的伤害" },
  { name: "踏雪寻梅·宿穷冬", value: "", type: "法术", tier: "二阶", effect: "引渡：1，然后从场上将一张同类型卡牌返回拥有者卡组。没有同类型的场合将一张自己的手卡送去墓地。" },
  { name: "紧急支援", value: "", type: "法术", tier: "二阶", effect: "引渡：2，回合结束时它们从手牌返回牌河。" },
  { name: "妙品莲花", value: "", type: "状态", tier: "三阶", effect: "禁制：只能对对方发动。无法造成伤害，回合结束时恢复5点生命值。" },
  { name: "星陨", value: "", type: "法术", tier: "一阶", effect: "吟唱。对对方造成6伤害。" },
  { name: "星尘祈愿", value: "", type: "法术", tier: "二阶", effect: "吟唱。将一张星陨从牌堆/墓地加入手卡。共鸣：星陨发动时，将此卡从牌河除外，星陨造成的伤害永久增加4，这个效果一局一次。余烬：此卡从墓地除外，将星陨从墓地返回卡组，抽一张牌。" },
  { name: "鲜血革命", value: "", type: "法术", tier: "二阶", effect: "速攻。对自己造成8伤害再对对方造成12伤害。" },
  { name: "生生流转", value: "5", type: "状态", tier: "二阶", effect: "回复2点生命值。余烬：受到大于12的伤害时，将此卡从墓地除外，回复4点生命值" },
  { name: "巫毒娃娃", value: "2", type: "状态", tier: "二阶", effect: "无法回复生命，受到伤害时，若伤害大于10，则丢弃一张手牌。抵挡伤害时，运势4：本次抵挡失效。" },
  { name: "细风扶柳剑", value: "4/3", type: "武器", tier: "二阶", effect: "造成的攻击伤害降低50%。每次攻击时，运势4:，额外造成自己*4的攻击伤害；运势1:本回合额外可以发起一次攻击。" },
  { name: "不语钟", value: "", type: "宝具", tier: "二阶", effect: "回合结束时，若本回合没使用卡牌，恢复4点生命。墓地没有卡牌的场合，额外恢复4点。" },
  { name: "唤魂铃", value: "", type: "宝具", tier: "二阶", effect: "一回合一次，除外自己墓地任意张卡牌，对对方造成除外数*2的伤害。" },
  { name: "伤心奇花", value: "", type: "宝具", tier: "一阶", effect: "一回合一次，自己卡牌效果被无效的场合才能发动，破坏对方随机一张手牌。这张卡被破坏送去墓地的场合，抽一张牌。" },
  { name: "神风", value: "", type: "法术", tier: "一阶", effect: "速攻。对方使用法术牌才能发动，使该效果无效并破坏卡牌。" },
  { name: "无效无效", value: "", type: "法术", tier: "一阶", effect: "反制。对方发动无效卡牌的效果时才能发动，无效他的无效并破坏对应卡牌。" },
  { name: "枯荣乙木神光", value: "", type: "法术", tier: "二阶", effect: "吟唱。对对方造成12伤害。2回合后，对方回合结束时恢复8点生命值。" },
  { name: "净化", value: "", type: "法术", tier: "一阶", effect: "速攻。破坏场上指定一张状态卡，恢复4点生命。" },
  { name: "卸力", value: "", type: "法术", tier: "一阶", effect: "当自己受到攻击伤害时才能发动，减免该次伤害。若对方装备了武器，则自己摸一张牌。" },
  { name: "万宝符", value: "", type: "宝具", tier: "二阶", effect: "可以将此卡当作【神风】、【净化】或者【卸力】打出。" },
  { name: "损魂烧命", value: "", type: "法术", tier: "二阶", effect: "吟唱。对对方造成4+对方当前生命值30%的伤害。共鸣：当对方因为卡牌的恢复效果至满血时，将一张手牌送去墓地，将此卡加入手卡。" },
  { name: "焚心断念", value: "", type: "法术", tier: "二阶", effect: "吟唱。对对方造成4+对方当前已损失生命值30%的伤害。共鸣：当对方生命值连续三个回合小于10时，将一张手牌送去墓地，将此卡加入手卡。" },
  { name: "反复", value: "", type: "法术", tier: "二阶", effect: "速攻，重复上次打出的法术牌。" },
  { name: "安如山", value: "2", type: "状态", tier: "二阶", effect: "受到的伤害降低50%" },
  { name: "不可大意", value: "", type: "法术", tier: "二阶", effect: "速攻，对方恢复生命时才能发动，破坏对方两张卡牌" },
  { name: "斗转星移", value: "", type: "法术", tier: "三阶", effect: "速攻。自己受到伤害/对方受到治疗才能发动，将其转化为治疗/伤害。" },
  { name: "伏兵", value: "", type: "法术", tier: "一阶", effect: "对方恢复生命才能发动，取消该次治疗，对方将一张手牌送去墓地。" },
  { name: "乾坤逆转", value: "", type: "法术", tier: "三阶", effect: "吟唱。禁制：丢弃两张手牌。双方互换生命值，产生的生命值变动视为伤害/治疗。" },
  { name: "预支未来", value: "", type: "法术", tier: "二阶", effect: "吟唱。禁制：跳过下两次摸牌阶段。立马摸三张卡牌" },
  { name: "饮血剑", value: "2/3", type: "武器", tier: "一阶", effect: "攻击造成的伤害附带50%回血。余烬：支付8生命从墓地装备这个武器。" },
  { name: "终焉之刻", value: "5", type: "状态", tier: "三阶", effect: "此状态最后一回合结算时，对对方造成20伤害。这张卡不是通过结算从场上送去墓地的场合，对对方造成8伤害。" },
  { name: "穷兵黩武", value: "", type: "法术", tier: "二阶", effect: "吟唱。双方依次丢弃任意数量手牌，每次丢弃需要在之前的基础上+1，选择不丢弃的玩家受到15伤害" },
  { name: "收之桑榆", value: "", type: "法术", tier: "一阶", effect: "速攻。摸取本回合等同于自己丢弃、被破坏的卡牌数的卡牌，最多3张。" },
  { name: "波动命运", value: "", type: "法术", tier: "一阶", effect: "反制。对方观看背面向上的牌时才能发动，取消本次观看并随机打乱顺序。共鸣：游戏开始时，双方互换牌顶5张牌." },
  { name: "命运预兆", value: "", type: "法术", tier: "一阶", effect: "吟唱。占卜：2。然后下次造成伤害时，翻开牌顶。根据牌的类型增加额外效果：法术，增加5伤害，状态，回复8生命，装备，破坏对方场上一张牌。" },
  { name: "蓄谋", value: "", type: "法术", tier: "二阶", effect: "吟唱。回合结束才能发动，占卜：2，摸取2张卡牌，跳过自己下个回合." },
  { name: "编织命运", value: "", type: "法术", tier: "三阶", effect: "禁制：辎重状态下才能发动。吟唱。双方丢弃所有手牌。占卜对手牌顶：5" },
  { name: "大繁荣", value: "", type: "法术", tier: "三阶", effect: "禁制：生命>30才能发动。速攻，双方将手牌摸至5张。" },
  { name: "仙人抚顶", value: "1", type: "状态", tier: "二阶", effect: "所有手牌等阶降低一阶。手牌阶数相同的场合，立马摸N张牌。N等于阶数。" },
  { name: "浮光掠影", value: "", type: "法术", tier: "二阶", effect: "吟唱。抽一张牌，造成5点伤害" },
  { name: "分岔路口", value: "", type: "法术", tier: "一阶", effect: "速攻，占卜：2.抽一张牌" },
  { name: "刻刻！", value: "", type: "法术", tier: "一阶", effect: "速攻。延长/减少指定状态卡2回合。" },
  { name: "松上雪", value: "", type: "法术", tier: "三阶", effect: "速攻。恢复10生命，破坏自身任意状态卡。破坏后自己状态区没有卡牌的场合，再抽一张牌。" },
  { name: "燕筑垒", value: "", type: "法术", tier: "一阶", effect: "吟唱。将自己装备区的任意数量卡牌返回卡组，洗牌。摸取等量卡牌。返回后装备区为空的场合下额外摸取一张。" },
  { name: "抱石眠", value: "2", type: "状态", tier: "二阶", effect: "无法使用卡牌，每回合结束恢复8生命。" },
  { name: "不动明王", value: "3", type: "状态", tier: "二阶", effect: "受到的所有伤害不执行计算，改为在此状态消失时执行一次总额计算。" },
  { name: "惊风刃", value: "", type: "法术", tier: "二阶", effect: "速攻。破坏对方一张手卡，对对方造成5伤害。" },
  { name: "无限武装无限", value: "", type: "状态", tier: "三阶", effect: "持续时间内可以装备任意数量装备" },
  { name: "大海捞针", value: "", type: "法术", tier: "一阶", effect: "吟唱。翻阅卡组顶端，直到出现装备卡，将其加入手卡，然后洗牌。" },
  { name: "定风珠", value: "", type: "宝具", tier: "二阶", effect: "一回合一次，对方发动的含有【风】字段的卡牌效果无效。" },
  { name: "鸿蒙朴石", value: "", type: "宝具", tier: "二阶", effect: "一回合一次，可以指定运势判定数字+2。" },
  { name: "占星宝珠", value: "", type: "宝具", tier: "二阶", effect: "自己回合开始时，占卜：2" },
  { name: "福星", value: "", type: "宝具", tier: "一阶", effect: "一回合一次，受到攻击时，运势4:抵挡本次攻击伤害。" },
  { name: "有舍有得", value: "", type: "法术", tier: "一阶", effect: "丢弃一张手牌。引渡一张同类型卡牌。余烬：将此卡与另外一张墓地的卡牌除外，抽一张牌，禁制：这个效果在此卡送去墓地的回合不能发动。" },
  { name: "万法归流·恨江去", value: "", type: "法术", tier: "三阶", effect: "禁制：只能在回合开始时发动，发动后本回合不能再打出法术牌。速攻。除外双方墓地所有法术牌，对对方造成8+除外数*2的伤害。共鸣：对方一回合内使用四张法术的场合，可以将此卡从牌河除外，立马结束对方回合。" },
  { name: "诸武百炼·镂金石", value: "", type: "法术", tier: "三阶", effect: "禁制：辎重状态下才能发动。吟唱。除外双方墓地所有装备牌，每除外一张武器，自己装备的武器+1/+1" },
  { name: "众妙之门·玉中人", value: "", type: "法术", tier: "三阶", effect: "禁止：发动后，自身不再能发动任何状态卡。除外双方墓地所有状态卡，直到游戏结束，自身不再受状态卡的效果影响，受到的法术伤害减半，受到的攻击伤害翻倍。" },
  { name: "心腹之患", value: "", type: "法术", tier: "二阶", effect: "吟唱。随机观看对方牌河三张牌，选中一张除外。对方引渡时改为：速发。将引渡卡牌和对方牌河两张卡牌混洗，选择一张除外" },
  { name: "借力打力", value: "", type: "法术", tier: "二阶", effect: "速攻。受到攻击伤害才能发动，抵挡该次伤害并对对方造成等量攻击伤害。" },
  { name: "饮民血", value: "", type: "法术", tier: "二阶", effect: "吟唱。造成5伤害，恢复等量生命值。余烬：对对方造成法术伤害时才能发动，将此卡从墓地除外，本次伤害降低4但恢复自己等量生命值。" },
  { name: "灵力充沛", value: "1", type: "状态", tier: "二阶", effect: "本回合双方法术伤害增加3." },
  { name: "分光对影仪", value: "", type: "宝具", tier: "一阶", effect: "每回合首次法术伤害增加2，第二次法术伤害减少2。" },
  { name: "蓄势", value: "3", type: "状态", tier: "一阶", effect: "下一次法术伤害增加50%*，向上取整，造成法术伤害后此状态消失。" },
  { name: "天佑", value: "3", type: "状态", tier: "一阶", effect: "直到此状态消失，获得12护甲。" },
  { name: "风驰电掣", value: "1", type: "状态", tier: "二阶", effect: "下回合摸数加1，本回合每触发一次连锁额外加一。" },
  { name: "无畏", value: "", type: "法术", tier: "一阶", effect: "速攻。受到伤害才能发动，支付4生命，抵挡该伤害。余烬：受到伤害时可以将此卡从墓地除外，支付4生命值，抵挡该伤害" },
  { name: "祸延生", value: "", type: "状态", tier: "三阶", effect: "禁制：每次发动此效果时必须需要支付5点生命。自己回合开始时对方受到5点伤害并且将一张手牌送入墓地，不这样做的场合受到10伤害。" },
  { name: "愚赶山", value: "2/10", type: "武器", tier: "一阶", effect: "此卡装备的场合宝具上限减一。" },
  { name: "巧夺天工", value: "", type: "法术", tier: "一阶", effect: "将此卡当作对方装备的复制品装备到自己场上。如果是武器的场合获得+1/+1。" },
  { name: "造器鬼斧", value: "", type: "法术", tier: "二阶", effect: "破坏对方指定一张装备牌，抽一张卡。" },
  { name: "兵粮寸断", value: "1", type: "状态", tier: "一阶", effect: "回合开始时，跳过摸牌阶段。手牌上限减1。运势6：持续回合减一。" },
  { name: "神净讨魔", value: "1", type: "状态", tier: "二阶", effect: "运势6：持续回合减一。跳过下一次出牌阶段。" },
  { name: "吾主在此", value: "1", type: "状态", tier: "二阶", effect: "自己发动的所有卡牌效果无法被无效化、抵挡、破坏。" },
  { name: "流风回雪", value: "", type: "法术", tier: "二阶", effect: "吟唱。指定自己墓地最多三张卡牌加入到自己卡组，然后洗牌并抽一张牌。" },
  { name: "盗墓者", value: "", type: "法术", tier: "二阶", effect: "禁制：支付10点生命值。吟唱。将双方墓地一张卡加入手卡。" },
  { name: "奇异飓风", value: "", type: "法术", tier: "一阶", effect: "反制。对方发动法术牌的效果可以发动，丢弃一张手牌使该卡无效并除外。" },
  { name: "潜能爆发", value: "2", type: "状态", tier: "二阶", effect: "自己临时提升三个等阶" },
  { name: "七星连珠", value: "", type: "法术", tier: "三阶", effect: "禁制：自己手牌>4才能发动。引渡：3" },
  { name: "武装解除", value: "", type: "法术", tier: "二阶", effect: "反制。对方使用装备牌或者发动装备的效果可以发动，使其效果无效并破坏。" },
  { name: "连环", value: "2", type: "状态", tier: "二阶", effect: "双方出牌回合，每结算一次连锁，连锁末端方摸一张牌并受到3点伤害。" },
  { name: "精挑细选", value: "", type: "法术", tier: "一阶", effect: "吟唱。将两张牌洗回牌堆，摸取三张牌。" },
  { name: "笼鸟勿飞", value: "", type: "法术", tier: "一阶", effect: "反制。禁制：对方回合结束时才能发动。对方出牌回合摸取的牌数大于2的场合将所有手牌送去墓地。" },
  { name: "长空危雀", value: "", type: "法术", tier: "一阶", effect: "吟唱。运势1：自己受到5伤害并对对方造成4+自己已损失生命值30%的伤害；运势4：自己受到5伤害并回复自己已损失生命值30%的生命值。" },
  { name: "捕风捉影", value: "", type: "法术", tier: "一阶", effect: "速攻。对方在回合外抽牌时才能发动，获得对方一张卡牌。" },
  { name: "狂风刃卷", value: "", type: "法术", tier: "一阶", effect: "吟唱。对对方造成4伤害，运势4：再次造成4伤害并再次进行运势判定，最多触发三次。" },
  { name: "福满乾坤", value: "", type: "法术", tier: "三阶", effect: "吟唱。禁制：本局对战触发正面掷币效果>5才能发动。双方回复满生命值并摸牌到手牌上限。" },
  { name: "百无禁忌", value: "", type: "法术", tier: "三阶", effect: "速攻。禁制：本局对战触发禁制效果>4才能发动。双方所有卡牌增加禁制：只能在自己回合发动，本局对战自己无视禁制效果。" },
  { name: "灾星", value: "", type: "法术", tier: "三阶", effect: "吟唱。禁制：本局对战触发运势判定的点数小于4的次数>5才能发动。对对方造成4*运势判定次数的伤害，此伤害不可被抵挡，本卡的发动无法被无效化。" },
  { name: "慈航屠刀", value: "5/2", type: "武器", tier: "二阶", effect: "造成的攻击伤害大于9时，防止此伤害改为除外对方两张手牌。" },
  { name: "底牌", value: "", type: "法术", tier: "三阶", effect: "受到致命伤害才能发动，立马结束对方回合，改为以1点虚假生命存在1回合。回合结束时若本回合受到治疗，则复活且将生命上限变为治疗值。" },
  { name: "奇袭鬼刺", value: "2/3", type: "武器", tier: "二阶", effect: "可以丢弃一张卡牌在对方回合发起攻击，若这样做对方额外受到2点攻击伤害且本次攻击不消耗武器耐久。" },
  { name: "不详之刃", value: "3/3", type: "武器", tier: "一阶", effect: "自己受到的伤害增加50%。" },
  { name: "还施彼身", value: "", type: "法术", tier: "二阶", effect: "速攻。对方回合结束时才能发动，对对方造成本回合自己受到伤害的伤害" },
  { name: "世界树幼苗", value: "0/4", type: "武器", tier: "一阶", effect: "装备后获得“余烬：将此卡从墓地除外，提升2个等阶”" },
  { name: "聚能法杖", value: "0/5", type: "武器", tier: "一阶", effect: "攻击后获得法术伤害增加2，可累积。持续到下一次法伤触发。" },
  { name: "生死簿", value: "", type: "宝具", tier: "三阶", effect: "受到致命伤害时掷币：正，抵挡该次伤害，反，无效果。一回合连续触发3次则直接死亡。" },
  { name: "督山点灵令", value: "", type: "宝具", tier: "三阶", effect: "手牌上限加2。一回合一次，双方舍弃卡牌或卡牌被破坏时，自己可以支付3点生命从中获取一张卡牌加入手卡。" },
  { name: "赶山覆海法剑", value: "5/2", type: "武器", tier: "三阶", effect: "装备期间，免疫攻击伤害。攻击时占卜：1，根据占卜的卡牌类型获得额外效果，法术，攻击附加等量法术伤害；状态，该武器耐久加1，装备：抽两张卡牌。" },
  { name: "司天布序神卷", value: "", type: "宝具", tier: "三阶", effect: "触发占卜时占卜数字额外加2。一回合一次，翻开牌顶和牌底各一张牌若其类型和阶数完全相同，对对方造成阶数*3的伤害。" },
  { name: "上相壶", value: "", type: "宝具", tier: "二阶", effect: "一回合一次，指定2张对方手牌收纳进壶中，持续到对方回合结束。若收纳期间壶被破坏，则此牌除外。" },
  { name: "锤炼", value: "", type: "法术", tier: "一阶", effect: "武器攻击提升2点，摸一张牌。" },
  { name: "昭昭暗渡", value: "3", type: "状态", tier: "二阶", effect: "回合结束时占卜：3。占卜时每有一张卡牌移入牌底，回复2点生命。当此牌在占卜中，加入手牌。" },
  { name: "飞星传恨", value: "", type: "法术", tier: "一阶", effect: "造成3伤害，若本回合占卜过，则额外造成3伤害。当此牌在占卜中，对对方造成5伤害。余烬：将墓地另外一张卡牌除外，将此牌放置在牌底。" },
  { name: "神之一手", value: "", type: "法术", tier: "三阶", effect: "查看牌堆，将一张卡牌加入手卡，然后洗牌。" },
  { name: "万宝槌", value: "3/1", type: "武器", tier: "一阶", effect: "攻击后可以将所有手牌洗入牌堆摸等量卡牌。" },
  { name: "精心保养", value: "", type: "法术", tier: "一阶", effect: "吟唱。武器耐久加2，本回合不攻击的场合，额外提升2点攻击。" },
  { name: "金窍兑隅·杀收宫", value: "2", type: "状态", tier: "三阶", effect: "本局游戏中攻击力永久上升2，回合结束时，可以将一张手牌除外再次触发该效果。" },
  { name: "风卷残云", value: "", type: "法术", tier: "一阶", effect: "吟唱。破坏场上一张状态卡，造成4*阶数的伤害。" },
  { name: "瞳瞳鬼眸", value: "2", type: "状态", tier: "二阶", effect: "回合结束时，占卜：1.对对方造成占卜卡牌阶数*3的伤害" },
  { name: "香俱沉", value: "", type: "法术", tier: "二阶", effect: "反制。除外对手牌堆顶两张卡牌，对对方造成4+2*其中法术牌数量的伤害。" },
  { name: "流云索阴", value: "", type: "法术", tier: "二阶", effect: "双方将牌顶五张卡牌送去墓地" },
  { name: "迟徘徊", value: "", type: "法术", tier: "一阶", effect: "速攻。对方发起攻击时可以发动，取消本次攻击，且本回合对方不能再发起攻击。余烬：将此卡和手牌中一张法术牌除外，取消对方一次攻击且让对方立马结束回合。" },
  { name: "烬彩鎏金", value: "", type: "法术", tier: "二阶", effect: "造成8伤害。这张卡不是通过使用送去墓地的场合，对对方造成对方手卡数量*2的伤害。余烬：将这张卡除外，对对方造成本局发动余烬效果次数*4的伤害。" },
  { name: "魔气腾腾", value: "2", type: "状态", tier: "二阶", effect: "双方受到的伤害均提升50%。这张卡不是通过使用送去墓地的场合，破坏场上一张卡。余烬：将这张卡和墓地另外一张状态卡除外，直到回合结束，双方受到的伤害提升50%。" },
  { name: "骤雨梨花枪", value: "0/3", type: "武器", tier: "二阶", effect: "攻击时将牌堆顶部一张卡牌和一张手牌送去墓地，类型相同的场合，额外造成6点伤害，阶数也相同的情况下抽两张牌。余烬：将这张卡和墓地另外两张装备卡除外，丢弃所有手卡，摸等量卡牌。" },
  { name: "拒岭中", value: "1", type: "状态", tier: "二阶", effect: "不可发动吟唱类、反制类法术但发动速攻类法术时立马抽一张牌。一回合最多触发3次。余烬：将这张卡和一张速攻类法术除外，无效并破坏对方发动的一张速攻法术牌。" },
  { name: "愁云锁暮", value: "10", type: "状态", tier: "二阶", effect: "回合结束受到2伤害。" },
  { name: "密云锢天", value: "2", type: "状态", tier: "二阶", effect: "回合结束受到5*本回合使用卡牌数的伤害" },
  { name: "天人五衰", value: "", type: "法术", tier: "三阶", effect: "吟唱。对对方造成对方场上状态数量*5的伤害，若对方状态数大于等于5，则将那五张状态持续时间修改为无限。共鸣：当自己状态区达到5张时，将这张卡除外，所有状态减少2个回合。" },
  { name: "制蛮斧", value: "2/5", type: "武器", tier: "一阶", effect: "攻击时若对方场上没有状态卡和装备卡，则额外造成3伤害。" },
  { name: "镜花水月", value: "3", type: "状态", tier: "二阶", effect: "记录双方生命值。此状态从场上离开的场合，将双方生命调整为记录值。" },
  { name: "电表倒转", value: "", type: "法术", tier: "三阶", effect: "速攻。依照时间顺序，将双方墓地合计五张卡返回拥有者手卡中。" },
  { name: "福运昌隆", value: "", type: "法术", tier: "二阶", effect: "吟唱。摸一张牌。运势4，恢复8点生命。运势6，引渡：1" },
  { name: "福祸相依", value: "", type: "法术", tier: "一阶", effect: "将自己一张牌送去墓地。运势4：抽两张牌。" },
  { name: "命理天成", value: "", type: "法术", tier: "三阶", effect: "反制。将墓地所有占卜效果的卡牌洗回牌组。这些牌当抽到时获得“抽到时自动释放”并摸一张牌。共鸣：墓地占卜卡牌超过8张时，将一张手牌送去墓地将此卡加入手卡。" },
  { name: "绝处逢生", value: "", type: "法术", tier: "三阶", effect: "反制。禁制：受到大于15点伤害。受到伤害时恢复双倍伤害值的生命" },
  { name: "潇湘八剑", value: "", type: "法术", tier: "二阶", effect: "速攻。造成8点伤害，自己生命低于20的场合，此卡发动无视阶数限制且变为“反制”类法术。自己生命低于10点的场合，获得“飘渺”：闪避下一次伤害。" },
  { name: "潇湘水云", value: "", type: "法术", tier: "二阶", effect: "吟唱。破坏双方场上各一张状态卡。每因此效果将卡牌破坏，将10点生命转换为10点护甲。" },
  { name: "风不定", value: "2", type: "状态", tier: "三阶", effect: "每次造成伤害，运势：提升等同运势点数的伤害。每次受到伤害，运势：降低等同运势点数的伤害。" },
  { name: "交换人生", value: "3", type: "状态", tier: "一阶", effect: "双方摸牌阶段改为从对方牌顶摸牌。" },
  { name: "兼相爱", value: "", type: "法术", tier: "二阶", effect: "运势4，双方摸一张牌。运势6，自己摸一张牌" },
  { name: "有福同享", value: "", type: "法术", tier: "二阶", effect: "速攻。对方回合结束时才能发动，摸取等同对方本回合摸取卡牌数量的卡牌。" },
  { name: "有难同当", value: "", type: "法术", tier: "二阶", effect: "速攻。自己回合结束时才能发动，对方丢弃等同自己本回合丢弃卡牌数量的卡牌。" },
  { name: "卸甲强袭", value: "", type: "法术", tier: "一阶", effect: "禁制：丢弃一张卡牌。对对方造成7点伤害，丢弃的是装备卡的场合额外再造成3点伤害。" },
  { name: "同花顺", value: "", type: "法术", tier: "一阶", effect: "速攻。对方场上的卡牌不少于3张且全部为同类型的场合才能发动。破坏对手场上所有卡牌。共鸣：手牌类型全部相同的场合，公开手牌。丢弃一张卡牌将此卡加入手卡，阶数也相同的场合，可以不用丢弃。" },
  { name: "热雪", value: "2", type: "状态", tier: "一阶", effect: "每回合第一张卡牌效果无效，第二张卡牌的效果触发两次，第三张使用后受到10点伤害。" },
  { name: "慈悲渡魂灵刃", value: "5/2", type: "武器", tier: "三阶", effect: "装备的回合获得免疫。对方回合，自己受到伤害且生命低于12，这张装备卡可以在对面回合装备。余烬：将此卡从墓地除外，本回合获得“飘渺”" },
  { name: "议八辟", value: "3", type: "状态", tier: "一阶", effect: "受到伤害时可以改为将一张装备牌送去墓地作为替代。" },
  { name: "伏魔金钵", value: "8/1", type: "武器", tier: "三阶", effect: "使用一张三阶卡牌时，耐久加一，攻击减一" },
  { name: "节制", value: "", type: "宝具", tier: "一阶", effect: "一回合一次，自己丢弃手牌时抽一张牌。" },
  { name: "剔骨", value: "", type: "法术", tier: "一阶", effect: "吟唱。对对方造成4点伤害，连击：额外造成4点伤害" },
  { name: "君韬危", value: "", type: "状态", tier: "二阶", effect: "获得已损失生命值/5的法术强度" },
  { name: "折光逆剑", value: "", type: "法术", tier: "三阶", effect: "吟唱。禁止：生命低于对方的场合才能发动。对对方造成双方生命差的伤害，最大值20" },
  { name: "伏兵", value: "", type: "法术", tier: "二阶", effect: "速攻。禁制：对方本回合首次发动卡牌效果时才能发动。展示自己左手边第一张卡牌，若类型相同，则对方卡牌效果的无效并破坏；阶数也相同的情况下，【伏兵】不送去墓地而是返回手牌。" },
  { name: "提萃", value: "", type: "法术", tier: "一阶", effect: "速攻。查看牌堆三张卡牌，选择一张加入，其余送去墓地。" },
  { name: "杖势欺人", value: "3/2", type: "武器", tier: "一阶", effect: "攻击对方的场合攻击力额外上升双方场上卡牌数量差" },
  { name: "狂暴", value: "2", type: "状态", tier: "一阶", effect: "获得禁制“无法发动法术”，攻击上升3点，每回合可以额外攻击一次" },
  { name: "落宝金钱", value: "", type: "宝具", tier: "二阶", effect: "一回合一次，对方发动卡牌时，运势：4，使其无效并返回手牌，对方本回合不可再发动同名卡牌。" },
  { name: "正始两仪·帝观元", value: "", type: "法术", tier: "三阶", effect: "吟唱。将所有手牌交给一名其他角色，然后该角色亮出任意数量的手牌，你选择一项：1.获得其亮出的手牌；2.获得其未亮出的手牌。" },
  { name: "病前春", value: "", type: "法术", tier: "二阶", effect: "吟唱。恢复2+自己上回合受到总伤害的生命值。" },
  { name: "罗刹三顾·不空劫", value: "", type: "法术", tier: "三阶", effect: "吟唱。将三种[罗刹念]洗入对手牌库。\n罗刹念：抽到时释放。从以下选择中选一项：1.减少一半生命和生命上限，2.减少一半手牌。3.减少一半牌堆。已选择的不可再选择。" },
  { name: "乌从欲", value: "", type: "法术", tier: "二阶", effect: "速攻。造成6点伤害，抽取实际伤害值/7的卡牌。" },
  { name: "地巫祝", value: "", type: "法术", tier: "一阶", effect: "速攻。双方恢复6点生命。超出上限的恢复改为增加等量易伤。" },
  { name: "南疆毒囊", value: "", type: "宝具", tier: "二阶", effect: "易伤效果持续时间改为永久。自己回合结束为对手添加1点易伤" },
  { name: "脱煞胎", value: "", type: "宝具", tier: "二阶", effect: "每次造成伤害为其添加1点易伤。" },
  { name: "藏祸心", value: "1/3", type: "武器", tier: "二阶", effect: "攻击后为对手添加等同攻击伤害的易伤。" },
  { name: "万毒菱华", value: "1", type: "状态", tier: "二阶", effect: "易伤触发后不会移除。" },
  { name: "秘血汞", value: "", type: "法术", tier: "一阶", effect: "反制。对方发动法术牌的效果可以发动，使该卡无效并除外。自己根据其类型受到不等伤害，吟唱，5；速攻，7；反制，10" },
  { name: "硕鼠", value: "", type: "法术", tier: "一阶", effect: "反制。对方本回合手牌上限减2。" },
  { name: "屯田", value: "3", type: "状态", tier: "一阶", effect: "效果持续期间，自己回合内没有造成任何伤害则计数加1。此状态消失时，摸取等同计数的卡牌。" },
  { name: "雪中送碳", value: "", type: "法术", tier: "二阶", effect: "速攻。恢复8点生命。自己生命少于12的场合再恢复4点。" },
  { name: "朽木", value: "3/1", type: "武器", tier: "一阶", effect: "这张卡因破坏、弃置效果送去墓地时，抽一张牌" },
  { name: "变废为宝", value: "", type: "法术", tier: "一阶", effect: "速攻。禁制：自己墓地数量>5。将自己墓地、除外区任意两张卡牌返回卡组然后洗牌并抽一张牌。" },
  { name: "盛放", value: "", type: "法术", tier: "三阶", effect: "抽两张牌，获得等同双倍手牌数量的护甲。" },
  { name: "愚蠢举动", value: "", type: "法术", tier: "一阶", effect: "速攻。弃置两张手牌，抽两张牌。" },
  { name: "糜妨世", value: "1", type: "状态", tier: "二阶", effect: "最高一种类型的等阶临时降低2阶。" },
  { name: "请诣太素·授玄珠", value: "", type: "法术", tier: "二阶", effect: "弃置一张手牌，提升一次等阶。余烬:将此卡从墓地除外，本回合临时提升一次等阶，这个效果在此卡送去墓地的回合不能发动。" },
  { name: "朔风霰雪", value: "", type: "法术", tier: "二阶", effect: "速攻。将对手场上所有卡牌返回拥有者手中。对方受到等同返回数量的伤害。" },
  { name: "仪对影", value: "", type: "法术", tier: "一阶", effect: "对方抽两张牌。运势4：效果改为自己抽两张牌。" },
  { name: "靖平敕", value: "", type: "法术", tier: "一阶", effect: "对方展示一张卡牌。自己舍弃阶数、类型均相同的一张卡牌对其造成4+阶数*2的伤害。" },
  { name: "烬火燎原", value: "", type: "法术", tier: "二阶", effect: "吟唱。对对方造成6点伤害。每有1张“余烬”类卡牌在你的墓地，额外造成1点伤害。共鸣：一回合内双方送去墓地卡的数量合计大于5，将一张手牌送去墓地，将此卡加入手卡。" },
  { name: "藏纳宫", value: "", type: "宝具", tier: "二阶", effect: "手牌上限+4." },
  { name: "离烬不息·朝天阙", value: "", type: "法术", tier: "三阶", effect: "将自己所有手牌破坏，为其添加“余烬：将此卡除外，抽一张牌。”，对对方造成破坏数量*2的伤害。" },
  { name: "心狩眼明·百目鬼", value: "", type: "宝具", tier: "三阶", effect: "每次占卜时，造成x点伤害，x为占卜数量。" },
  { name: "斛量灾", value: "", type: "法术", tier: "一阶", effect: "吟唱。占卜：1.造成3点伤害。将此卡洗入牌堆，下一次“斛量灾”伤害加2." },
  { name: "鬼面", value: "5/1", type: "武器", tier: "一阶", effect: "若此卡在占卜中被发现，则无视阶数装备到装备区并重置本回合攻击次数" },
  { name: "月华流照", value: "", type: "状态", tier: "二阶", effect: "每回合结束，占卜：3，若所有卡牌类型相同则向对方展示，自己选1张牌加入手卡。如都不相同，则下回合临时提升一次等阶。" },
  { name: "九莲宝灯", value: "1/1", type: "武器", tier: "三阶", effect: "本局游戏你通过运势投骰子每投出一个不同的数字，则获得+1/+1" },
  { name: "出千", value: "", type: "法术", tier: "一阶", effect: "速攻。造成5点伤害，本局游戏你每投掷出一个6点。伤害+1." },
  { name: "蕴宝瓶", value: "", type: "宝具", tier: "一阶", effect: "每次恢复生命时，运势：4，额外恢复3点。" },
  { name: "瑞气云", value: "", type: "宝具", tier: "二阶", effect: "一回合一次，可以将对对方的伤害转化为对自己的治疗，若如此做，运势：x，额外增加x点护甲。" },
  { name: "转珠舸", value: "", type: "法术", tier: "二阶", effect: "吟唱。选择敌我场上的两张状态卡，交换他们的位置。" },
  { name: "天齐满", value: "4", type: "状态", tier: "二阶", effect: "双方获得“回合结束时，运势：4，恢复4点生命值”" },
  { name: "邀战", value: "", type: "法术", tier: "一阶", effect: "速攻。对方立刻打出一张伤害牌或者受到8点伤害。" },
  { name: "妙道化生石", value: "", type: "宝具", tier: "一阶", effect: "所有治疗效果+1，溢出上限的治疗效果转为等量护甲值。" },
  { name: "以守为攻", value: "", type: "法术", tier: "三阶", effect: "吟唱。获得5点护甲，对对方造成等同护甲值的伤害。" },
  { name: "朝社参", value: "3", type: "状态", tier: "二阶", effect: "翻阅牌堆，将一张卡牌除外，然后洗牌。余烬：此卡不是因破坏送去墓地的场合，将此卡除外，那张选定的卡加入手卡。" },
  { name: "龟甲奇占", value: "", type: "法术", tier: "一阶", effect: "速攻。从牌底占卜：3，，可以消耗2点护甲，再触发一次。" },
  { name: "狂潮", value: "1", type: "状态", tier: "三阶", effect: "每使用两张法术牌获得法术伤害+1，每造成8点伤害，引渡：1" },
  { name: "袖里乾坤", value: "", type: "法术", tier: "二阶", effect: "速攻。选定自己和对手各一张卡牌里侧除外，回合结束，它们混洗随机返回双方玩家手中。" },
  { name: "藏影诡谲·浮云身", value: "", type: "法术", tier: "二阶", effect: "这张卡的效果与对手上回合最后一张卡牌一致。" },
  { name: "芥子须弥", value: "3", type: "状态", tier: "二阶", effect: "将所有手牌除外，抽取等量卡牌。然后每回合结束，可以将一张卡牌与除外区的卡牌进行替换。" },
  { name: "馈赠", value: "", type: "法术", tier: "一阶", effect: "吟唱。对方抽一张牌，受到8点伤害。" },
  { name: "上上签", value: "", type: "法术", tier: "二阶", effect: "吟唱。运势x：占卜等同运势点数的卡牌，将其中包含运势字段的卡牌展示后全部加入手中，禁制：这些牌的总阶数不得大于5。" },
  { name: "下下签", value: "", type: "法术", tier: "一阶", effect: "吟唱。运势x：对对方施加x的易伤，运势6:额外再破坏一张手牌。" },
  { name: "积重难返·折焚尽", value: "2", type: "状态", tier: "二阶", effect: "禁制：对方手牌<=3，生命<=15。无法恢复生命值，无法以除了回合开始抽牌之外的方式获得手牌，所有装备效果失效。" },
  // 注意：完整数据见下方说明
];

// 由于数据量大，建议你将完整 cardData 放在单独的 data.js 文件中
// 但为方便，这里只展示结构。你可将完整 CSV 转为 JS 对象数组

// 实际使用时，请将你提供的全部卡牌按上述格式填入 cardData

const cardDir = 'assets/cards/';
const grid = document.getElementById('cards-grid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('search');
let currentCards = [];

// 生成卡牌
function renderCards(cards) {
  grid.innerHTML = '';
  let loadedCount = 0;
  const total = cards.length;

  cards.forEach(card => {
    const filePath = `${cardDir}${card.name}.png`;
    const img = new Image();
    
    img.onload = () => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card-item';
      cardEl.innerHTML = `
        <img class="card-image" src="${filePath}" alt="${card.name}" />
        <div class="card-label">${card.name}</div>
      `;
      cardEl.onclick = () => showCardModal(card, filePath);
      grid.appendChild(cardEl);
      
      loadedCount++;
      if (loadedCount === total) {
        loading.style.display = 'none';
      }
    };
    
    img.onerror = () => {
      console.error("❌ 图片加载失败:", filePath);
      loadedCount++;
      if (loadedCount === total) {
        loading.style.display = 'none';
      }
    };
    
    img.src = filePath; // 注意：放在最后，避免缓存问题
  });

  // 如果 cards 为空
  if (cards.length === 0) {
    loading.style.display = 'none';
  }
}

// 显示详情
function showCardModal(card, imagePath) {
  document.getElementById('modal-name').textContent = card.name;
  document.getElementById('modal-class').textContent = card.type;
  document.getElementById('modal-class').className = `class-${card.type}`;
  document.getElementById('modal-tier').textContent = card.tier;
  document.getElementById('modal-tier').className = `tier-${card.tier}`;
  document.getElementById('modal-effect').textContent = card.effect;
  document.getElementById('modal-value').textContent = card.value || '';
  document.getElementById('modal-image').src = imagePath;
  document.getElementById('card-modal').style.display = 'block';
}

// 筛选
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const type = btn.dataset.type;
    const query = searchInput.value.toLowerCase();
    const filtered = type === 'all' 
      ? cardData.filter(c => c.name.toLowerCase().includes(query))
      : cardData.filter(c => c.type === type && c.name.toLowerCase().includes(query));
    renderCards(filtered);
  });
});

// 搜索
searchInput.addEventListener('input', () => {
  const type = document.querySelector('.filter-btn.active').dataset.type;
  const query = searchInput.value.toLowerCase();
  const filtered = type === 'all' 
    ? cardData.filter(c => c.name.toLowerCase().includes(query))
    : cardData.filter(c => c.type === type && c.name.toLowerCase().includes(query));
  renderCards(filtered);
});

// 关闭模态框
document.querySelector('.close').onclick = () => {
  document.getElementById('card-modal').style.display = 'none';
};
window.onclick = (e) => {
  if (e.target === document.getElementById('card-modal')) {
    document.getElementById('card-modal').style.display = 'none';
  }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 你可以在这里加载完整数据（建议从 data.js 引入）
  // 为演示，我们先用部分数据
  console.log("正在渲染卡牌，共", cardData.length, "张");
  renderCards(cardData);
});
