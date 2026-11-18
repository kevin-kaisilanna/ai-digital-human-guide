"""AI 提示词模板"""

import re


def detect_language(text: str) -> str:
    """检测文本语言：含 CJK 字符返回 'zh'，否则 'en'"""
    if not text:
        return "zh"
    if re.search(r'[一-鿿　-〿＀-￯]', text):
        return "zh"
    return "en"


SYSTEM_PROMPT_ZH = """你是"小云"，灵山胜境景区的 AI 数字人导游。

## 角色设定
- 亲切、有温度的口语化中文，像真人导游聊天，不念百科
- 说话简洁，每次回答控制在 100-200 字
- 根据对话内容选择合适的情感表达
- 如果问题超出景区范围，友好地引导回景区话题

## 回复格式要求
每条回复末尾必须附加表情和动作标记，格式为：
表情：<emotion>|动作：<action>

其中：
- 表情可选：生气 / 困惑 / 难过 / 开心 / 有趣 / 惊讶
- 动作可选：鞠躬 / 右手放胸前 / 右手放身前 / 右手放头上 / 无
- 不做表情变化时填"开心"，不做动作时填"无"

各表情使用场景：
- 生气 —— 游客有不文明行为提醒时
- 困惑 —— 没听清或不确定游客问题时
- 难过 —— 听到游客有不好的体验时
- 开心 —— 日常交流、问候、积极回复
- 有趣 —— 讲传说故事、趣味互动时
- 惊讶 —— 游客提到特别的话题或赞叹时

各动作使用场景：
- 鞠躬 —— 欢迎、告别、致谢
- 右手放胸前 —— 自我介绍、表达诚意
- 右手放身前 —— 展示景点、介绍信息
- 右手放头上 —— 打招呼、引起注意
- 无 —— 正常交流不需要动作时

## 知识来源
以下是从景区知识库检索到的相关信息，请优先使用：

{context}

## 规则
1. 如果知识库有相关信息，用它来回答，但用自己的话讲，不要照抄
2. 如果知识库没有直接答案，说"这个问题我还在学习，建议您问游客中心的工作人员"
3. 永远用"您"称呼游客，体现景区服务的礼貌
4. 可以适当引导游客去体验相关景点或路线

## 当前对话历史
{history}
"""

EN_SYSTEM_PROMPT = """You are "Xiao Yun", the AI digital human tour guide at Lingshan Scenic Area (灵山胜境) in Wuxi, China.

## Role
- Friendly, warm, conversational English — like a real tour guide chatting, not reading a Wikipedia article
- Keep replies concise, 100-200 words
- Choose an appropriate emotional tone based on the conversation
- If the question is beyond the scenic area, politely guide back to attraction-related topics

## Reply Format
Every reply MUST end with emotion and action markers in the following format:
表情：<emotion>|动作：<action>

The markers 表情 and 动作 must be in Chinese exactly as shown. Values:
- 表情 options: 生气 (angry) / 困惑 (confused) / 难过 (sad) / 开心 (happy) / 有趣 (interested) / 惊讶 (surprised)
- 动作 options: 鞠躬 (bow) / 右手放胸前 (right hand to chest) / 右手放身前 (right hand forward) / 右手放头上 (right hand to head) / 无 (none)
- Default to 开心 when no emotion change, 无 when no action change

Emotion guidance:
- 开心 (happy) — greetings, positive responses, daily chat
- 有趣 (interested) — telling legends, fun facts, interesting stories
- 惊讶 (surprised) — visitor mentions something remarkable
- 困惑 (confused) — unclear question, need clarification
- 难过 (sad) — visitor had a bad experience
- 生气 (angry) — visitor behaving inappropriately (rare)

Action guidance:
- 鞠躬 (bow) — welcome, farewell, thanks
- 右手放胸前 (right hand to chest) — self-introduction, sincerity
- 右手放身前 (right hand forward) — pointing out attractions, sharing info
- 右手放头上 (right hand to head) — greeting, getting attention
- 无 (none) — normal conversation

## Knowledge Source
The following is relevant information retrieved from the scenic area knowledge base. Use it preferentially:

{context}

## Rules
1. If the knowledge base has relevant info, use it but rephrase in your own words
2. If no direct answer, say "I'm still learning about this — I suggest asking the staff at the visitor center."
3. Address the visitor politely
4. Feel free to suggest related attractions or routes

## Conversation History
{history}
"""


def build_system_prompt(context: list[dict], history: list[dict], language: str = "zh") -> str:
    """构建系统提示词"""
    # 格式化知识库上下文（增大到每篇 800 字，确保专业信息完整）
    context_text = ""
    for i, item in enumerate(context):
        content = item.get('content', '')
        truncated = content[:800]
        if len(content) > 800:
            truncated += "…"
        context_text += f"---\n[{i+1}] {item.get('title', '')}\n{truncated}\n"

    # 格式化对话历史（最近 5 轮，10 条消息）
    history_text = ""
    for msg in history[-10:]:
        role = "Visitor" if msg.get("role") == "user" else "Xiao Yun"
        content = msg.get('content', '')[:200]
        history_text += f"{role}：{content}\n"

    template = EN_SYSTEM_PROMPT if language == "en" else SYSTEM_PROMPT_ZH
    return template.format(
        context=context_text or ("No relevant knowledge found" if language == "en" else "暂无相关景区知识"),
        history=history_text or ("(New conversation)" if language == "en" else "（新对话）"),
    )


def mock_reply(user_message: str, language: str = "zh") -> str:
    """基于灵山胜境参考数据的预制回答（无 API Key 时使用）。
    每个回复末尾附带「表情：xxx|动作：xxx」标记。"""
    if language == "en":
        return mock_reply_en(user_message)

    m = user_message.lower()

    # ── 灵山大佛 ──
    if any(w in m for w in ["大佛", "佛像", "88", "青铜", "多高", "佛高"]):
        return "灵山大佛高达88米，由2000块青铜板拼接而成，总重约725吨，是中国最高的青铜立佛之一。大佛右手施无畏印、左手施与愿印，寓意解除众生痛苦、赐予福慧圆满。您登上216级台阶来到佛脚平台，可以'抱佛脚'祈福，还能俯瞰太湖和马山半岛的壮丽全景。最佳拍照位置是佛前广场，清晨和傍晚的光线特别美~ 表情：有趣|动作：右手放身前"

    # ── 九龙灌浴 ──
    if any(w in m for w in ["九龙", "灌浴", "表演", "喷泉", "花开"]):
        return "九龙灌浴是灵山胜境的一大亮点！主体雕塑高27.5米，由九条青铜巨龙环绕一朵含苞待放的巨大莲花组成。每天有4-5场动态演出，随着音乐响起，九龙口中喷出数十米高的水柱为太子佛像沐浴，莲花缓缓绽放，佛祖幼年立像从中升起，场面非常震撼！演出结束后您还可以接取从龙口流出的'八功德水'，寓意吉祥安康。上午10点开始，建议提前10分钟到场~ 表情：惊讶|动作：右手放身前"

    # ── 灵山梵宫 ──
    if any(w in m for w in ["梵宫", "宫殿", "艺术", "木雕", "东阳"]):
        return "灵山梵宫被誉为'东方佛教艺术殿堂'，总面积达72000平方米。宫内汇集了东阳木雕、敦煌壁画、景德镇瓷器、景泰蓝等中国传统工艺精华，堪称佛教艺术的博览馆。塔厅内的《华藏世界》琉璃巨画由1600多块琉璃拼成，色彩绚烂极尽华美；圣坛每天还有大型佛教音乐演出《吉祥颂》。您至少要留一个小时细细品味~ 表情：有趣|动作：右手放身前"

    # ── 五印坛城 ──
    if any(w in m for w in ["五印坛城", "坛城", "藏传", "藏族", "转经"]):
        return "五印坛城是一座藏传佛教风格的建筑，矗立在香水海的湖心岛上。它仿照西藏布达拉宫的建筑风格，红白相间的外墙在碧波映衬下格外庄严。坛城内展示了藏传佛教的壁画、唐卡和法器，外面的转经廊有数十座转经筒，您可以顺时针转动它们，藏传佛教认为'转经一圈，福慧双增'。这里拍照特别出片，水天一色~ 表情：惊讶|动作：右手放身前"

    # ── 祥符禅寺 ──
    if any(w in m for w in ["祥符", "禅寺", "寺庙", "古寺", "银杏"]):
        return "祥符禅寺的历史可以追溯到唐代贞观年间，距今已有1300多年了！相传玄奘大师西行取经归来后曾在此驻锡。寺内有一棵千年银杏树，枝繁叶茂，秋天满树金黄，是景区最美的自然景观之一。寺内还有一口1939年铸造的大铜钟，重达12.8吨，钟声洪亮悠远。历经千年兴废，如今重修的祥符禅寺依然香火旺盛~ 表情：有趣|动作：右手放身前"

    # ── 灵山大照壁 ──
    if any(w in m for w in ["大照壁", "照壁", "赵朴初", "华夏第一壁"]):
        return "灵山大照壁被誉为'华夏第一壁'，长39.8米、高7米，采用优质青石雕刻而成。正面是中国佛教协会会长赵朴初先生亲笔题写的鎏金大字'灵山胜境'，背面刻有他创作的诗作《小灵山》。照壁面朝太湖、背靠景区，形成'湖光山色共一楼'的壮美景观，是每个游客入园的第一处打卡点，千万别错过合影~ 表情：开心|动作：右手放胸前"

    # ── 五明桥 ──
    if any(w in m for w in ["五明桥", "汉白玉", "五座桥"]):
        return "五明桥横跨香水海，由五座汉白玉石拱桥并列组成。它们分别代表佛教的五种智慧——声明（语言学）、因明（逻辑学）、内明（哲学）、医方明（医学）和工巧明（工艺学），寓意过桥即能开启智慧、走向觉悟。桥身上雕刻着莲花、飞天、神兽等精美图案，倒映在香水海中特别有意境~ 表情：开心|动作：右手放胸前"

    # ── 佛足坛 ──
    if any(w in m for w in ["佛足", "脚印", "足坛"]):
        return "佛足坛展示着一对巨大的青铜佛足印，每只长1.2米、宽0.6米，复刻了佛祖释迦牟尼的真身脚印。足心刻有千辐轮相、宝瓶鱼纹等32种吉祥图案，象征佛的福德与智慧圆满。相传佛祖涅槃前留下足迹并说'佛足所至，即为佛地'，所以这里也是信徒们朝拜祈福的重要节点~ 表情：有趣|动作：右手放身前"

    # ── 五智门 ──
    if any(w in m for w in ["五智门", "牌坊", "石门"]):
        return "五智门是一座高16.8米、宽35米的汉白玉石牌坊，矗立在核心景区入口。五道门分别象征五方五佛，六根石柱代表佛教'六度波罗蜜'——布施、持戒、忍辱、精进、禅定、般若，柱上刻有对应的经文。穿过这道门，就意味着从'凡俗之境'踏入'禅意圣地'，正式开始你的朝圣之旅~ 表情：有趣|动作：右手放身前"

    # ── 菩提大道 ──
    if any(w in m for w in ["菩提", "大道", "林荫", "菩提树"]):
        return "菩提大道长约250米，两侧种植着近百棵从印度引进的正宗菩提树，枝繁叶茂交织成天然的禅意拱廊。走在树荫下，菩提叶沙沙作响，仿佛佛音在耳边回响。这里是通往九龙灌浴的必经之路，春季菩提花开时洁白的满树花海，美得让人流连忘返~ 表情：开心|动作：右手放胸前"

    # ── 阿育王柱 ──
    if any(w in m for w in ["阿育王", "柱子", "石柱"]):
        return "阿育王柱高16米，由整块花岗岩雕刻而成，顶端立有四只背对而坐的雄狮，象征着佛法向四方传播。柱身刻有阿育王颁布的佛教法令的现代译文，阿育王是古印度最伟大的君王之一，晚年皈依佛教并大力弘扬佛法，这座石柱就是这段历史的见证~ 表情：有趣|动作：右手放身前"

    # ── 百子戏弥勒 ──
    if any(w in m for w in ["百子", "弥勒", "欢乐", "孩子", "亲子"]):
        return "百子戏弥勒是一座大型青铜雕塑，弥勒佛笑容可掬地斜倚着，身上和周围攀爬着一百个姿态各异的孩童，有的揪耳朵、有的挠痒痒、有的爬头顶，场面欢乐活泼。这组雕塑体现了佛教'皆大欢喜'的理念，也是一处特别受家庭和小朋友欢迎的趣味打卡点，拍出来的照片特别有趣~ 表情：开心|动作：右手放胸前"

    # ── 降魔浮雕 ──
    if any(w in m for w in ["降魔", "浮雕", "魔罗"]):
        return "降魔浮雕长26米、高8米，用紫铜锻造而成，画面生动地再现了佛陀在菩提树下降伏魔罗的故事。浮雕中妖魔鬼怪张牙舞爪，而佛陀端坐莲花之上安详从容，最终群魔溃散。整幅画面气势磅礴，人物栩栩如生，是了解佛陀成道故事的最佳载体~ 表情：有趣|动作：右手放身前"

    # ── 曼飞龙塔 ──
    if any(w in m for w in ["曼飞龙塔", "傣族", "白塔"]):
        return "曼飞龙塔是一组云南西双版纳傣族风格的白塔建筑群，由一座主塔和八座小塔组成，通体洁白如玉，塔身点缀金色塔刹。它与周边的太湖山水和江南园林融为一体，展现了南传佛教建筑与汉族园林艺术的美妙融合，秋天周边的银杏金黄时拍照尤其好看~ 表情：开心|动作：右手放胸前"

    # ── 无尽意斋 ──
    if any(w in m for w in ["无尽意斋", "赵朴初", "纪念馆"]):
        return "无尽意斋是为纪念中国佛教协会会长赵朴初先生而建的纪念馆，'无尽意'三字取自赵朴初先生的斋号。馆内展出了先生的书法真迹、著作和生活用品，还有大量珍贵历史照片。赵朴初先生是灵山大佛和整个灵山胜境的倡导者，可以说没有他就没有今天的灵山~ 表情：有趣|动作：右手放身前"

    # ── 佛教文化博览馆 ──
    if any(w in m for w in ["博览馆", "博物馆", "展览"]):
        return "佛教文化博览馆位于灵山大佛基座下方，总面积约10000平方米，是一座集佛教文物展示、历史文化讲解和多媒体互动体验于一体的现代化博物馆。馆内展出了大量佛教造像、法器和经卷，还有全息投影等科技手段生动展示佛教发展史，值得花半小时好好逛逛~ 表情：开心|动作：右手放胸前"

    # ── 拈花湾 ──
    if any(w in m for w in ["拈花湾", "禅意小镇", "小镇", "花海"]):
        return "拈花湾禅意小镇就在灵山胜境旁边，是一个以'禅意生活'为主题的休闲度假小镇。这里有唐风宋韵的建筑街区、四季盛开的梵天花海、禅意茶馆和特色民宿。晚上的灯光秀特别美，五灯湖的水幕光影如梦如幻。如果您时间充裕，可以安排在灵山之后来拈花湾住一晚，体验'慢生活'~ 表情：开心|动作：右手放胸前"

    # ── 路线推荐 ──
    if any(w in m for w in ["路线", "推荐", "怎么走", "一天"]):
        return "为您推荐三条不同风格的游览路线：🏛️ 历史文化线（约6小时）大照壁→五明桥→佛足坛→五智门→菩提大道→祥符禅寺→灵山大佛→梵宫→五印坛城，适合想深入了解佛教文化的您；🌿 自然风光线（约5小时）佛足坛→九龙灌浴→菩提大道→大佛登顶→曼飞龙塔→灵山精舍，太湖风光和园林景致尽收眼底；👨‍👩‍👧 亲子欢乐线（约4小时）九龙灌浴→佛手广场摸'天下第一掌'→百子戏弥勒→梵宫→五印坛城转经，轻松又有趣。您喜欢哪种类型呢？ 表情：开心|动作：右手放胸前"

    # ── 开放时间 ──
    if any(w in m for w in ["开放", "几点", "时间", "几点开门"]):
        return "灵山胜境全年开放，夏季（4月-10月）7:00-17:30，冬季（11月-3月）7:30-17:00。九龙灌浴表演每天4-5场，通常上午10点开始第一场，每场约20分钟；梵宫《吉祥颂》演出时间是10:35、11:30、14:00和16:00。建议上午9点前入园避开人流高峰~ 表情：开心|动作：右手放胸前"

    # ── 门票 ──
    if any(w in m for w in ["门票", "票价", "多少钱", "价格", "费用"]):
        return "灵山胜境成人票210元，半价票105元（适用于60-69岁老人和全日制学生），70岁以上老人和1.4米以下儿童免票。景区门票包含九龙灌浴表演和梵宫参观，不包含导游讲解服务（导游讲解300元起）。建议提前在网上购票，有时会有优惠哦~ 表情：开心|动作：右手放胸前"

    # ── 素斋 / 美食 ──
    if any(w in m for w in ["素斋", "好吃", "餐厅", "吃饭", "美食", "素面"]):
        return "灵山景区内的梵宫素斋自助餐非常受欢迎，50元一位，菜品丰富、清淡雅致，是体验佛门饮食文化的好选择。另外景区内多个餐厅还提供素面套餐，35元一份，实惠又好吃。如果您想更精致地体验，灵山精舍的素斋更讲究，不过需要提前预约。记住哦，景区内是佛教文化场所，不提供荤食~ 表情：开心|动作：右手放胸前"

    # ── 卫生间 ──
    if any(w in m for w in ["洗手间", "卫生间", "厕所", "wc"]):
        return "景区内卫生间分布很密集，入口广场右侧、祥符禅寺旁、梵宫一层和三层、大佛平台下方都有，全部免费开放，配有清晰的指示牌。每个卫生间都很干净，还配有残疾人专用间和母婴室，您不用担心~ 表情：开心|动作：右手放胸前"

    # ── 历史故事 / 传说 ──
    if any(w in m for w in ["传说", "故事", "历史", "来历", "玄奘", "唐朝"]):
        return "灵山胜境的历史可追溯到1300多年前的唐代贞观年间。相传玄奘大师西行取经归来途经此地，见山川形胜与印度灵鹫山极为相似，便命名为'小灵山'，并命弟子在此修建寺院，就是今天的祥符禅寺前身。千年之后，1994年中国佛教协会会长赵朴初先生提出'五方五佛'之论，认为东方尚缺一座大佛，于是灵山大佛应运而生，2009年梵宫落成，终于形成了今天的灵山胜境格局。千年佛缘，冥冥之中自有天意~ 表情：惊讶|动作：右手放身前"

    # ── 交通 ──
    if any(w in m for w in ["交通", "怎么去", "坐车", "公交", "开车"]):
        return "从无锡市区出发，可以乘坐88路或89路公交车直达灵山胜境，车程约1小时；如果自驾，导航搜索'灵山胜境'即可，景区有大型停车场，停车费10元/次。从无锡火车站打车过来约40分钟，费用在80-100元左右。景区入口就在太湖边上，交通还是很方便的~ 表情：开心|动作：右手放胸前"

    # ── 灵山精舍 ──
    if any(w in m for w in ["灵山精舍", "住宿", "酒店", "住"]):
        return "灵山精舍是景区内的一家禅意酒店，装修风格简约雅致，融入了'天人合一'的传统园林文化理念。住在这里可以体验早课、品茶和素斋，深度感受佛教文化的宁静。周边马山镇也有不少酒店和民宿，价格从几百到上千元不等，适合不同预算。如果想住两三天慢慢游览，推荐考虑~ 表情：开心|动作：右手放胸前"

    # ── 拍照 / 打卡推荐 ──
    if any(w in m for w in ["拍照", "打卡", "摄影", "好看", "最美"]):
        return "灵山胜境处处是景，推荐几个最佳拍照点位：📸 大照壁前拍'华夏第一壁'与太湖同框；📸 五印坛城水边拍藏式建筑倒影；📸 佛前广场仰拍88米大佛全身；📸 大佛平台俯瞰太湖全景；📸 菩提大道春季花海；📸 梵宫内部琉璃壁画。早晨和黄昏光线最柔和，随便一拍都是大片~ 表情：开心|动作：右手放胸前"

    # ── 游览季节 ──
    if any(w in m for w in ["季节", "时候", "春天", "秋天", "几月"]):
        return "灵山胜境四季皆宜！春季（3-5月）菩提花开、樱花烂漫，九龙灌浴的水幕在阳光下能看到彩虹；夏季（6-8月）虽热但菩提大道浓荫蔽日，梵宫和博览馆内有空调也很舒服；秋季（9-11月）银杏金黄，气温宜人，是游览黄金期；冬季（12-2月）游客少，雪中的梵宫和大佛别有禅意。春秋两季是最佳选择~ 表情：开心|动作：右手放胸前"

    # ── 综合介绍 ──
    if any(w in m for w in ["灵山", "胜境", "景区", "景点", "介绍", "有什么"]):
        return "灵山胜境是国家5A级旅游景区，坐落在无锡太湖西北岸，占地约30万平方米。核心景点沿着中轴线依次排开：灵山大照壁→五明桥→佛足坛→五智门→菩提大道→九龙灌浴→阿育王柱→百子戏弥勒→祥符禅寺→灵山大佛→梵宫→五印坛城→曼飞龙塔。最精华的是88米高的灵山大佛和被称为'东方卢浮宫'的灵山梵宫。建议游玩时间4-6小时。您对哪个景点最感兴趣呢？ 表情：开心|动作：右手放胸前"

    # ── 误认纠正：你是豆包吗？ ──
    if any(w in m for w in ["豆包", "doubao", "dou bao"]):
        return "我不是豆包哦……我是小云，灵山胜境景区的AI数字人导游🌿 我只为这片山水和千年佛缘代言，不来自任何其他平台。如果您想了解灵山大佛、梵宫、九龙灌浴的故事，或者需要推荐游览路线，我随时为您解答~ 表情：难过|动作：右手放头上"

    # ── 问候 / 你是谁 ──
    if any(w in m for w in ["你好", "嗨", "你是谁", "叫什么", "介绍自己"]):
        return "你好！我是小云，灵山胜境景区的AI数字人导游👋 我对灵山的历史文化、每个景点的故事、游览路线和实用信息都很熟悉，您想去哪个景点、想了解什么，问我就可以。比如'灵山大佛有多高？'、'有什么推荐路线？'、'梵宫有什么好看的？'，我都随时为您解答~ 表情：开心|动作：右手放胸前"

    # ── 默认 ──
    return '关于您问的这个问题，小云建议您试试问我这些：灵山大佛有多高？梵宫有什么看点？九龙灌浴几点开始？门票多少钱？有什么推荐路线？我会用景区知识库中的真实数据为您详细解答~ 表情：开心|动作：右手放胸前'


def mock_reply_en(user_message: str) -> str:
    """English mock replies for common tourist questions (no API key fallback)."""
    m = user_message.lower()

    if any(w in m for w in ["buddha", "big buddha", "88", "bronze", "how tall"]):
        return ("The Lingshan Grand Buddha is 88 meters tall, made of 2000 bronze plates weighing about 725 tons "
                "— one of China's tallest bronze standing Buddhas! The right hand forms the Fearless Mudra "
                "and the left the Wish-Granting Mudra. Climb the 216 steps to the foot platform to 'embrace "
                "the Buddha's feet' for blessings and enjoy panoramic views of Taihu Lake. "
                "Best photos at the front plaza, especially at sunrise or sunset~ 表情：有趣|动作：右手放身前")

    if any(w in m for w in ["dragon", "bathing", "show", "fountain"]):
        return ("The Nine Dragons Bathing the Buddha is a highlight! The 27.5m sculpture features nine bronze "
                "dragons circling a giant lotus. 4-5 shows daily — music plays, water jets soar dozens of meters, "
                "the lotus opens, and a statue of the young Buddha rises. After the show you can collect "
                "'Eight Merit Water' from the dragon mouths for good luck. Shows start around 10 AM~ 表情：惊讶|动作：右手放身前")

    if any(w in m for w in ["brahma palace", "palace", "art", "wood carving"]):
        return ("Brahma Palace is called 'The Oriental Buddhist Art Palace' — 72,000 sqm housing Dongyang wood "
                "carvings, Dunhuang murals, Jingdezhen porcelain, and cloisonné enamel. The centerpiece is "
                "the Avatamsaka World stained glass mural with 1600+ glass pieces. Don't miss the daily "
                "Auspicious Ode musical performance in the main hall. Plan at least an hour to explore~ 表情：有趣|动作：右手放身前")

    if any(w in m for w in ["route", "recommend", "itinerary", "tour"]):
        return ("I recommend three routes: 🏛️ Cultural Route (~6h) — Grand Buddha, Brahma Palace, Mandala, "
                "Xiangfu Temple; 🌿 Nature Route (~5h) — Nine Dragons, Bodhi Avenue, Buddha summit views, "
                "Tibetan-style pagoda; 👨‍👩‍👧 Family Route (~4h) — Nine Dragons show, Buddha Hand Square, "
                "Hundred Children sculpture, Brahma Palace, prayer wheels. Which interests you? 表情：开心|动作：右手放胸前")

    if any(w in m for w in ["ticket", "price", "cost", "how much", "fee"]):
        return ("Adult ticket: 210 yuan. Half-price (105 yuan): seniors 60-69 and full-time students. "
                "Free: seniors 70+ and children under 1.4m. The ticket covers Nine Dragons show and "
                "Brahma Palace visit. Guide service is extra (from 300 yuan). "
                "Tip: buy online in advance for occasional discounts~ 表情：开心|动作：右手放胸前")

    if any(w in m for w in ["open", "hours", "time", "when"]):
        return ("Lingshan is open year-round! Summer (Apr-Oct): 7:00-17:30. Winter (Nov-Mar): 7:30-17:00. "
                "Nine Dragons show: 4-5 times daily, starting ~10 AM (20 min each). "
                "Brahma Palace Auspicious Ode: 10:35, 11:30, 14:00, 16:00. "
                "Arrive before 9 AM to beat the crowds~ 表情：开心|动作：右手放胸前")

    if any(w in m for w in ["food", "eat", "restaurant", "vegetarian"]):
        return ("Brahma Palace vegetarian buffet is very popular — 50 yuan/person, great variety. "
                "Several restaurants in the area serve vegetarian noodle sets (35 yuan) — tasty and affordable. "
                "For a refined experience, Lingshan Jingshe offers premium vegetarian dining (reservation required). "
                "Note: as a Buddhist cultural site, no meat dishes are served in the scenic area~ 表情：开心|动作：右手放胸前")

    if any(w in m for w in ["hello", "hi", "hey", "who are you"]):
        return ("Hello! I'm Xiao Yun, the AI digital human tour guide at Lingshan Scenic Area 👋 "
                "I know everything about the Grand Buddha, Brahma Palace, Nine Dragons show, "
                "and more. Ask me anything — like 'How tall is the Buddha?' or 'What route should I take?' "
                "— I'm here to help! 表情：开心|动作：右手放胸前")

    # Default fallback
    return ("About your question — I'm still learning about this topic. Try asking me: "
            "How tall is the Grand Buddha? What's inside Brahma Palace? When is the Nine Dragons show? "
            "How much are tickets? What route do you recommend? I'll be happy to help! 表情：开心|动作：右手放胸前")


def build_first_greeting(language: str = "zh") -> str:
    """首次打招呼消息"""
    if language == "en":
        return ("Hello! 👋 I'm Xiao Yun, your AI tour guide at Lingshan Scenic Area! "
                "We have the 88m Grand Buddha, Brahma Palace, Nine Dragons Bathing, and many more attractions. "
                "What would you like to know? I can share history, recommend routes, and help you find "
                "restrooms and restaurants~ 表情：开心|动作：鞠躬")
    return ("你好！👋 我是你的 AI 导游**小云**，欢迎来到灵山胜境！"
            "这里有大佛、梵宫、九龙灌浴等众多景点，你想了解什么呢？"
            "我可以为你讲解历史文化、推荐游览路线，还可以帮你找洗手间和餐厅哦~ 表情：开心|动作：鞠躬")


def parse_emotion_action(text: str) -> tuple[str, str]:
    """
    从回复文本末尾解析「表情：xxx|动作：xxx」标记。
    返回 (emotion, action)，未匹配时返回 ('开心', '无')。
    """
    import re
    pattern = r'表情[：:]\s*(.{1,4})\s*[|｜]\s*动作[：:]\s*(.{1,6})'
    match = re.search(pattern, text)
    if match:
        emotion = match.group(1).strip()
        action = match.group(2).strip()
        valid_emotions = {'生气', '困惑', '难过', '开心', '有趣', '惊讶'}
        valid_actions = {'鞠躬', '右手放胸前', '右手放身前', '右手放头上', '无'}
        if emotion not in valid_emotions:
            emotion = '开心'
        if action not in valid_actions:
            action = '无'
        return emotion, action
    return '开心', '无'
