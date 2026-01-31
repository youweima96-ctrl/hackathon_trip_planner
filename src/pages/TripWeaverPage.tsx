import { Link } from 'react-router-dom'

export function TripWeaverPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <header className="bg-white/80 backdrop-blur shadow-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
              T
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-800">TripWeaver</h1>
              <p className="text-sm text-gray-600">多人协同决策的 AI 旅行规划与执行系统</p>
            </div>
          </div>
          <Link to="/" className="text-amber-700 hover:text-amber-900">返回首页</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <section className="mb-10">
          <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 p-8 shadow">
            <h2 className="text-3xl font-extrabold text-amber-900 mb-4">TripWeaver：群体决策 OS</h2>
            <p className="text-gray-700 leading-relaxed">
              统一解决同一群人“要去哪/干什么”的协同决策，从活动发起、方案生成、投票收敛，到执行预订、AA 记账与年度回顾，形成闭环的高频使用与高情感价值。
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-bold text-amber-800 mb-4">1. 商机（真实痛点 + 足够大的市场）</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">大盘：团体出行 & 在线旅行是巨量市场</h4>
              <ul className="space-y-2 text-gray-700">
                <li>在线旅游、团体出行、团队活动为千亿美元级大盘，疫情后强力修复</li>
                <li>覆盖朋友结伴、家庭多代同游、公司团建、社团活动等高客单价场景</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">结构性缺口：缺乏真正为团体服务的工具</h4>
              <ul className="space-y-2 text-gray-700">
                <li>传统 OTA 聚焦机酒，多人决策依赖“截图+群聊+Excel”</li>
                <li>协同文档不懂旅游/预算/路线</li>
                <li>AI 行程助手只懂“一个人”，难以协调 4–8 人并闭环到预订</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">高频场景：旅行之外的日常决策</h4>
              <ul className="space-y-2 text-gray-700">
                <li>今晚吃什么、周末去哪、部门团建做啥、下个长假是否旅行</li>
                <li>现状是“群里吵 + 一两个人累死 + 半数不满意”</li>
                <li>从“大旅行”扩展到“日常活动”，把低频变高频，打造群体决策 OS</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-bold text-amber-800 mb-4">2. 挑战（用户/技术/商业/生态）</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">用户行为挑战</h4>
              <ul className="space-y-2 text-gray-700">
                <li>旅行规划低频，用户不愿多装仅为“偶尔旅行”的 App</li>
                <li>多人协同需大部分参与，但现实中不愿填问卷或只用微信/WhatsApp</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">技术挑战</h4>
              <ul className="space-y-2 text-gray-700">
                <li>多人实时协同的冲突、撤回与恢复</li>
                <li>离线可用与自动同步</li>
                <li>行程数据的安全与隐私</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">商业与竞争挑战</h4>
              <ul className="space-y-2 text-gray-700">
                <li>用户为“机票/酒店/活动”付费而非“规划工具”</li>
                <li>巨头可复制功能并内嵌到自家 App</li>
                <li>旅游对宏观环境敏感</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">生态与合规挑战</h4>
              <ul className="space-y-2 text-gray-700">
                <li>依赖地图 API、OTA、票务数据，一旦涨价限流断供影响大</li>
                <li>必须满足 GDPR/PIPL 等隐私法规</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-bold text-amber-800 mb-4">3. 产品 / 服务创新：群体决策系统</h3>
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">3.1 底层定位：决策引擎</h4>
              <ul className="space-y-2 text-gray-700">
                <li>统一处理吃饭/周末/团建/长线旅行等场景</li>
                <li>收集时间、预算、偏好、禁忌</li>
                <li>生成 2–3 套多人可接受的 Pareto 方案</li>
                <li>群内投票与讨论快速收敛</li>
                <li>一键生成计划（时间表、地点、预算、AA 账单），可接 OTA/本地服务预订</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">3.2 高频活动层：吃饭 / 周末 / 团建 / 微旅行</h4>
              <ul className="space-y-2 text-gray-700">
                <li>Bot 嵌入微信/WhatsApp/Telegram</li>
                <li>自动问卷收集偏好，生成 2–3 个地点/活动组合（含时间与预算）</li>
                <li>群内直接投票，无需跳出 App</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">3.3 低频旅行层：多人长线旅行模式</h4>
              <ul className="space-y-2 text-gray-700">
                <li>收集假期长度、签证、预算、节奏偏好</li>
                <li>输出不同风格方案（轻松/打卡/美食），标注人群适配与可能疲劳</li>
                <li>方案投票后自动行程 + 预订清单 + AA 分摊表</li>
                <li>行中根据延误/天气动态调整</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">3.4 情感与忠诚层：团体档案 & 年度回顾</h4>
              <ul className="space-y-2 text-gray-700">
                <li>生成小队年报：次数、城市、活动类型</li>
                <li>足迹地图与时间线，可一键海报分享</li>
                <li>把 TripWeaver 变成关系的时间轴</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-bold text-amber-800 mb-4">4. 商业模型（谁付钱、为什么付、钱从哪来）</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">4.1 服务对象</h4>
              <ul className="space-y-2 text-gray-700">
                <li>C 端小团体：高频使用与旅行 GMV</li>
                <li>B 端机构：旅行社/地接社/企业/学校，SaaS 收入与高客单价</li>
                <li>生态合作方：OTA、本地活动、保险、签证等，提供供应与分佣</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">4.2 收入结构</h4>
              <ul className="space-y-2 text-gray-700">
                <li>交易分佣：导流机酒/当地活动/团建包，团体订单金额更高</li>
                <li>B 端 SaaS：白标“团体决策+行程协同”，按账号/团队/年收费</li>
                <li>增值订阅/服务：高级 AI 规划、顾问协助、签证模板、保险建议、记忆存储 Pro</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">4.3 成本结构</h4>
              <ul className="space-y-2 text-gray-700">
                <li>轻资产：研发与设计为主要固定成本</li>
                <li>服务器/API/客服随用户量近线性增长</li>
                <li>不自建库存，依赖合作方 API，避免重资产</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">闭环与增长空间</h4>
              <ul className="space-y-2 text-gray-700">
                <li>成本可控线性，收入随活跃度与合作放大</li>
                <li>闭环：高频活动→高客单交易→分佣 + SaaS + 增值</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-bold text-amber-800 mb-4">5. 高增长系统设计（飞轮 + 忠诚度 + 渐进式扩张）</h3>
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">飞轮一：高频活动 → 使用习惯 → 长线旅行</h4>
              <ul className="space-y-2 text-gray-700">
                <li>每周用 TripWeaver 决定吃什么/周末去哪</li>
                <li>长线旅行产生高交易与情感价值，促成持续使用</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">飞轮二：数据与推荐</h4>
              <ul className="space-y-2 text-gray-700">
                <li>沉淀时间、地点、参与人、偏好、反馈</li>
                <li>模型学习群体真实喜好，推荐更准，决策成本更低</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">飞轮三：组织者与团体忠诚</h4>
              <ul className="space-y-2 text-gray-700">
                <li>组织者显著减负，愿意在新群体重复使用</li>
                <li>团体档案与年度回顾强化留存与不可替代性</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">飞轮四：B 端与生态合作</h4>
              <ul className="space-y-2 text-gray-700">
                <li>输出高意向团体订单，提高转化与议价能力</li>
                <li>方案更具竞争力，进一步提升 GMV 与合作依赖</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-amber-700 mb-3">阶段性扩张路径</h4>
              <ul className="space-y-2 text-gray-700">
                <li>Phase 0–1：聚焦 1–2 城市/学校/公司高频活动与小微旅行</li>
                <li>Phase 1–2：接入 OTA，稳定分佣，试点 B 端白标</li>
                <li>Phase 2+：开放 API，成为各平台的群体活动决策引擎，向更多国家与语言扩张</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div className="rounded-xl bg-amber-900 text-white p-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-xl font-semibold mb-2">核心创新</h4>
              <p className="text-amber-100">
                群体决策引擎 + 聊天场景 + OTA 执行 + 情感留存 的组合式系统创新
              </p>
            </div>
            <Link
              to="/publish"
              className="mt-4 md:mt-0 inline-flex items-center px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 transition-colors"
            >
              立即体验
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
