# 测试报告

测试日期：2026-10-25
测试环境：Windows 11 / Chrome 150.0.7871.129 / Node.js 22.17.1 / npm 10.9.2
构建环境：Vue 3.5.44 / Vue Router 4.6.4 / Vite 6.4.5 / @vitejs/plugin-vue 5.2.4

> 追加验证：订单送达时限改为按打开的时间动态生成后，已重新执行 `npm run build`、`npm run test:ui`、`npm run test:ui:interactions` 与 `npm run test:ui:audit`，全部通过，控制台错误与页面异常均为 0。

---

## 1. 构建

```bash
npm run build
```

结果：

```text
vite v6.4.5 building for production...
✓ 76 modules transformed.
dist/index.html                   0.74 kB
dist/assets/index-*.css          94.98 kB
dist/assets/index-*.js          235.95 kB
✓ built in 1.86s
```

状态：通过。

---

## 2. 主流程回归

```bash
npm run test:ui
```

脚本从空浏览器状态开始，执行：

1. 打开工作台（下线）。
2. 切换上线。
3. 点击抢单。
4. 查看抢单确认弹窗。
5. 确认抢单，进入订单详情。
6. 点击“我已取货”。
7. 点击“确认送达”。
8. 进入送达结果页。
9. 返回工作台。
10. 打开订单大厅。
11. 打开筛选弹层。
12. 打开个人中心。
13. 打开设置。
14. 切换工作城市为合肥。
15. 打开路线页。
16. 打开收益页。
17. 返回工作台，确认城市切换生效。

结果：

- 13 张流程截图生成。
- 控制台错误：0。
- 页面异常：0。
- 最终状态：`ok: true`。

截图：

- `screenshots/01-home-offline.png`
- `screenshots/02-home-online.png`
- `screenshots/03-grab-modal.png`
- `screenshots/04-order-detail-accepted.png`
- `screenshots/05-order-detail-picked.png`
- `screenshots/06-result-delivered.png`
- `screenshots/07-hall.png`
- `screenshots/08-hall-filter.png`
- `screenshots/09-profile.png`
- `screenshots/10-settings.png`
- `screenshots/11-route.png`
- `screenshots/12-earnings.png`
- `screenshots/13-home-hefei.png`

---

## 3. 交互断言

```bash
npm run test:ui:interactions
```

共 17 项检查，全部通过：

| #   | 检查项                   | 结果 |
| --- | ------------------------ | ---- |
| 1   | 离线抢单弹出上线提示     | 通过 |
| 2   | 确认后自动上线并进入详情 | 通过 |
| 3   | 订单状态更新为“我已取货” | 通过 |
| 4   | 联系相关方弹层打开       | 通过 |
| 5   | 问题反馈可提交并关闭     | 通过 |
| 6   | 待取货订单显示转单入口   | 通过 |
| 7   | 转单后订单回到订单大厅   | 通过 |
| 8   | 类型筛选生效             | 通过 |
| 9   | 签到弹层打开             | 通过 |
| 10  | 签到成功                 | 通过 |
| 11  | 设置开关状态变化         | 通过 |
| 12  | 刷新后设置开关持久化     | 通过 |
| 13  | 刷新后签到状态持久化     | 通过 |
| 14  | 重置数据返回下线首页     | 通过 |
| 15  | 取消订单进入已取消结果页 | 通过 |
| 16  | 结果页满意度可选择       | 通过 |
| 17  | 结果页无横向溢出         | 通过 |

控制台错误：0。
页面异常：0。

---

## 4. 多视口布局审计

```bash
npm run test:ui:audit
```

覆盖 10 个路由：

`/home`、`/hall`、`/tasks`、`/route`、`/earnings`、`/profile`、`/settings`、订单详情（待取货）、订单详情（配送中）、订单结果。

覆盖 3 个视口：

- 360 × 800（小屏手机）
- 390 × 844（主流手机）
- 1440 × 1000（桌面端居中手机画框）

结果：

| 视口        | 路由数 | 横向溢出 | 控制台错误 | 页面异常 |
| ----------- | -----: | -------: | ---------: | -------: |
| 360 × 800   |     10 |        0 |          0 |        0 |
| 390 × 844   |     10 |        0 |          0 |        0 |
| 1440 × 1000 |     10 |        0 |          0 |        0 |

完整结构化结果保存在 `screenshots/audit-report.json`。

---

## 5. 生产构建冒烟测试

启动 `npm run preview` 后使用 Chrome 访问 `http://127.0.0.1:4173/#/home`：

```json
{
  "title": "首页 · 狗团众包",
  "route": "#/home",
  "orderCards": 3,
  "navItems": 5,
  "sheetTitle": "选择工作城市",
  "overflow": 0,
  "errors": []
}
```

状态：通过。Hash 路由、静态资源、本地数据和生产构建均可正常加载。

---

## 6. 截图说明

- `screenshots/desktop-home.png`：桌面端居中手机画框。
- `screenshots/mobile-390-*.png`：390 宽度页面截图。
- `screenshots/14-result-final.png`：修复装饰元素溢出后的结果页。
- `screenshots/15-production-build.png`：生产构建预览。
- `screenshots/16-route-nanjing.png`：南京双单路线页。
- `screenshots/17-result-cancelled.png`：已取消订单结果页。

---

## 7. 未覆盖范围与限制

以下项目未在本次环境中验证：

- **物理 Android / iPhone 真机**：当前环境只使用 Chrome 移动视口，未连接真实手机。建议在目标 WebView 中再检查字体、安全区、状态栏高度和滚动惯性。
- **iOS Safari**：未测试 `-webkit-` 行为、橡皮筋滚动和 100dvh 差异。
- **真实地图 / 导航**：项目刻意使用 SVG 地图，没有接入地图 SDK 或定位权限。
- **真实账号 / 订单 / 支付 / 推送**：全部按要求排除。
- **屏幕阅读器**：已使用语义化按钮、`aria-label`、`role="switch"` 等，但未进行 VoiceOver / TalkBack 全量走查。
- **大规模数据**：当前 12 条订单，未测试数百条订单下的长列表性能。

---

## 8. 验收建议

1. 在 390–430 宽度的真实 Android WebView 打开首页，检查顶部状态栏与底部安全区。
2. 完整走一遍“上线 → 抢单 → 取货 → 送达 → 结果页”。
3. 切换南京 / 合肥 / 杭州，确认订单池与地图标签同步。
4. 在订单大厅尝试筛选与城市切换。
5. 在设置页检查开关、重置、反馈和协议弹层。
6. 刷新页面，确认本地状态保留；执行“重置数据”后确认恢复初始状态。
