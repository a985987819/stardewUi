# 请我喝杯咖啡 ☕

> [返回 README 目录](../README.md#请我喝杯咖啡-)

先说清楚最重要的一件事：**捐款不是购买授权。**

组件库的使用本身**不收取任何费用**，且永远免费。支持是自愿的：不影响项目的免费使用，
也不会改变许可证——无论你是否支持、金额多少，本项目都保持非商业许可。
费用**仅用于项目维护**：组件开发、缺陷修复、文档完善与素材制作。

## 去哪扫码

捐赠页面已经把两个收款码放好了，不用在这里翻：

**→ [https://a985987819.github.io/stardewUi/support](https://a985987819.github.io/stardewUi/support)**

页面上有微信支付和支付宝两个码，任选其一。金额随意，不必凑整。

## 为什么会有这一节

维护一个组件库的开销是看不见的：27 个组件、上百个测试、每次发版前把 tarball 装进
临时项目真跑一遍、修掉「npm 把非商业许可显示成 MIT」这种只有发出去才会暴露的问题。

这些活儿没人派工。咖啡钱不解决问题，但能让搬砖的手速稍微快一点。

---

## 怎么换成我自己的二维码

> 这一节面向**接手维护这个仓库的人**。如果你只是来用库的，跳过即可。

收款码由演示站的 `/support` 页面读取，路径和文件名都是写死的：

```text
public/donate/wechat-qr.png
public/donate/alipay-qr.png
```

### 1. 生成二维码

| 渠道 | 从哪拿 |
| --- | --- |
| 微信 | 微信「赞赏」功能，生成收款码后保存图片 |
| 支付宝 | 支付宝「收款码」页面，保存图片 |

### 2. 替换文件

保留原文件名，直接覆盖即可：

```bash
# 微信
cp ~/Downloads/wechat-qr.png public/donate/wechat-qr.png

# 支付宝
cp ~/Downloads/alipay-qr.png public/donate/alipay-qr.png
```

### 3. 尺寸与体积

| 项 | 要求 | 原因 |
| --- | --- | --- |
| 格式 | **必须是真正的 PNG** | 微信/支付宝扫码对 JPEG 识别不稳。存成 JPEG 再改扩展名不行——文件头仍是 JPEG |
| 尺寸 | ≥ 400×400 | 页面按 240px 展示，太小的原图在高分屏会糊 |
| 留白 | 保留 | 部分扫码器对贴边二维码识别率下降 |
| 体积 | 各 < 100KB | 两个码会在首屏并排加载，占的是所有人的等待时间 |
| 内容 | 只留二维码本身 | 品牌底色和转账留言不要保留，见下 |

**裁剪建议**：手机截图里通常带平台 Logo、品牌底色和转账留言。
把二维码区域单独裁出来保存为 PNG，页面会把它放进羊皮纸木框里，
去掉那些元素反而更协调。

裁完自检：文件头必须是 `89 50 4E 47`，不是 `FF D8 FF`（JPEG）。
`bun run test:run` 现在会校验这一点，不用手动查。

### 4. 提交并推送

```bash
git add public/donate/
git commit -m "docs: 更新赞赏码"
git push
```

### 5. 确认没放错

本地跑一遍：

```bash
bun run build:app && bun run preview
```

打开 `http://localhost:4173/stardewUi/support`，两个码都应该是**白底、
只有二维码**。如果还看到绿色或蓝色大色块，说明裁剪没到位。

> 不想公开收款码？把两个文件换回占位图即可，或者在
> `src/pages/Support.tsx` 的 `METHODS` 里删掉对应条目。
> 不写金额、不放码、不解释，也是完全可以的选择。

## 同步更新的位置

换码时确认这几处都指向同一份：

| 位置 | 内容 |
| --- | --- |
| `public/donate/*.png` | 二维码图片本体（演示站与本地预览读这里） |
| `src/pages/Support.tsx` | 页面文案、`METHODS` 列表与 `AFDIAN_SLUG` |
| `src/i18n/dictionaries.ts` | `header.sponsor` 导航项文案（若要改按钮文字） |

README 里不再直接嵌二维码，只链接到捐赠页面，所以**换码不用改 README**。

## 爱发电

除了一次性扫码，页面还嵌了爱发电的卡片，支持**按月定额**：

```text
src/pages/Support.tsx → AFDIAN_SLUG = 'malatang1'
```

换自己的主页只改这一处。页面上的 iframe 指向
`https://afdian.com/leaflet?slug=<slug>`，底部的兜底链接指向
`https://afdian.com/<slug>`——爱发电改版或网络不通时至少还有一条路。

**为什么没有照抄官方那段 `<script>`**：它的响应式靠内联脚本读
`document.body.clientWidth` 来改iframe 宽度，而 React 不会渲染作为子节点的
`<script>`，照抄的结果是 iframe 尺寸不对且无从修复。这里改用 CSS
`width:100% + max-width:640px`，效果相同，且不需要放开 CSP 的
`unsafe-inline`。测试里有一条断言盯着这点。

## 其他平台

没装微信的话，下面这些渠道也可以：

- **爱发电**：<https://afdian.com/malatang1> —— 按月定额，也支持一次性
- **GitHub Sponsors**：仓库主页右上角 `Sponsor` 按钮（维护者开通后可见）

### GitHub 的 Sponsor 按钮

`.github/FUNDING.yml` 已配好，指向爱发电。注意 GitHub 支持的平台键里
**没有爱发电**，只能走 `custom` 自定义 URL；而且 `custom` 与其他平台键
**互斥**，同时填只有 `custom` 生效。写 `afdian: malatang1` 这种无效键名
会被静默忽略——看起来配好了，实际一点用都没有。

## 不接受捐赠的情况

为了避免误会，也说清楚**不接受**什么：

- ❌ 付费定制开发、接单改需求
- ❌ 把库用于商业项目的授权费
- ❌ 代持、开源项目"挂名合作"
- ❌ 任何形式的商业许可

这些都不是钱的问题，是许可证边界的问题。商业用途请直接放弃使用本库。