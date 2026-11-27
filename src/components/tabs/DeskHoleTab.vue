<template>
  <view class="desk-container" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="desk-phone" :class="{ 'lamp-on': isLampLit, 'windy': isWindowOpen }">
      <!-- 1. 书桌小景全貌 (Diorama Desk View) -->
      <view v-show="!isHolePageActive" class="page desk-page" :class="{ 'night-mode': currentDesk.weather === 'night' }">
        <view class="wall" :class="['wp-' + currentWallpaperStyle, { 'night-room': currentDesk.weather === 'night' }]"><view class="tex tex-noise" /></view>

        <!-- 顶栏信息与状态 (独立安全区，彻底杜绝与窗帘杆重叠) -->
        <view class="desk-header">
          <view class="desk-meta-box" @tap="handleViewOwnerProfile" title="点击查看资料">
            <image class="owner-ava" :src="currentDesk.ownerAvatar" mode="aspectFill" />
            <view class="meta-texts">
              <view class="title-row">
                <text class="desk-title-inline">{{ isVisitingOther ? (currentDesk.ownerName + '的桌洞') : '我的桌洞' }}</text>
                <text class="desk-tag">{{ isVisitingOther ? '客座' : '书房' }}</text>
              </view>
              <text class="sub-text">{{ weatherIcon }} {{ weatherLabel }}{{ liveTempC !== null ? ' ' + liveTempC + '°C' : '' }} · {{ terrainLabel }}</text>
            </view>
          </view>

          <view class="desk-top-actions">
            <view v-if="isVisitingOther" class="back-pill-btn" @tap="exitVisiting">
              <text>‹ 回我桌洞</text>
            </view>
            <view class="shop-pill-btn" @tap="openDecorShop" title="桌洞装扮工坊">
              <text class="shop-badge">🎨</text>
              <text class="shop-text">装扮</text>
            </view>
            <view class="gear-btn" @tap="gearMenuVisible = !gearMenuVisible" title="天气与地形设置">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.36a1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.64 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.64a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.36 9v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z"/>
              </svg>
            </view>
          </view>
        </view>

        <!-- 窗帘：轻触换款式 -->
        <view class="curtains" :data-style="curtainStyle" title="点一下换窗帘" @tap="cycleCurtain">
          <view class="curtain cl"><view class="tex tex-noise" /></view>
          <view class="curtain cr"><view class="tex tex-noise" /></view>
        </view>

        <!-- 窗户与风景 -->
        <view
          class="window-frame"
          :class="{ 'open': isWindowOpen }"
          :data-w="currentDesk.weather"
          title="点一下推窗 / 关窗"
          @tap="toggleWindow"
        >
          <view class="scenery">
            <view class="svgsun" />
            <view class="cloud c1" />
            <view class="cloud c2" />
            <view class="stars" />
            <view class="rainlayer" />
            <!-- 柔雾分层地形插画 SVG (告别生硬灰块，随地形/城市切换) -->
            <svg v-if="currentTerrain === 'ancient'" class="sc-terrain-svg" viewBox="0 0 220 112" preserveAspectRatio="none">
              <path d="M0,112 L0,76 Q45,52 95,72 Q155,48 220,70 L220,112 Z" fill="#9BB19B" opacity="0.55"/>
              <path d="M0,112 L0,86 L24,72 L52,86 L82,66 L116,86 L146,68 L178,86 L204,74 L220,84 L220,112 Z" fill="#63554B"/>
              <path d="M18,74 Q24,66 30,74 M74,68 Q82,58 90,68 M138,70 Q146,60 154,70" stroke="#473B33" stroke-width="2.5" fill="none"/>
              <circle cx="82" cy="82" r="2.4" fill="#F6C16C"/>
              <circle cx="146" cy="84" r="2.4" fill="#F6C16C"/>
            </svg>
            <svg v-else-if="currentTerrain === 'city'" class="sc-terrain-svg" viewBox="0 0 220 112" preserveAspectRatio="none">
              <path d="M0,112 L0,62 L24,62 L24,44 L48,44 L48,68 L74,68 L74,36 L106,36 L106,64 L138,64 L138,48 L168,48 L168,66 L194,66 L194,52 L220,52 L220,112 Z" fill="#8A9DAD" opacity="0.55"/>
              <path d="M0,112 L0,76 L32,76 L32,58 L62,58 L62,82 L94,82 L94,50 L128,50 L128,78 L162,78 L162,62 L192,62 L192,80 L220,80 L220,112 Z" fill="#607385"/>
              <g fill="#FFE49E" opacity="0.8">
                <rect x="40" y="66" width="4" height="5"/><rect x="49" y="66" width="4" height="5"/>
                <rect x="104" y="58" width="4" height="5"/><rect x="114" y="58" width="4" height="5"/>
                <rect x="104" y="68" width="4" height="5"/><rect x="170" y="70" width="4" height="5"/>
              </g>
            </svg>
            <svg v-else-if="currentTerrain === 'mountain'" class="sc-terrain-svg" viewBox="0 0 220 112" preserveAspectRatio="none">
              <path d="M0,112 L48,38 L94,86 L152,24 L220,92 L220,112 Z" fill="#8BA59B" opacity="0.6"/>
              <path d="M138,40 L152,24 L166,40 L158,37 L152,43 L146,37 Z" fill="#FFFFFF" opacity="0.88"/>
              <path d="M0,112 Q55,74 118,92 Q172,72 220,94 L220,112 Z" fill="#6B8A6E"/>
            </svg>
            <svg v-else class="sc-terrain-svg" viewBox="0 0 220 112" preserveAspectRatio="none">
              <path d="M0,112 L0,78 Q60,72 110,78 Q165,84 220,74 L220,112 Z" fill="#6AA8CC" opacity="0.75"/>
              <path d="M0,112 L0,90 Q55,84 115,92 Q175,98 220,88 L220,112 Z" fill="#4D8EB5"/>
              <rect x="166" y="42" width="12" height="36" rx="2" fill="#FFFDF6"/>
              <rect x="166" y="52" width="12" height="6" fill="#C95E46"/>
              <circle cx="172" cy="40" r="5" fill="#FFE69A"/>
            </svg>
            <view class="sc-birds"><view /><view /><view /></view>
            <view
              class="drift-letter"
              :class="{ 'crumpled': isLetterCrumpled }"
              title="窗外飘来一封信（点击读取）"
              @tap.stop="catchDriftLetter"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#8B6F4E" stroke-width="1.6"><rect x="3" y="5.5" width="18" height="13" rx="2" fill="#F6EEDB"/><path d="m3 7 9 6 9-6"/></svg>
            </view>
          </view>
          <view class="sash left"><view class="pane" /></view>
          <view class="sash right"><view class="pane" /></view>
        </view>

        <view class="windowsill" />
        <!-- 斜射进桌面的温暖窗光光束 -->
        <view class="desk-sunbeam" />
        <view class="motes"><view /><view /><view /><view /><view /></view>

        <!-- 春日多肉 (可浇水) -->
        <view class="succulent" :class="{ 'watering': isWatering }" title="点一下浇水" @tap="waterSucculent">
          <view class="foliage">
            <view class="blf l" /><view class="blf r" /><view class="blf c" />
            <view class="lf lf1" /><view class="lf lf2" /><view class="lf lf3" />
            <view class="lf lf4" /><view class="lf lf5" /><view class="lf lf6" />
          </view>
          <view class="plant-pot" :class="'pot-' + currentPotStyle" />
          <view class="water-can">
            <svg viewBox="0 0 24 24" fill="none" stroke="#7B8B94" stroke-width="1.5"><path d="M7 9h8v10H7z" fill="#E8EEF2"/><path d="M15 11l5-3.5v8L15 13"/><path d="M9.5 9V5.5h3.5V9"/><path d="M7 12h8"/></svg>
          </view>
          <view class="drop d1" />
          <view class="drop d2" />
          <view class="drop d3" />
        </view>

        <!-- 墙上木质便签板 (左墙留言板) -->
        <view class="board" title="桌洞留言板" @tap="boardModalVisible = true">
          <view class="bd">
            <view
              v-for="(n, i) in previewBoardNotes"
              :key="n.id"
              class="mini"
              :class="'m' + (i + 1)"
            >
              {{ n.content }}
            </view>
          </view>
        </view>

        <!-- 右墙便签墙 (与左墙留言板形成左右对称景深，需求 15) -->
        <view class="right-sticky-board" title="右墙便签墙" @tap="stickyWallModalVisible = true">
          <view class="rsb-bd">
            <text class="rsb-tag">便签墙</text>
            <view
              v-for="(sw, idx) in previewStickyNotes"
              :key="sw.id"
              class="rsb-mini"
              :class="'s' + (idx + 1)"
            >
              {{ sw.content }}
            </view>
          </view>
        </view>

        <!-- 拟物写字课桌主体 -->
        <view class="school-desk" :class="'desk-style-' + currentDeskStyle">
          <view class="lamp-glow" />
          <view class="osh" style="left:124px;bottom:388px;width:74px" />
          <view class="osh" style="left:44px;bottom:374px;width:68px" />
          <view class="osh" style="right:166px;bottom:348px;width:38px" />
          <view class="osh" style="right:52px;bottom:328px;width:54px" />

          <!-- 折纸小飞机 -->
          <view class="sd-plane" />

          <!-- 复古黄铜台灯 (点一下开关灯) -->
          <view class="desk-lamp" :class="{ 'lit': isLampLit }" title="点一下开关灯" @tap="toggleLamp">
            <view class="shade" />
            <view class="stem" />
            <view class="base" />
          </view>

          <!-- 左前：精装手账日记本 (一本书，带书签丝带) -->
          <view class="notebook hardcover-book" title="写今天的日记" @tap="openJournalWithAnim">
            <text class="hb-title">手账日记</text>
            <text class="hb-sub">{{ currentDesk.diaryEntries.length }} 篇</text>
            <view class="hb-ribbon" />
          </view>

          <!-- 中后：精致木框立式课程表 (需求 18) -->
          <view class="desk-schedule-card" title="桌面课程表" @tap="scheduleModalVisible = true">
            <view class="dsc-clip" />
            <text class="dsc-title">📅 课程表</text>
            <text class="dsc-next">{{ nextScheduleBrief }}</text>
          </view>

          <!-- 中前：冒热气的陶瓷咖啡杯 -->
          <view class="cup" title="热气袅袅的咖啡">
            <view class="cup-steam"><view class="st s1" /><view class="st s2" /><view class="st s3" /></view>
            <view class="cup-css" />
          </view>

          <!-- 右侧：桌面宠物小窝 (不与右墙便签墙撞车，点击可去装扮切换宠物) -->
          <view class="desk-pet-nest" title="我的桌宠小窝" @tap="openDecorShop">
            <text class="pet-emoji">{{ currentPetSlot === 'cat' ? '🐱' : currentPetSlot === 'shiba' ? '🐕' : currentPetSlot === 'bird' ? '🐦' : '🐾' }}</text>
            <view class="pet-cushion" />
          </view>

          <!-- 课桌面板与前脸几何 -->
          <view class="sd-top" />
          <view class="sd-front" />
          <view class="sd-leg l" />
          <view class="sd-leg r" />

          <!-- 🕳️ 立体桌洞暗格入口 (点击穿透潜入) -->
          <view class="desk-hole" title="点击潜入桌洞" @tap="openDrawer">
            <view class="hole-book" />
            <view class="hole-slip hs1" />
            <view class="hole-slip hs2" />
            <view class="hb-side" />
          </view>
        </view>
      </view>

      <!-- 2. 镜头潜入放大转场 -->
      <view v-if="isHoleZooming" class="hole-zoom play" />

      <!-- 3. 「桌洞里」实木分隔抽屉全景空间 (Page Hole) -->
      <view v-if="isHolePageActive" class="page hole-page hole-organizer-page">
        <view class="tex tex-noise" />
        <view class="hole-top-light" />

        <!-- 极简顶栏 -->
        <view class="hole-org-header">
          <view class="hole-back-btn" @tap="closeHolePage">‹ 回到桌前</view>
          <text class="hole-org-title">桌 洞 里</text>
          <text class="hole-org-count">{{ 6 + (currentDesk.extraSlots?.length || 0) }} 格收纳</text>
        </view>

        <!-- 实木分隔抽屉主体（严格预留底部悬浮导航栏安全区，绝不遮挡！） -->
        <scroll-view scroll-y class="hole-org-scroll">
          <view class="drawer-organizer">
            <!-- 第一排：拍立得相册 + 墨绿丝绒首饰盒 -->
            <view class="org-row-top">
              <view class="wood-comp" @tap="activeHoleModule = 'album'">
                <text class="comp-badge">{{ currentDesk.albumPhotos?.length || 0 }} 张</text>
                <view class="prop-album">
                  <text class="prop-album-t">足迹相册</text>
                  <text class="prop-album-s">POLAROID</text>
                  <view class="album-polaroid-peek">
                    <view class="album-polaroid-pic" />
                  </view>
                </view>
                <text class="comp-label">相 册</text>
              </view>

              <view class="wood-comp" @tap="activeHoleModule = 'jewelry'">
                <text class="comp-badge">{{ currentDesk.jewelry?.length || 0 }} 件</text>
                <view class="prop-jewelry">
                  <text class="jw-ico">🏅</text>
                  <text class="jw-ico">🍂</text>
                  <view class="jewelry-clasp" />
                </view>
                <text class="comp-label">首饰盒</text>
              </view>
            </view>

            <!-- 第二排 C 位：完整保留原版 3D 带锁金属「心情盒子」（点击开锁翻盖 + 纸卷舒展！） -->
            <view class="wood-comp org-row-mid" @tap="toggleBigBox">
              <text class="comp-badge">{{ isBoxOpen ? '已解锁' : '点击开锁' }}</text>
              <view class="bigbox org-bigbox" :class="{ 'open': isBoxOpen, 'unlocked': isBoxUnlocked }">
                <view class="bb-hinge" />
                <view class="bb-lid">
                  <view class="lf">
                    <view class="tex tex-metal" />
                    <view class="bb-lock" />
                  </view>
                  <view class="li" @tap.stop>
                    <view class="tex tex-metal" />
                    <view class="hud-tl">
                      <text class="hm">11月</text>
                      <view
                        v-for="(dateStr, dIdx) in holeTimelineDates"
                        :key="dateStr"
                        class="hud-node"
                        :class="{ 'on': selectedHoleDateIdx === dIdx }"
                        @tap="selectHoleDate(dIdx)"
                      >
                        <view class="hf">✦</view>
                        <view class="hd">{{ dateStr === '全部' ? '全部' : (dateStr.split('月')[1] || dateStr) }}</view>
                      </view>
                    </view>
                  </view>
                </view>

                <view class="bb-inside" @tap.stop>
                  <view class="rolls">
                    <view
                      v-for="roll in renderedHoleRolls"
                      :key="roll.id"
                      class="roll"
                      :class="{ 'dim': roll.isDim }"
                      :style="roll.style"
                      @tap="openHoleRoll(roll)"
                    >
                      <view class="rc" :style="{ '--mc': getPaperMoodColor(roll.color) }" />
                      <view class="rtag">{{ roll.cleanDate }}</view>
                    </view>
                  </view>
                  <view v-if="renderedHoleRolls.filter(r => !r.isDim).length === 0" class="hole-empty">那天没写字</view>
                </view>

                <view class="bb-body"><view class="tex tex-metal" /></view>
                <view class="bb-depth" />
              </view>
              <text class="comp-label">心情盒子 · 3D 铁盒</text>
            </view>

            <!-- 第三排：皮革「收藏的纸条」翻页册（带彩色分类索引条） + 牛皮记账本 -->
            <view class="org-row-lower">
              <view class="wood-comp" @tap="activeHoleModule = 'collected'">
                <text class="comp-badge">{{ Math.max(1, (currentDesk.noteCategories?.length || 1) - 1) }} 分类</text>
                <view class="prop-notes-book">
                  <text class="pnb-title">收藏的纸条</text>
                  <text class="pnb-sub">含收到的慢信</text>
                  <view class="index-tab t1">心</view>
                  <view class="index-tab t2">旅</view>
                  <view class="index-tab t3">灵</view>
                </view>
                <text class="comp-label">收藏纸条 & 分类</text>
              </view>

              <view class="wood-comp" @tap="activeHoleModule = 'ledger'">
                <text class="comp-badge">¥{{ ledgerBalance }}</text>
                <view class="prop-ledger">
                  <view class="ledger-band" />
                  <text class="pl-title">记账本</text>
                  <text class="pl-sub">本月结余</text>
                </view>
                <text class="comp-label">记账本</text>
              </view>
            </view>

            <!-- 第四排：绯红丝带礼物盒 + 虚线扩展槽位 -->
            <view class="org-row-bottom">
              <view class="wood-comp" @tap="activeHoleModule = 'gifts'">
                <text class="comp-badge">{{ currentDesk.gifts?.length || 0 }} 件</text>
                <view class="prop-gift">
                  <text class="gift-bow">🎀</text>
                </view>
                <text class="comp-label">收到礼物</text>
              </view>

              <view class="wood-comp extra-slot-comp" @tap="activeHoleModule = 'extra'">
                <text class="comp-badge">{{ currentDesk.extraSlots?.length || 0 }} 个</text>
                <text class="extra-plus-ico">＋</text>
                <text class="comp-label extra-lbl">扩展槽位</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 4. 纸卷舒展阅读弹窗 (Unroll Modal) -->
      <view v-if="unrollModalVisible && activeUnrollData" class="modal show" id="rollModal" @tap.self="closeUnrollModal">
        <view class="backdrop" @tap="closeUnrollModal" />
        <view class="card" id="rollCard">
          <view class="unroll-wrap go">
            <view class="paper detail-paper unroll-paper go" :style="{ background: getPaperMoodColor(activeUnrollData.color) }">
              <view class="dhead">
                <image v-if="activeUnrollData.avatar" class="dhead-ava" :src="activeUnrollData.avatar" mode="aspectFill" />
                <text class="dhead-author">{{ activeUnrollData.author }}</text>
              </view>
              <view class="dtxt">{{ activeUnrollData.content }}</view>
              <view class="dmeta">
                <text>{{ activeUnrollData.date }}</text>
                <text>{{ activeUnrollData.type === 'diary' ? ' · 心情随笔' : ' · 邻里来信' }}</text>
              </view>
            </view>
          </view>
          <view class="act-grid" style="margin-top:14px">
            <button v-if="activeUnrollData.type === 'diary'" class="act" @tap="pinDiaryToWindow">贴到窗台</button>
            <button v-if="activeUnrollData.type === 'letter'" class="act" @tap="replyToUnrollSender">提笔回信</button>
            <button class="act danger" @tap="closeUnrollModal">收回去</button>
          </view>
        </view>
      </view>

      <!-- 5. 墙上留言板弹窗 (Board Modal) -->
      <view v-if="boardModalVisible" class="modal show" @tap.self="boardModalVisible = false">
        <view class="backdrop" @tap="boardModalVisible = false" />
        <view class="card">
          <button class="mclose" @tap="boardModalVisible = false">✕</button>
          <view class="modal-title"><h3>桌洞留言板</h3></view>
          <view class="note-list">
            <view
              v-for="note in currentDesk.windowNotes"
              :key="note.id"
              class="paper"
              :style="{ background: getPaperMoodColor(note.color) }"
              @tap="openNoteFromBoard(note)"
            >
              <view class="dtxt">{{ note.content }}</view>
              <view class="dmeta">
                <text>{{ note.authorName }} · {{ formatRelativeTime(note.createdAt) }}</text>
                <text>❤️ {{ note.likes }}</text>
              </view>
            </view>
          </view>
          <view class="act-grid" style="margin-top:14px; grid-template-columns: 1fr;">
            <button class="act" @tap="openHandwritingPad">✍️ 写一张贴上板子</button>
          </view>
        </view>
      </view>

      <!-- 6. 足迹册弹窗 (Album Modal) -->
      <view v-if="albumModalVisible" class="modal show" @tap.self="albumModalVisible = false">
        <view class="backdrop" @tap="albumModalVisible = false" />
        <view class="card">
          <button class="mclose" @tap="albumModalVisible = false">✕</button>
          <view class="modal-title"><h3>足迹 · 时间线</h3></view>
          <view class="tl">
            <view class="tl-item">
              <view class="node">📍</view>
              <view class="date">11 月 02 日 · 15:40</view>
              <view class="paper tl-slip" style="background:#DEE9DB">
                <p>中央公园 · 长椅 No.7<br>帮传了 3 张纸条，收到 1 张谢谢帖</p>
                <view class="foot"><text class="when">停留 2 小时</text><text class="share-flag">集到 1 枚邮票</text></view>
              </view>
            </view>
            <view class="tl-item">
              <view class="node">☕</view>
              <view class="date">10 月 18 日 · 11:02</view>
              <view class="paper tl-slip" style="background:#FBE7C4">
                <p>阳光咖啡馆 · 窗边位<br>捡到一张浅烘手冲配方，回贴了一张祈愿条</p>
                <view class="foot"><text class="when">停留 1 小时</text><text class="share-flag">集到 1 枚邮票</text></view>
              </view>
            </view>
            <view class="tl-item">
              <view class="node">🚲</view>
              <view class="date">09 月 30 日 · 16:20</view>
              <view class="paper tl-slip" style="background:#DDE4F0">
                <p>镜湖绿道 · 驿站长椅<br>晚风很舒服，微风把纸条吹向了远方</p>
                <view class="foot"><text class="when">停留 40 分钟</text><text class="share-flag">集到 1 枚邮票</text></view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 7. 设置菜单浮层 (Gear Menu) -->
      <view v-if="gearMenuVisible" class="gear-pop-overlay" @tap.self="gearMenuVisible = false">
        <view class="gear-card">
          <view class="gear-head">
            <text class="gear-title">书桌小景设置</text>
            <text class="gear-close" @tap="gearMenuVisible = false">✕</text>
          </view>
          <view class="gear-row" @tap="cycleWeather">
            <text class="row-label">切换天气氛围</text>
            <text class="row-val">{{ weatherIcon }} {{ weatherLabel }} ›</text>
          </view>
          <view class="gear-row" @tap="cycleTerrain">
            <text class="row-label">切换窗外地形楼房</text>
            <text class="row-val">{{ terrainLabel }} ›</text>
          </view>
          <view class="gear-row" @tap="cycleCurtain">
            <text class="row-label">更换窗帘花色</text>
            <text class="row-val">款式 {{ curtainStyle }} / 5 ›</text>
          </view>
          <view class="gear-row" @tap="toggleLamp">
            <text class="row-label">台灯开关</text>
            <text class="row-val">{{ isLampLit ? '亮起 💡' : '关闭 🌙' }}</text>
          </view>
          <view class="gear-row" @tap="openHandwritingPad">
            <text class="row-label">写一张小纸条</text>
            <text class="row-val">提笔书写 ✍️ ›</text>
          </view>
        </view>
      </view>

      
      <!-- 9. 窗外飘来的信 · 阅读弹窗 (Letter Modal) -->
      <view v-if="driftLetterModalVisible && activeDriftLetter" class="modal show" @tap.self="driftLetterModalVisible = false">
        <view class="backdrop" @tap="driftLetterModalVisible = false" />
        <view class="card">
          <button class="mclose" @tap="driftLetterModalVisible = false">✕</button>
          <view class="paper detail-paper" :style="{ background: getPaperMoodColor(activeDriftLetter.mood) }">
            <view class="dtxt">{{ activeDriftLetter.content }}</view>
            <view class="dmeta">
              <span class="ava">{{ activeDriftLetter.sender.slice(0, 1) }}</span>
              <text>{{ activeDriftLetter.sender }} · 从窗外飘来</text>
            </view>
          </view>
          <view class="letter-actions">
            <button class="drop-btn" @tap="dropDriftLetter">丢进纸篓</button>
            <button class="reply-btn" @tap="replyToDriftLetter">回一张纸条</button>
          </view>
        </view>
      </view>

      <!-- 10. 独立全屏装扮新页面 (换桌子/换窗帘/换墙纸/换窗景/养宠物预留，需求 14) -->
      <DeskDecorPage
        :visible="decorShopVisible"
        :statusBarHeight="statusBarHeight"
        :modelValue="decorConfig"
        @close="decorShopVisible = false"
        @save="handleSaveDecor"
      />

      <!-- 11. 右墙便签墙抽屉 (需求 15) -->
      <view v-if="stickyWallModalVisible" class="v3-drawer-mask" @tap="stickyWallModalVisible = false">
        <view class="v3-drawer-sheet" @tap.stop>
          <view class="v3-bar" />
          <text class="v3-h1">📝 右墙便签墙</text>
          <scroll-view scroll-y class="v3-scroll">
            <view v-for="sw in currentDesk.stickyWallNotes || []" :key="sw.id" class="v3-note-card">
              <text class="v3-note-txt">{{ sw.content }}</text>
            </view>
          </scroll-view>
          <view class="v3-add-row">
            <input class="v3-inp" v-model="newStickyText" placeholder="写一张便签贴上右墙..." maxlength="60" />
            <view class="v3-btn" @tap="submitStickyNote">贴上</view>
          </view>
        </view>
      </view>

      <!-- 12. 桌面课程表抽屉 (需求 18) -->
      <view v-if="scheduleModalVisible" class="v3-drawer-mask" @tap="scheduleModalVisible = false">
        <view class="v3-drawer-sheet" @tap.stop>
          <view class="v3-bar" />
          <text class="v3-h1">📅 桌面课程表</text>
          <view class="v3-days-row">
            <view
              v-for="d in weekDays"
              :key="d"
              class="v3-day-pill"
              :class="{ active: activeScheduleDay === d }"
              @tap="activeScheduleDay = d"
            >
              {{ d }}
            </view>
          </view>
          <scroll-view scroll-y class="v3-scroll">
            <view v-if="filteredSchedule.length === 0" class="v3-empty">{{ activeScheduleDay }} 暂无课程，享受慢时光～</view>
            <view v-for="sc in filteredSchedule" :key="sc.id" class="v3-sch-row">
              <text class="v3-sch-time">{{ sc.time }}</text>
              <view class="v3-sch-info">
                <text class="v3-sch-title">{{ sc.title }}</text>
                <text v-if="sc.room" class="v3-sch-room">📍 {{ sc.room }}</text>
              </view>
              <text class="v3-del" @tap="removeScheduleItem(sc.id)">✕</text>
            </view>
          </scroll-view>
          <view class="v3-add-row">
            <input class="v3-inp short" v-model="newCourseTime" placeholder="09:00" maxlength="8" />
            <input class="v3-inp" v-model="newCourseTitle" placeholder="课程/日程名称" maxlength="20" />
            <view class="v3-btn" @tap="addScheduleItem">添加</view>
          </view>
        </view>
      </view>

      <!-- 13. 桌洞模块化收纳盒抽屉 (相册/收藏分类/记账本/礼物/首饰盒/扩展槽位，需求 16) -->
      <view v-if="activeHoleModule" class="v3-drawer-mask" @tap="activeHoleModule = null">
        <view class="v3-drawer-sheet" @tap.stop>
          <view class="v3-bar" />

          <template v-if="activeHoleModule === 'album'">
            <text class="v3-h1">📷 桌洞相册</text>
            <scroll-view scroll-y class="v3-scroll">
              <view class="v3-album-grid">
                <view v-for="ph in currentDesk.albumPhotos || []" :key="ph.id" class="v3-album-card">
                  <image class="v3-album-img" :src="ph.url" mode="aspectFill" />
                  <text class="v3-album-cap">{{ ph.caption }}</text>
                  <text class="v3-album-loc">{{ ph.location }} · {{ ph.dateStr }}</text>
                </view>
              </view>
            </scroll-view>
          </template>

          <template v-else-if="activeHoleModule === 'collected'">
            <text class="v3-h1">📌 收藏的纸条（支持自定义分类）</text>
            <scroll-view scroll-x class="v3-cat-scroll" :show-scrollbar="false">
              <view class="v3-cat-row">
                <view
                  v-for="cat in currentDesk.noteCategories || ['全部']"
                  :key="cat"
                  class="v3-cat-pill"
                  :class="{ active: activeNoteCat === cat }"
                  @tap="activeNoteCat = cat"
                >
                  {{ cat }}
                </view>
              </view>
            </scroll-view>
            <view class="v3-add-row compact">
              <input class="v3-inp" v-model="newCategoryName" placeholder="新建收藏分类（如：读书摘抄）" maxlength="10" />
              <view class="v3-btn" @tap="addNoteCategory">+ 分类</view>
            </view>
            <scroll-view scroll-y class="v3-scroll">
              <view v-for="note in filteredDrawerNotes" :key="note.id" class="v3-note-card">
                <view class="v3-note-head">
                  <text class="v3-note-from">{{ note.senderName }}</text>
                  <text class="v3-note-cat">{{ note.category || '未分类' }}</text>
                </view>
                <text class="v3-note-txt">{{ note.fullContent }}</text>
              </view>
            </scroll-view>
          </template>

          <template v-else-if="activeHoleModule === 'ledger'">
            <text class="v3-h1">📒 手账记账本（结余 ¥{{ ledgerBalance }}）</text>
            <scroll-view scroll-y class="v3-scroll">
              <view v-for="item in currentDesk.ledger || []" :key="item.id" class="v3-ledger-row">
                <view>
                  <text class="v3-lg-title">{{ item.category }} · {{ item.note }}</text>
                  <text class="v3-lg-date">{{ item.dateStr }}</text>
                </view>
                <text class="v3-lg-amt" :class="item.type">{{ item.type === 'expense' ? '-' : '+' }}¥{{ item.amount }}</text>
              </view>
            </scroll-view>
            <view class="v3-add-row">
              <view class="v3-type-btn" @tap="newLedgerType = newLedgerType === 'expense' ? 'income' : 'expense'">
                {{ newLedgerType === 'expense' ? '支出' : '收入' }}
              </view>
              <input class="v3-inp short" type="digit" v-model="newLedgerAmount" placeholder="金额" />
              <input class="v3-inp" v-model="newLedgerNote" placeholder="备注(如咖啡)" maxlength="14" />
              <view class="v3-btn" @tap="addLedgerEntry">记一笔</view>
            </view>
          </template>

          <template v-else-if="activeHoleModule === 'gifts'">
            <text class="v3-h1">🎁 收到的礼物</text>
            <scroll-view scroll-y class="v3-scroll">
              <view v-for="g in currentDesk.gifts || []" :key="g.id" class="v3-gift-row">
                <text class="v3-gift-ico">{{ g.icon }}</text>
                <view class="v3-gift-info">
                  <text class="v3-gift-name">{{ g.name }}（{{ g.from }} 赠）</text>
                  <text class="v3-gift-msg">{{ g.message }}</text>
                </view>
                <text class="v3-gift-date">{{ g.dateStr }}</text>
              </view>
            </scroll-view>
          </template>

          <template v-else-if="activeHoleModule === 'jewelry'">
            <text class="v3-h1">💍 首饰盒</text>
            <scroll-view scroll-y class="v3-scroll">
              <view v-for="j in currentDesk.jewelry || []" :key="j.id" class="v3-gift-row" @tap="toggleJewelryEquip(j.id)">
                <text class="v3-gift-ico">{{ j.icon }}</text>
                <view class="v3-gift-info">
                  <text class="v3-gift-name">{{ j.name }}</text>
                  <text class="v3-gift-msg">{{ j.rarity }}</text>
                </view>
                <view class="v3-equip-pill" :class="{ on: j.equipped }">{{ j.equipped ? '已佩戴' : '佩戴' }}</view>
              </view>
            </scroll-view>
          </template>

          <template v-else-if="activeHoleModule === 'extra'">
            <text class="v3-h1">➕ 桌洞扩展槽位</text>
            <scroll-view scroll-y class="v3-scroll">
              <view v-for="slot in currentDesk.extraSlots || []" :key="slot.id" class="v3-gift-row">
                <text class="v3-gift-ico">{{ slot.icon }}</text>
                <view class="v3-gift-info">
                  <text class="v3-gift-name">{{ slot.name }}</text>
                  <text class="v3-gift-msg">{{ slot.desc }}</text>
                </view>
              </view>
            </scroll-view>
            <view class="v3-add-row">
              <input class="v3-inp" v-model="newSlotName" placeholder="新建扩展盒子（如：票根夹 / 书单）" maxlength="10" />
              <view class="v3-btn" @tap="confirmAddSlot">添加槽位</view>
            </view>
          </template>
        </view>
      </view>

      <!-- 8. 真迹画板手写纸条 -->
      <HandwritingPad
        v-if="handwritingPadVisible"
        actionConfirmText="💌 折起放进桌洞"
        defaultPattern="yellow"
        @confirm="onHandwritingConfirmed"
        @close="handwritingPadVisible = false"
      />
    </view>
  </view>
</template>


<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { DeskTheme, NotePaperColor, TerrainType } from "../../types";
import {
  getMyDeskData,
  saveMyDeskData,
  getOtherUserDeskData,
  postWindowNote,
  removeWindowNote,
  fetchRealtimeWeather,
  DeskHoleData,
  DeskDecorConfig,
  ScheduleItem,
  WindowNoteItem,
  DrawerSecretNote,
  DiaryMemoryItem
} from "../../services/deskService";
import { useAppState } from "../../composables/useAppState";
import HandwritingPad from "../common/HandwritingPad.vue";
import DeskDecorPage from "../modals/DeskDecorPage.vue";

const {
  statusBarHeight,
  userLocation,
  activeLandmark,
  myProfile,
  openChatWithFriend,
  targetVisitingDesk,
  openProfileByUserId,
  openMyProfileSheet
} = useAppState();

const currentDesk = ref<DeskHoleData>(getMyDeskData());
const isVisitingOther = ref(false);

watch(targetVisitingDesk, (target) => {
  if (target) {
    visitUserDesk(target.userId, target.name, target.avatar);
    targetVisitingDesk.value = null;
  }
}, { immediate: true });

function visitUserDesk(userId: string, name: string, avatar: string) {
  currentDesk.value = getOtherUserDeskData(userId, name, avatar);
  isVisitingOther.value = true;
}

function exitVisiting() {
  currentDesk.value = getMyDeskData();
  isVisitingOther.value = false;
}

function handleViewOwnerProfile() {
  if (isVisitingOther.value) {
    openProfileByUserId && openProfileByUserId(currentDesk.value.ownerId);
  } else {
    openMyProfileSheet && openMyProfileSheet();
  }
}

// 拟物状态
const isWindowOpen = ref(false);
const isWatering = ref(false);
const isLampLit = ref(true);
const curtainStyle = ref(1);

const gearMenuVisible = ref(false);
const boardModalVisible = ref(false);
const albumModalVisible = ref(false);
const handwritingPadVisible = ref(false);

// 🕳️ 桌洞次级空间状态
const isHoleZooming = ref(false);
const isHolePageActive = ref(false);

const isBoxUnlocked = ref(false);
const isBoxOpen = ref(false);
const selectedHoleDateIdx = ref(0);

const isBookOpen = ref(false);
const bookDateIdx = ref(0);
const isBookFlipping = ref(false);

// 纸卷舒展阅读状态
const unrollModalVisible = ref(false);
const isUnrolling = ref(false);
const activeUnrollData = ref<{
  title: string;
  author: string;
  avatar?: string;
  date: string;
  content: string;
  color: string;
  type: 'diary' | 'letter';
  rawItem?: any;
} | null>(null);


// 👑 会员装扮选购工坊 (收费项目)
const decorShopVisible = ref(false);
const activeDecorCategory = ref<'curtain' | 'pot' | 'desk'>('curtain');

const currentPotStyle = ref('terracotta');
const currentDeskStyle = ref('classic');

const curtainList = [
  { id: 1, name: '亚麻原色帘', isVip: false, color: '#FBF6EA' },
  { id: 2, name: '碎花薄粉帘', isVip: true, color: '#F6E3DC' },
  { id: 3, name: '雾蓝细格帘', isVip: true, color: '#DCE6EF' },
  { id: 4, name: '鼠尾草绿帘', isVip: true, color: '#CBD4C7' },
  { id: 5, name: '落日暖橙帘', isVip: true, color: '#F3D8CF' },
];

const potList = [
  { id: 'terracotta', name: '经典陶土红盆', isVip: false, color: '#C4906F' },
  { id: 'ceramic', name: '景德镇素白瓷', isVip: true, color: '#F0ECE1' },
  { id: 'woodlog', name: '原木老树桩盆', isVip: true, color: '#825C38' },
  { id: 'teapot', name: '复古铁皮水壶盆', isVip: true, color: '#7B8B94' },
];

const deskStyleList = [
  { id: 'classic', name: '原木黄暖木桌', isVip: false, color: '#E0C79D' },
  { id: 'cherry', name: '樱花暖木手账桌', isVip: true, color: '#D89A88' },
  { id: 'retro', name: '学院复古墨绿桌', isVip: true, color: '#526E54' },
  { id: 'modern', name: '极简素白静谧桌', isVip: true, color: '#C9CFD6' },
];

function openDecorShop() {
  decorShopVisible.value = true;
}

// ============ V3 无损增量状态（实时天气/地形、右墙便签墙、课程表、装扮新页、桌洞6大收纳盒） ============
const liveTempC = ref<number | null>(null);
const stickyWallModalVisible = ref(false);
const scheduleModalVisible = ref(false);
const activeHoleModule = ref<"album" | "collected" | "ledger" | "gifts" | "jewelry" | "extra" | null>(null);

const newStickyText = ref("");
const weekDays: ScheduleItem["day"][] = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const activeScheduleDay = ref<ScheduleItem["day"]>("周一");
const newCourseTime = ref("10:00");
const newCourseTitle = ref("");
const activeNoteCat = ref("全部");
const newCategoryName = ref("");
const newLedgerType = ref<"expense" | "income">("expense");
const newLedgerAmount = ref("");
const newLedgerNote = ref("");
const newSlotName = ref("");

const currentWallpaperStyle = ref<DeskDecorConfig["wallpaperStyle"]>(currentDesk.value.decor?.wallpaperStyle || "warm");
const currentTerrain = ref<TerrainType>(currentDesk.value.decor?.terrain || currentDesk.value.terrain || "city");
const currentPetSlot = ref<DeskDecorConfig["petSlot"]>(currentDesk.value.decor?.petSlot || "none");

// 同步持久化装扮到原有 ref
if (currentDesk.value.decor) {
  curtainStyle.value = currentDesk.value.decor.curtainStyle || 1;
  currentDeskStyle.value = currentDesk.value.decor.deskStyle || "classic";
}

const decorConfig = computed<DeskDecorConfig>(() => ({
  deskStyle: (["classic", "walnut", "cream", "sakura"].includes(currentDeskStyle.value)
    ? currentDeskStyle.value
    : "classic") as DeskDecorConfig["deskStyle"],
  curtainStyle: curtainStyle.value,
  wallpaperStyle: currentWallpaperStyle.value,
  terrain: currentTerrain.value,
  petSlot: currentPetSlot.value,
}));

const TERRAIN_NAMES: Record<TerrainType, string> = {
  city: "都市楼宇",
  ancient: "古城青瓦",
  mountain: "远山松林",
  coastal: "海滨灯塔",
};
const terrainLabel = computed(() => TERRAIN_NAMES[currentTerrain.value] || "都市楼宇");

const previewStickyNotes = computed(() => (currentDesk.value.stickyWallNotes || []).slice(0, 3));

const nextScheduleBrief = computed(() => {
  const list = currentDesk.value.schedule || [];
  if (!list.length) return "今日空闲";
  return `${list[0].time} ${list[0].title.slice(0, 5)}`;
});

const filteredSchedule = computed(() =>
  (currentDesk.value.schedule || []).filter((s) => s.day === activeScheduleDay.value)
);

const filteredDrawerNotes = computed(() => {
  const list = currentDesk.value.drawerNotes || [];
  if (activeNoteCat.value === "全部") return list;
  return list.filter((n) => n.category === activeNoteCat.value);
});

const ledgerBalance = computed(() =>
  (currentDesk.value.ledger || []).reduce((acc, cur) => acc + (cur.type === "income" ? cur.amount : -cur.amount), 0)
);

async function syncLiveWeatherAndTerrain() {
  if (isVisitingOther.value) return;
  const lat = activeLandmark.value?.latitude ?? userLocation.value.latitude;
  const lon = activeLandmark.value?.longitude ?? userLocation.value.longitude;
  if (activeLandmark.value?.terrain) {
    currentTerrain.value = activeLandmark.value.terrain;
  }
  const live = await fetchRealtimeWeather(lat, lon);
  if (live) {
    currentDesk.value.weather = live.weather === "rainy" ? ("rain" as any) : live.weather;
    if (typeof live.tempC === "number") liveTempC.value = live.tempC;
  }
}

onMounted(() => {
  syncLiveWeatherAndTerrain();
});

watch(activeLandmark, () => {
  syncLiveWeatherAndTerrain();
});

function cycleTerrain() {
  const order: TerrainType[] = ["city", "ancient", "mountain", "coastal"];
  const next = order[(order.indexOf(currentTerrain.value) + 1) % order.length];
  currentTerrain.value = next;
  if (!currentDesk.value.decor) currentDesk.value.decor = { ...decorConfig.value };
  currentDesk.value.decor.terrain = next;
  currentDesk.value.terrain = next;
  saveMyDeskData(currentDesk.value);
  uni.showToast({ title: `窗外地形已切换为「${TERRAIN_NAMES[next]}」`, icon: "none" });
}

function handleSaveDecor(next: DeskDecorConfig) {
  currentDeskStyle.value = next.deskStyle;
  curtainStyle.value = next.curtainStyle;
  currentWallpaperStyle.value = next.wallpaperStyle;
  currentTerrain.value = next.terrain;
  currentPetSlot.value = next.petSlot;
  currentDesk.value.decor = { ...next };
  currentDesk.value.terrain = next.terrain;
  if (!isVisitingOther.value) saveMyDeskData(currentDesk.value);
  uni.showToast({ title: "桌洞装扮已生效 ✨", icon: "success" });
}

function submitStickyNote() {
  if (!newStickyText.value.trim()) return;
  if (!currentDesk.value.stickyWallNotes) currentDesk.value.stickyWallNotes = [];
  currentDesk.value.stickyWallNotes.unshift({
    id: "sw_" + Date.now(),
    authorId: myProfile.value.id,
    authorName: myProfile.value.name,
    authorAvatar: myProfile.value.avatar,
    content: newStickyText.value.trim(),
    color: "yellow",
    createdAt: Date.now(),
    rotationDeg: 0,
    likes: 1,
    isMine: true,
  });
  saveMyDeskData(currentDesk.value);
  newStickyText.value = "";
  uni.showToast({ title: "已贴上右墙便签墙 📝", icon: "success" });
}

function addScheduleItem() {
  if (!newCourseTitle.value.trim()) return;
  if (!currentDesk.value.schedule) currentDesk.value.schedule = [];
  currentDesk.value.schedule.push({
    id: "sc_" + Date.now(),
    day: activeScheduleDay.value,
    time: newCourseTime.value.trim() || "09:00",
    title: newCourseTitle.value.trim(),
  });
  saveMyDeskData(currentDesk.value);
  newCourseTitle.value = "";
  uni.showToast({ title: "已加入课程表 📅", icon: "success" });
}

function removeScheduleItem(id: string) {
  currentDesk.value.schedule = (currentDesk.value.schedule || []).filter((s) => s.id !== id);
  saveMyDeskData(currentDesk.value);
}

function addNoteCategory() {
  const name = newCategoryName.value.trim();
  if (!name) return;
  if (!currentDesk.value.noteCategories) currentDesk.value.noteCategories = ["全部"];
  if (!currentDesk.value.noteCategories.includes(name)) {
    currentDesk.value.noteCategories.push(name);
    saveMyDeskData(currentDesk.value);
    activeNoteCat.value = name;
    newCategoryName.value = "";
    uni.showToast({ title: `已新增收藏分类「${name}」`, icon: "success" });
  }
}

function addLedgerEntry() {
  const amt = Number(newLedgerAmount.value);
  if (!amt || amt <= 0) {
    uni.showToast({ title: "请输入有效金额", icon: "none" });
    return;
  }
  const now = new Date();
  if (!currentDesk.value.ledger) currentDesk.value.ledger = [];
  currentDesk.value.ledger.unshift({
    id: "lg_" + Date.now(),
    type: newLedgerType.value,
    amount: amt,
    category: newLedgerType.value === "expense" ? "日常" : "收入",
    note: newLedgerNote.value.trim() || "手账记账",
    dateStr: `${now.getMonth() + 1}-${now.getDate()}`,
  });
  saveMyDeskData(currentDesk.value);
  newLedgerAmount.value = "";
  newLedgerNote.value = "";
  uni.showToast({ title: "记账成功 📒", icon: "success" });
}

function toggleJewelryEquip(id: string) {
  (currentDesk.value.jewelry || []).forEach((j) => {
    if (j.id === id) j.equipped = !j.equipped;
  });
  saveMyDeskData(currentDesk.value);
  uni.showToast({ title: "首饰佩戴状态已更新 💍", icon: "none" });
}

function confirmAddSlot() {
  const name = newSlotName.value.trim();
  if (!name) return;
  if (!currentDesk.value.extraSlots) currentDesk.value.extraSlots = [];
  currentDesk.value.extraSlots.push({
    id: "slot_" + Date.now(),
    name,
    icon: "📦",
    desc: "自定义扩展手账收纳盒",
  });
  saveMyDeskData(currentDesk.value);
  newSlotName.value = "";
  uni.showToast({ title: `已添加扩展槽位「${name}」`, icon: "success" });
}

function selectCurtainStyle(c: any) {
  curtainStyle.value = c.id;
  uni.showToast({
    title: c.isVip ? `👑 已换上会员专属【${c.name}】！` : `已换上【${c.name}】`,
    icon: 'none'
  });
}

function selectPotStyle(p: any) {
  currentPotStyle.value = p.id;
  uni.showToast({
    title: p.isVip ? `👑 已换上会员专属【${p.name}】！` : `已换上【${p.name}】`,
    icon: 'none'
  });
}

function selectDeskStyle(d: any) {
  currentDeskStyle.value = d.id;
  uni.showToast({
    title: d.isVip ? `👑 已换上会员专属【${d.name}】！` : `已换上【${d.name}】`,
    icon: 'none'
  });
}

// 💌 窗外信件读取与回信
const driftLetterModalVisible = ref(false);
const isLetterCrumpled = ref(false);
const activeDriftLetter = ref<{ mood: string; content: string; sender: string } | null>(null);

const DRIFT_LETTERS = [
  { mood: 'heart', content: '路过你的窗，微风很软，灯火很暖。祝今天好。', sender: '白露' },
  { mood: 'calm', content: '今天在这条街走了很久，想跟陌生的你说：生活不赶路，慢慢来。', sender: '拾光' },
  { mood: 'happy', content: '捡到你去年贴的折纸条，字迹还没褪色哦。抬头看看天空吧！', sender: '阿树' },
  { mood: 'calm', content: '窗外雨声很舒服，手冲咖啡香飘过来了～☕', sender: '小夏' },
  { mood: 'heart', content: '慢生活圈里，祝每一个路过窗前的人心情晴朗。', sender: '寻光客' }
];

function catchDriftLetter() {
  const p = DRIFT_LETTERS[Math.floor(Math.random() * DRIFT_LETTERS.length)];
  activeDriftLetter.value = p;
  driftLetterModalVisible.value = true;
}

function dropDriftLetter() {
  driftLetterModalVisible.value = false;
  isLetterCrumpled.value = true;
  uni.showToast({ title: '丢进了纸篓（窗外还会飘来别的信）🍂', icon: 'none' });
  setTimeout(() => {
    isLetterCrumpled.value = false;
  }, 8000);
}

function replyToDriftLetter() {
  if (!activeDriftLetter.value) return;
  const sender = activeDriftLetter.value.sender;
  driftLetterModalVisible.value = false;
  uni.showToast({ title: `提笔给 ${sender} 写回信... 💌`, icon: 'none' });
  if (openChatWithFriend) {
    openChatWithFriend('drift_friend', sender, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80');
  }
}

let lastWaterTime = 0;
let lastQuoteIdx = -1;
const DRIFT_QUOTES = [
  "路过你的窗，微风很软，灯火很暖。祝今天好。",
  "走得很累的时候，记得给桌洞里的自己留颗糖。",
  "生活节奏慢下来，好事情正在路上。",
  "窗外有云在游走，把烦恼折成纸船放走吧。",
  "今天也是值得被温柔对待的一天。",
  "把喜欢写在纸上，就算数。"
];

function toggleWindow() {
  isWindowOpen.value = !isWindowOpen.value;
  uni.showToast({
    title: isWindowOpen.value ? "轻推开窗，微风轻拂窗帘 🍃" : "合上木窗 · 室内重归静谧 🪟",
    icon: "none"
  });
}

function cycleCurtain() {
  curtainStyle.value = (curtainStyle.value % 5) + 1;
  const CURTAIN_NAMES = ["亚麻原色", "碎花薄粉", "雾蓝细格", "鼠尾草绿", "落日暖橙"];
  uni.showToast({ title: `换了窗帘：${CURTAIN_NAMES[curtainStyle.value - 1]}`, icon: "none" });
}

function waterSucculent() {
  const now = Date.now();
  if (now - lastWaterTime < 6000) {
    uni.showToast({ title: "它还不渴，等泥土干一点再来浇 🌿", icon: "none" });
    return;
  }
  lastWaterTime = now;
  isWatering.value = true;
  uni.showToast({ title: "多肉喝饱了，叶片水润润的 ✨", icon: "none" });
  setTimeout(() => {
    isWatering.value = false;
  }, 2200);
}

function toggleLamp() {
  isLampLit.value = !isLampLit.value;
  uni.showToast({
    title: isLampLit.value ? "台灯亮了 💡" : "台灯关了，早点睡 🌙",
    icon: "none"
  });
}

function cycleWeather() {
  const weathers: DeskHoleData["weather"][] = ["sunny", "rainy", "night"];
  const currIdx = weathers.indexOf(currentDesk.value.weather);
  const next = weathers[(currIdx + 1) % weathers.length];
  currentDesk.value.weather = next;
  saveMyDeskData(currentDesk.value);
}

function getInitialRealTimeWeather(): DeskHoleData["weather"] {
  const hour = new Date().getHours();
  // 晚上 18 点到次日早 6 点自动转为夜空星辰
  if (hour >= 18 || hour < 6) {
    return "night";
  }
  return "sunny";
}

// 自动根据真实时间初始化
if (!isVisitingOther.value) {
  currentDesk.value.weather = getInitialRealTimeWeather();
}

const weatherIcon = computed(() => {
  switch (currentDesk.value.weather) {
    case "sunny": return "☀️";
    case "rainy": return "🌧️";
    case "night": return "🌙";
    default: return "☀️";
  }
});

const weatherLabel = computed(() => {
  const hour = new Date().getHours();
  const timeStr = `${hour}:${new Date().getMinutes().toString().padStart(2, '0')}`;
  switch (currentDesk.value.weather) {
    case "sunny": return `午后晴空 · ${timeStr}`;
    case "rainy": return `窗前细雨 · ${timeStr}`;
    case "night": return `星空静谧 · ${timeStr}`;
    default: return `实时天气 · ${timeStr}`;
  }
});

const previewBoardNotes = computed(() => {
  return currentDesk.value.windowNotes.slice(0, 3);
});

// 潜入桌洞
function openDrawer() {
  isHoleZooming.value = true;
  setTimeout(() => {
    isHoleZooming.value = false;
    isHolePageActive.value = true;
    isBoxUnlocked.value = false;
    isBoxOpen.value = false;
    isBookOpen.value = false;
  }, 480);
}

function closeHolePage() {
  isHolePageActive.value = false;
  isBoxOpen.value = false;
  isBoxUnlocked.value = false;
  isBookOpen.value = false;
}

// 铁盒交互
function toggleBigBox() {
  if (isBoxOpen.value) {
    isBoxOpen.value = false;
    uni.showToast({ title: "合上了 📦", icon: "none" });
    return;
  }
  if (!isBoxUnlocked.value) {
    isBoxUnlocked.value = true;
    uni.showToast({ title: "咔哒，锁开了 🗝️", icon: "none" });
    setTimeout(() => {
      isBoxOpen.value = true;
    }, 450);
  } else {
    isBoxOpen.value = true;
  }
}

const holeTimelineDates = computed(() => {
  const dates: string[] = [];
  currentDesk.value.diaryEntries.forEach(d => {
    const cleanDate = d.dateStr.split("·")[0].trim();
    if (cleanDate && !dates.includes(cleanDate)) dates.push(cleanDate);
  });
  return ["全部", ...dates];
});

const renderedHoleRolls = computed(() => {
  const dates = holeTimelineDates.value;
  const selectedDate = dates[selectedHoleDateIdx.value] || "全部";
  const list = currentDesk.value.diaryEntries;
  const cells = [
    { left: 16, top: 2 },
    { left: 74, top: 0 },
    { left: 132, top: 4 },
    { left: 190, top: 1 },
    { left: 24, top: 54 },
    { left: 82, top: 52 },
    { left: 140, top: 56 },
    { left: 196, top: 50 },
  ];
  return list.map((m, i) => {
    const cleanDate = m.dateStr.split("·")[0].trim();
    const isDim = selectedDate !== "全部" && cleanDate !== selectedDate;
    const c = cells[i % cells.length];
    const seed = (i + 1) * 37;
    const rx = c.left + Math.round((Math.sin(seed * 3) - 0.5) * 14);
    const ry = c.top + Math.round((Math.sin(seed * 5) - 0.5) * 8);
    const rot = Math.round((Math.sin(seed * 7) - 0.5) * 56);
    const sc = 0.92 + Math.abs(Math.sin(seed * 11)) * 0.16;
    const z = 1 + (i % 3);
    return {
      ...m,
      cleanDate,
      isDim,
      style: {
        left: `${rx}px`,
        top: `${ry}px`,
        transform: `rotate(${rot}deg) scale(${sc.toFixed(2)})`,
        zIndex: z
      }
    };
  });
});

function selectHoleDate(idx: number) {
  selectedHoleDateIdx.value = idx;
  const d = holeTimelineDates.value[idx];
  uni.showToast({
    title: d === "全部" ? "显示全部纸条" : `时间线：${d}`,
    icon: "none"
  });
}

// 书本交互
function toggleBook() {
  isBookOpen.value = !isBookOpen.value;
}

const bookDateGroups = computed(() => {
  const groups: { date: string; notes: DrawerSecretNote[] }[] = [];
  currentDesk.value.drawerNotes.forEach(dn => {
    const datePart = dn.receivedTime.split(" ")[0] || "今天";
    let grp = groups.find(g => g.date === datePart);
    if (!grp) {
      grp = { date: datePart, notes: [] };
      groups.push(grp);
    }
    grp.notes.push(dn);
  });
  if (groups.length === 0) {
    groups.push({ date: "暂无纸条", notes: [] });
  }
  return groups;
});

const currentBookPage = computed(() => {
  if (bookDateGroups.value.length === 0) return { date: "暂无", notes: [] };
  const idx = Math.min(Math.max(0, bookDateIdx.value), bookDateGroups.value.length - 1);
  return bookDateGroups.value[idx];
});

function flipBook(dir: number) {
  const next = bookDateIdx.value + dir;
  if (next < 0 || next >= bookDateGroups.value.length) {
    uni.showToast({
      title: dir < 0 ? "已经是最早一天" : "已经是最新一天",
      icon: "none"
    });
    return;
  }
  isBookFlipping.value = true;
  setTimeout(() => {
    bookDateIdx.value = next;
  }, 200);
  setTimeout(() => {
    isBookFlipping.value = false;
  }, 460);
}

// 纸条舒展弹窗
function openHoleRoll(item: any) {
  activeUnrollData.value = {
    title: item.title,
    author: currentDesk.value.ownerName,
    avatar: currentDesk.value.ownerAvatar,
    date: item.dateStr,
    content: item.content,
    color: item.color || "yellow",
    type: "diary",
    rawItem: item
  };
  unrollModalVisible.value = true;
  isUnrolling.value = false;
  setTimeout(() => {
    isUnrolling.value = true;
  }, 30);
}

function openBookNoteSlip(note: DrawerSecretNote) {
  note.read = true;
  saveMyDeskData(currentDesk.value);
  activeUnrollData.value = {
    title: "桌洞私信",
    author: note.senderName,
    avatar: note.senderAvatar,
    date: note.receivedTime,
    content: note.fullContent,
    color: "pink",
    type: "letter",
    rawItem: note
  };
  unrollModalVisible.value = true;
  isUnrolling.value = false;
  setTimeout(() => {
    isUnrolling.value = true;
  }, 30);
}

function openNoteFromBoard(note: WindowNoteItem) {
  activeUnrollData.value = {
    title: "便签留言",
    author: note.authorName,
    avatar: note.authorAvatar,
    date: formatRelativeTime(note.createdAt),
    content: note.content,
    color: note.color,
    type: "diary",
    rawItem: note
  };
  unrollModalVisible.value = true;
  isUnrolling.value = false;
  setTimeout(() => {
    isUnrolling.value = true;
  }, 30);
}

function closeUnrollModal() {
  unrollModalVisible.value = false;
  isUnrolling.value = false;
  activeUnrollData.value = null;
}

function pinDiaryToWindow() {
  if (!activeUnrollData.value || !activeUnrollData.value.rawItem) return;
  const d = activeUnrollData.value.rawItem;
  postWindowNote({
    authorId: currentDesk.value.ownerId,
    authorName: currentDesk.value.ownerName,
    authorAvatar: currentDesk.value.ownerAvatar,
    content: d.content,
    color: d.color,
    isMine: true
  });
  currentDesk.value = getMyDeskData();
  closeUnrollModal();
  closeHolePage();
  uni.showToast({ title: "已贴到窗台/便签板！📌", icon: "none" });
}

function replyToUnrollSender() {
  if (!activeUnrollData.value) return;
  const senderName = activeUnrollData.value.author;
  const avatar = activeUnrollData.value.avatar;
  closeUnrollModal();
  uni.showToast({ title: `提笔给 ${senderName} 写回信...`, icon: "none" });
  if (openChatWithFriend) {
    openChatWithFriend("friend_auto", senderName, avatar || "");
  }
}

function openJournalWithAnim() {
  openHandwritingPad();
}

function openHandwritingPad() {
  gearMenuVisible.value = false;
  boardModalVisible.value = false;
  handwritingPadVisible.value = true;
}

function onHandwritingConfirmed(data: { imageBase64: string; pattern: string; handwritingLength: number }) {
  handwritingPadVisible.value = false;
  const newDiary: DiaryMemoryItem = {
    id: 'diary_' + Date.now(),
    title: '今日心情笔记',
    content: data.imageBase64,
    dateStr: '11月18日 · 晴',
    locationName: '窗前写字台',
    tag: '手写心情',
    color: (data.pattern as NotePaperColor) || 'yellow',
    paperTexture: 'grid'
  };
  currentDesk.value.diaryEntries.unshift(newDiary);
  saveMyDeskData(currentDesk.value);
  uni.showToast({ title: "小纸条已塞进桌洞的盒子里 📮", icon: "none" });
}

function getPaperMoodColor(colorKey?: string): string {
  const MOOD_MAP: Record<string, string> = {
    happy: "#FBE7C4",
    heart: "#F9DCE3",
    calm: "#DEE9DB",
    sad: "#DDE4F0",
    tired: "#E8E1D6",
    yellow: "#FBE7C4",
    pink: "#F9DCE3",
    green: "#DEE9DB",
    blue: "#DDE4F0",
    kraft: "#E8E1D6"
  };
  return (colorKey && MOOD_MAP[colorKey]) || "#FDFBF4";
}

function formatRelativeTime(ts: number): string {
  if (!ts) return "刚刚";
  const diff = Date.now() - ts;
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return Math.floor(diff / 60000) + "分钟前";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "小时前";
  return Math.floor(diff / 86400000) + "天前";
}
</script>


<style lang="scss">

  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  :root{
    --bg:#F5F4F1;
    --paper:#FDFBF4;
    --ink:#2B2620;
    --muted:#8E887E;
    --accent:#A85A44;
    --line:#E7E4DD;
    --ui:-apple-system,BlinkMacSystemFont,"PingFang SC","Helvetica Neue",sans-serif;
    --serif:"Songti SC","STSong","Noto Serif SC",serif;
    --noise:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
    --wood:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='130'%3E%3Cfilter id='w'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.008 0.12' numOctaves='4' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.32 0 0 0 0 0.21 0 0 0 0 0.1 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='260' height='130' filter='url(%23w)'/%3E%3C/svg%3E");
    --metal:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='90'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.004 0.85' numOctaves='3' seed='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.8 0 0 0 0 0.78 0 0 0 0 0.74 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='180' height='90' filter='url(%23m)'/%3E%3C/svg%3E");
    --fiber:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='90' height='90' filter='url(%23p)' opacity='.7'/%3E%3C/svg%3E");
    --cork:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='c'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.18 0.24' numOctaves='3' seed='11' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.52 0 0 0 0 0.36 0 0 0 0 0.2 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23c)'/%3E%3C/svg%3E");
  }
  
  
  
  .phone{
    position:relative; width:390px; height:844px; border-radius:46px;
    background:var(--bg); overflow:hidden;
    box-shadow:0 40px 90px rgba(90,70,45,.28), 0 0 0 1px rgba(120,100,75,.15);
    display:flex; flex-direction:column;
  }
  .notch{
    position:absolute; top:10px; left:50%; transform:translateX(-50%);
    width:110px; height:26px; border-radius:16px; background:#2D2822; z-index:60;
  }
  .statusbar{
    height:52px; flex:none; display:flex; align-items:flex-end; justify-content:space-between;
    padding:0 26px 6px; font-size:12px; font-weight:600; color:var(--ink);
    z-index:55; position:relative;
  }
  .statusbar .right{ display:flex; gap:5px; align-items:center; }
  .screen{ position:relative; flex:1; overflow:hidden; }

  .page{ position:absolute; inset:0; display:flex; flex-direction:column; animation:pgin .28s ease both; }
  .page.active{ display:flex; flex-direction:column; }
  @keyframes pgin{ from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }

  .tabbar{
    flex:none; height:88px; display:grid; grid-template-columns:1fr 1fr 1fr 1fr;
    align-items:start; padding:8px 8px 0; position:relative; z-index:40;
    background:rgba(255,255,255,.96); backdrop-filter:blur(16px);
    border-top:1px solid var(--line);
  }
  .tab{
    border:0; background:none; color:var(--muted); font-family:var(--ui);
    display:flex; flex-direction:column; align-items:center; gap:4px;
    font-size:10px; padding-top:9px; cursor:pointer; transition:color .2s;
  }
  .tab svg{ width:23px; height:23px; }
  .tab.on{ color:var(--ink); }
  .tab-brush{ padding-top:0; color:var(--muted); }
  .brush-btn{
    width:56px; height:56px; border-radius:50%; margin-top:-20px;
    background:#A85A44;
    box-shadow:0 8px 18px rgba(168,90,68,.35), 0 0 0 5px #F5F4F1;
    display:flex; align-items:center; justify-content:center; color:#FFF7EC;
    transition:transform .15s;
  }
  .tab-brush:active .brush-btn{ transform:scale(.94); }
  .tab-brush span{ margin-top:3px; font-size:10px; }

  .paper{
    position:relative; background:var(--paper); color:#2E2A24;
    padding:16px 18px; font-family:var(--serif);
    border-radius:3px;
    box-shadow:0 1px 2px rgba(50,40,30,.14), 0 10px 24px rgba(50,40,30,.1);
  }
  .paper::before{
    content:""; position:absolute; inset:0; pointer-events:none; opacity:.45; border-radius:3px;
    background:
      var(--fiber),
      repeating-linear-gradient(112deg,rgba(255,255,255,.3) 0 1px,rgba(255,255,255,0) 1px 7px),
      radial-gradient(60% 40% at 80% 100%,rgba(120,90,50,.06),transparent 70%);
    background-size:72px 72px, auto, auto;
    background-blend-mode:multiply, normal, normal;
  }
  .paper::after{
    content:""; position:absolute; right:0; bottom:0; width:15px; height:15px;
    background:linear-gradient(315deg,rgba(0,0,0,0) 46%,rgba(0,0,0,.06) 50%,rgba(255,255,255,.75) 62%);
    border-bottom-right-radius:3px; pointer-events:none;
  }
  .tape{
    width:52px; height:15px;
    background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(238,232,216,.5));
    box-shadow:0 1px 2px rgba(90,70,45,.12), inset 0 1px 0 rgba(255,255,255,.6);
  }

  /* ---------- MAP ---------- */
  .map-wrap{ position:relative; flex:1; overflow:hidden; background:#F1EDE6; }
  .map-wrap svg.map{ position:absolute; inset:0; width:100%; height:100%; }

  .searchwrap{ position:absolute; top:14px; left:14px; right:14px; z-index:30; }
  .searchbox{
    display:flex; align-items:center; gap:9px; height:46px; padding:0 15px;
    background:#FFFFFF;
    border-radius:14px; border:1px solid #E5E2DB;
    box-shadow:0 2px 10px rgba(40,35,28,.06);
  }
  .searchbox svg{ width:17px; height:17px; flex:none; opacity:.55; }
  .searchbox input{
    flex:1; border:0; outline:none; background:none; font-family:var(--ui);
    font-size:13.5px; color:var(--ink);
  }
  .searchbox input::placeholder{ color:#A99F8E; }
  .scope{
    font-size:10px; color:#8E887E; background:#F1EFEA; border:1px solid #E0DDD5;
    padding:4px 8px; border-radius:8px; cursor:pointer; flex:none;
  }

  .results{
    margin-top:8px; border-radius:14px; overflow:hidden; display:none;
    background:#FFFFFF; border:1px solid #E5E2DB;
    box-shadow:0 12px 30px rgba(40,35,28,.12);
  }
  .results.show{ display:block; }
  .result{
    display:flex; align-items:center; gap:10px; padding:12px 15px;
    font-size:13px; border-bottom:1px solid #F1EFEA; cursor:pointer;
  }
  .result:last-child{ border-bottom:0; }
  .result:active{ background:#F7F6F2; }
  .result .dot{ width:7px; height:7px; border-radius:50%; background:var(--accent); flex:none; }
  .result small{ margin-left:auto; color:var(--muted); font-size:11px; }
  .result em{ font-style:normal; color:var(--accent); }

  .map-pins{ position:absolute; inset:0; z-index:10; }
  .pin{
    position:absolute; width:104px; transform:translate(-50%,-100%);
    cursor:pointer; transition:opacity 1s linear, transform .2s;
  }
  .pin:active{ transform:translate(-50%,-100%) scale(.96); }
  .pin .tape{
    position:absolute; top:-7px; left:50%; transform:translateX(-50%) rotate(-3deg); z-index:2;
    background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(238,232,216,.5));
    box-shadow:0 1px 2px rgba(90,70,45,.12), inset 0 1px 0 rgba(255,255,255,.6);
  }
  .pin .note-mini{
    position:relative; padding:13px 10px 10px; min-height:56px;
    font-family:var(--serif); font-size:10.5px; line-height:1.55; color:#514838;
    background:
      var(--fiber),
      linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0) 42%, rgba(90,70,45,.14)),
      var(--c,#FBF5E8);
    background-size:38px 38px, auto, auto;
    background-blend-mode:multiply, normal, normal;
    border-radius:2px 2px 3px 3px;
    filter:drop-shadow(0 4px 8px rgba(50,40,30,.24));
  }
  .pin .note-mini::after{
    content:""; position:absolute; right:0; bottom:0; width:13px; height:13px;
    background:linear-gradient(315deg,transparent 47%,rgba(0,0,0,.07) 50%,rgba(255,255,255,.85) 63%);
    border-bottom-right-radius:3px;
  }
  .pin .note-mini span{ display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; position:relative; }
  .pin.hit .note-mini{ outline:2px solid rgba(192,112,90,.75); outline-offset:2px; animation:pulse 1.1s ease infinite; }
  @keyframes pulse{ 50%{ outline-color:rgba(192,112,90,.15);} }

  .fab{
    position:absolute; right:16px; bottom:118px; z-index:25;
    width:46px; height:46px; border-radius:50%; border:1px solid #E5E2DB;
    background:#FFFFFF; color:#6E6A62; display:flex; align-items:center; justify-content:center;
    box-shadow:0 6px 16px rgba(40,35,28,.12); cursor:pointer;
  }
  .fab svg{ width:19px; height:19px; }
  .fab.spin svg{ animation:spin .8s ease; }
  @keyframes spin{ to{ transform:rotate(360deg);} }

  .nearby{
    position:absolute; left:14px; right:90px; bottom:16px; z-index:25;
    display:flex; align-items:center; gap:10px; padding:11px 13px;
    background:rgba(255,255,255,.97); backdrop-filter:blur(12px);
    border:1px solid #E5E2DB; border-radius:16px;
    box-shadow:0 10px 26px rgba(40,35,28,.12); cursor:pointer;
    animation:float 4.6s ease-in-out infinite;
  }
  @keyframes float{ 50%{ transform:translateY(-4px);} }
  .nearby .stack{ display:flex; flex:none; }
  .nearby .stack i{
    width:26px; height:26px; border-radius:50%; margin-left:-8px; border:2px solid #FFF;
    background:#DCD8D0; font-style:normal; font-size:10px; display:flex; align-items:center; justify-content:center;
    color:#6E6A62; font-family:var(--ui);
  }
  .nearby .stack i:first-child{ margin-left:0; }
  .nearby .txt{ flex:1; min-width:0; font-size:12px; line-height:1.45; }
  .nearby .txt b{ font-weight:600; color:var(--accent); }
  .nearby .txt span{ display:block; font-size:10px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .nearby .go{ font-size:11px; color:#8E887E; border-left:1px solid var(--line); padding-left:11px; flex:none; }

  .landmark-card{
    position:absolute; left:14px; right:14px; bottom:16px; z-index:26;
    background:#FFFFFF; border:1px solid #E5E2DB;
    border-radius:16px; padding:14px 16px; box-shadow:0 12px 30px rgba(40,35,28,.14);
    display:none;
  }
  .landmark-card.show{ display:block; animation:pgin .25s ease both; }
  .landmark-card h4{ font-size:14px; font-family:var(--serif); margin-bottom:4px; }
  .landmark-card p{ font-size:11px; color:var(--muted); margin-bottom:10px; }
  .landmark-card .lm-close{ position:absolute; right:12px; top:10px; color:#C6C1B8; cursor:pointer; font-size:13px; padding:4px; }
  .landmark-card button{
    width:100%; height:36px; border-radius:10px; border:0; cursor:pointer;
    background:#2B2620; color:#F5F4F1; font-family:var(--ui); font-size:12px; letter-spacing:.04em;
  }

  /* ---------- CHAT ---------- */
  .chat-page{ background:linear-gradient(180deg,#F5F4F1,#EFEDE8); }
  .chat-head{ flex:none; padding:6px 18px 12px; display:flex; align-items:center; gap:10px; }
  .chat-head h3{ font-family:var(--ui); font-size:16px; font-weight:600; }
  .chat-head .sub{ font-size:10px; color:var(--muted); margin-top:2px; }
  .chat-head .spacer{ flex:1; }
  .chip{
    font-size:9.5px; color:#8E887E; border:1px solid #E5E2DB; background:#FFFFFF;
    padding:4px 9px; border-radius:20px;
  }
  .chat-
  .chat-body::-webkit-scrollbar{ width:0; }
  .dayline{
    align-self:center; font-size:9.5px; color:#8E887E; letter-spacing:.1em;
    padding:3px 10px; background:#ECEAE4; border-radius:10px;
  }
  .notice{
    align-self:center; max-width:88%; text-align:center; font-size:10.5px; line-height:1.7;
    color:#8E887E; padding:9px 14px; border:1px solid #E7E4DD; background:#FFFFFF; border-radius:12px;
  }
  .msg{ display:flex; gap:8px; align-items:flex-end; max-width:86%; }
  .msg.me{ align-self:flex-end; flex-direction:row-reverse; }
  .msg .ava{
    width:24px; height:24px; border-radius:50%; flex:none; font-size:10px;
    display:flex; align-items:center; justify-content:center; color:#FFF6EE;
    background:#9C8E7E; font-family:var(--ui);
  }
  .msg.me .ava{ background:#7E8E7E; }
  .bubble .paper{ padding:12px 14px 15px; font-size:12.5px; line-height:1.8; }
  .bubble .meta{ font-size:9px; color:#A29C92; margin-top:5px; }
  .msg.me .meta{ text-align:right; }
  .bubble.delayed .paper{ opacity:.75; }
  .bubble.delayed .meta{ color:#B08A6E; }
  .chat-input{
    flex:none; display:flex; gap:8px; align-items:center; padding:10px 14px 12px;
    border-top:1px solid var(--line); background:rgba(255,255,255,.97); backdrop-filter:blur(12px);
  }
  .chat-input input{
    flex:1; height:40px; border-radius:12px; border:1px solid #E5E2DB; outline:none;
    background:#F4F3EF; padding:0 13px; font-size:12.5px; font-family:var(--ui); color:var(--ink);
  }
  .chat-input .send{
    width:40px; height:40px; border-radius:12px; border:0; background:#A85A44; color:#FFF6EE;
    display:flex; align-items:center; justify-content:center; cursor:pointer;
  }
  .chat-input .send svg{ width:16px; height:16px; }

  /* ---------- COMPOSE ---------- */
  .compose-head{ display:flex; align-items:center; gap:10px; padding:2px 4px 14px; }
  .compose-head h3{ font-family:var(--ui); font-size:16px; font-weight:600; }
  .compose-head .close{
    margin-left:auto; width:30px; height:30px; border-radius:50%; border:0; background:#F1EFEA;
    color:#8E887E; display:flex; align-items:center; justify-content:center; cursor:pointer;
  }
  .compose-head .close svg{ width:13px; height:13px; }
  .loc{
    display:flex; align-items:center; gap:7px; font-size:10.5px; color:#8E887E;
    background:#F4F3EF; border:1px solid #E5E2DB; border-radius:10px; padding:8px 10px; margin-bottom:12px;
  }
  .loc svg{ width:12px; height:12px; flex:none; }
  .loc b{ font-weight:500; color:#57534B; }
  .loc .only{ margin-left:auto; font-size:9px; color:#AE9F8A; }
  .compose-paper{ padding:14px 15px 10px; margin-bottom:12px; }
  .compose-paper textarea{
    width:100%; min-height:86px; resize:none; border:0; outline:none; background:none;
    font-family:var(--serif); font-size:14px; line-height:1.9; color:#4A4238; position:relative;
  }
  .compose-paper textarea::placeholder{ color:#B3A794; }
  .compose-paper .row{ display:flex; align-items:flex-end; gap:10px; margin-top:6px; }
  .compose-paper .count{ margin-left:auto; font-size:9.5px; color:#B3A794; font-family:var(--ui); padding-bottom:4px; }
  .photo-slot{
    height:64px; width:64px; border-radius:10px; border:1px dashed #D8CBB4;
    display:flex; align-items:center; justify-content:center;
    font-size:20px; cursor:pointer; overflow:hidden; background:rgba(255,255,255,.35);
  }
  .photo-slot img{ width:100%; height:100%; object-fit:cover; }
  .photo-slot .hint{ font-size:8.5px; color:#B3A794; text-align:center; line-height:1.5; }
  .photo-tools{ display:flex; align-items:center; gap:8px; margin-top:12px; }
  .tool{
    display:flex; align-items:center; gap:6px; font-size:10.5px; color:#57534B;
    border:1px solid #E5E2DB; background:#FFFFFF; border-radius:9px; padding:6px 10px; cursor:pointer;
    font-family:var(--ui);
  }
  .tool.on{ border-color:var(--accent); color:var(--accent); background:#F9EFEA; }
  .tool svg{ width:13px; height:13px; }
  .doodle-box{ display:none; margin-top:10px; }
  .doodle-box.show{ display:block; }
  .doodle-box canvas{
    width:100%; height:140px; border-radius:8px; background:#FFFDF7;
    border:1px solid #EDE3D1; touch-action:none; display:block;
  }
  .doodle-tools{ display:flex; gap:6px; align-items:center; margin-top:8px; }
  .swatch{ width:16px; height:16px; border-radius:50%; border:2px solid transparent; cursor:pointer; }
  .swatch.on{ border-color:#4A4238; }
  .doodle-tools .clear{ margin-left:auto; font-size:10px; color:#9A9080; background:none; border:0; cursor:pointer; }
  .field-label{ font-size:10px; color:#A2947E; letter-spacing:.1em; margin:14px 2px 8px; }
  .chips{ display:flex; flex-wrap:wrap; gap:7px; }
  .choice{
    font-size:10.5px; padding:7px 11px; border-radius:9px; cursor:pointer;
    border:1px solid #E5E2DB; background:#FFFFFF; color:#57534B;
    display:flex; align-items:center; gap:6px; font-family:var(--ui);
  }
  .choice.on{ border-color:var(--accent); color:var(--accent); background:#F9EFEA; }
  .choice .dot{ width:10px; height:10px; border-radius:50%; }
  .compose-actions{ display:flex; gap:9px; margin-top:18px; }
  .btn-ghost{
    flex:1; height:44px; border-radius:12px; border:1px solid #DAD7D0; background:transparent;
    color:#6E6A62; font-size:12px; font-family:var(--ui); cursor:pointer;
  }
  .btn-main{
    flex:1.5; height:44px; border-radius:12px; border:0; color:#FFF6EF;
    background:#A85A44; font-size:12.5px; font-family:var(--ui);
    letter-spacing:.06em; cursor:pointer; box-shadow:0 6px 14px rgba(168,90,68,.28);
  }
  .btn-main:active{ transform:translateY(1px); }
  .mini-hint{ font-size:9px; color:#B0A390; line-height:1.7; margin-top:10px; }

  /* ---------- DESK ---------- */
  .desk-page{ background:#EFE4D2; overflow:hidden; }
  .desk-page .wall, .visit-page .wall{
    position:absolute; inset:0 0 42% 0;
    background:radial-gradient(90% 70% at 62% 30%, #F5F1EA 0%, #EBE5DB 55%, #E0D9CD 100%);
  }
  .gear{
    position:absolute; right:16px; top:14px; z-index:20; width:40px; height:40px; border-radius:50%;
    background:rgba(255,255,255,.85); border:1px solid #D8D4CC; color:#74695A;
    display:flex; align-items:center; justify-content:center; cursor:pointer;
    box-shadow:0 4px 12px rgba(40,35,28,.1); backdrop-filter:blur(6px);
  }
  .gear svg{ width:17px; height:17px; }
  .desk-title{
    position:absolute; left:20px; top:16px; z-index:15;
    font-family:var(--ui); font-size:11px; font-weight:600; color:#9A948C; letter-spacing:.3em;
  }
  .window-frame{
    position:absolute; left:50%; top:66px; transform:translateX(-50%);
    width:280px; height:240px; border-radius:8px; z-index:5;
    border:11px solid; border-color:#E4CFB2 #D3BC98 #C4A87F #D3BC98; background:#CFE0E4; overflow:hidden;
    box-shadow:0 18px 34px rgba(90,70,45,.25), inset 0 0 0 2px rgba(255,248,235,.4), inset 0 -4px 10px rgba(90,65,35,.32);
    cursor:pointer;
  }
  .window-frame > .pane{
    position:absolute; inset:0; transition:background 1.2s ease;
    background:linear-gradient(180deg,#BFD9E4 0%,#DDE9E7 55%,#F6EBD6 100%);
  }
  .window-frame[data-w="rain"] > .pane{ background:linear-gradient(180deg,#8FA3AE 0%,#AFBEC5 55%,#D7D8D0 100%); }
  .window-frame[data-w="night"] > .pane{ background:linear-gradient(180deg,#26334A 0%,#3E4C65 55%,#6C6B76 100%); }
  .vp-photo{
    position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
    user-select:none; -webkit-user-drag:none;
  }
  .window-frame .scenery{
    position:absolute; inset:0; transition:background 1.2s ease;
    background:linear-gradient(180deg,#BFD9E4 0%,#DDE9E7 55%,#F6EBD6 100%);
  }
  .window-frame[data-w="rain"] .scenery{ background:linear-gradient(180deg,#8FA3AE 0%,#AFBEC5 55%,#D7D8D0 100%); }
  .window-frame[data-w="night"] .scenery{ background:linear-gradient(180deg,#26334A 0%,#3E4C65 55%,#6C6B76 100%); }
  .sc-photo{
    position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
    display:none; user-select:none; -webkit-user-drag:none;
  }
  .sc-photo.on{ display:block; }
  .scenery.photo .svgsun, .scenery.photo .cloud, .scenery.photo .sc-hill,
  .scenery.photo .sc-tree, .scenery.photo .sc-birds, .scenery.photo .stars{ display:none; }
  .window-frame.photo .sash .pane{
    background:
      linear-gradient(112deg, transparent 22%, rgba(255,255,255,.14) 27%, transparent 34%, transparent 58%, rgba(255,255,255,.08) 63%, transparent 70%),
      linear-gradient(160deg,rgba(214,232,238,.2),rgba(236,242,240,.1) 55%,rgba(250,244,230,.18));
  }
  .sc-hill{ position:absolute; bottom:0; border-radius:50% 50% 0 0; filter:blur(1.2px); }
  .sc-hill.h1{ left:-18%; width:68%; height:42%; background:linear-gradient(180deg,#B7C9AC,#9DB394); }
  .sc-hill.h2{ right:-22%; width:72%; height:34%; background:linear-gradient(180deg,#A4BBA0,#8CA389); }
  .sc-tree{ position:absolute; bottom:13%; width:14px; filter:blur(.5px); }
  .sc-tree::before{ content:""; position:absolute; left:5px; bottom:0; width:4px; height:14px; background:#7A6248; border-radius:2px; }
  .sc-tree::after{ content:""; position:absolute; left:-7px; top:-17px; width:28px; height:28px; border-radius:50%; background:radial-gradient(circle at 38% 32%, #8FAE82, #6E8F64); box-shadow:8px 5px 0 -2px #7A9A70, -8px 6px 0 -3px #86A37B; }
  .sc-tree.t1{ left:14%; }
  .sc-tree.t2{ left:33%; }
  .sc-tree.t3{ right:17%; }
  .sc-birds i{
    position:absolute; width:14px; height:5px; border-top:2px solid #5F6E6B; border-radius:50%;
    animation:birdfly 12s linear infinite;
  }
  .sc-birds i:nth-child(1){ top:22%; left:-16px; }
  .sc-birds i:nth-child(2){ top:31%; left:-16px; animation-delay:3.5s; }
  .sc-birds i:nth-child(3){ top:17%; left:-16px; animation-delay:7s; }
  @keyframes birdfly{ to{ transform:translateX(270px); } }
  .sash{
    position:absolute; top:0; bottom:0; width:50%; z-index:4;
    transition:transform .65s cubic-bezier(.3,.8,.35,1);
  }
  .sash.left{ left:0; transform-origin:left center; }
  .sash.right{ right:0; transform-origin:right center; }
  .window-frame.open .sash.left{ transform:perspective(320px) rotateY(-66deg); }
  .window-frame.open .sash.right{ transform:perspective(320px) rotateY(66deg); }
  .sash .pane{
    position:absolute; inset:0;
    background:
      linear-gradient(112deg, transparent 22%, rgba(255,255,255,.17) 27%, transparent 34%, transparent 58%, rgba(255,255,255,.1) 63%, transparent 70%),
      linear-gradient(160deg,rgba(214,232,238,.45),rgba(236,242,240,.24) 55%,rgba(250,244,230,.36));
    border:2px solid rgba(224,205,177,.9);
  }
  .sash.left .pane{ border-left-width:0; }
  .sash.right .pane{ border-right-width:0; }
  .svgsun{
    position:absolute; right:24px; top:16px; width:36px; height:36px; border-radius:50%;
    background:radial-gradient(circle, #FFF7DE 0 34%, #FFE9A8 55%, rgba(255,220,140,0) 74%);
    box-shadow:0 0 28px 10px rgba(255,232,160,.75), 0 0 64px 26px rgba(255,232,160,.28);
    transition:opacity .8s;
  }
  .window-frame[data-w="rain"] .svgsun{ opacity:0; }
  .window-frame[data-w="night"] .svgsun{ opacity:0; }
  .cloud{
    position:absolute; width:76px; height:22px; border-radius:20px;
    background:linear-gradient(180deg, rgba(255,255,255,.96), rgba(238,243,245,.78));
    filter:blur(1.8px);
    transition:opacity .8s;
  }
  .cloud::before,.cloud::after{
    content:""; position:absolute; background:linear-gradient(180deg,#FFF,rgba(238,243,245,.78)); border-radius:50%;
  }
  .cloud::before{ width:30px; height:30px; left:14px; top:-13px; }
  .cloud::after{ width:22px; height:22px; right:14px; top:-8px; }
  .cloud.c1{ left:-70px; top:42px; animation:drift 26s linear infinite; }
  .cloud.c2{ left:-70px; top:92px; transform:scale(.7); opacity:.7; animation:drift 38s linear infinite 6s; }
  @keyframes drift{ to{ transform:translateX(330px);} }
  .window-frame[data-w="night"] .cloud{ opacity:.12; }
  .rainlayer{
    position:absolute; inset:0; opacity:0; transition:opacity .6s; filter:blur(.4px);
    background:
      repeating-linear-gradient(104deg, rgba(255,255,255,.5) 0 1.5px, transparent 1.5px 13px),
      repeating-linear-gradient(100deg, rgba(255,255,255,.28) 0 1px, transparent 1px 19px);
  }
  .rainlayer::after{
    content:""; position:absolute; left:0; right:0; bottom:0; height:26%;
    background:linear-gradient(180deg, transparent, rgba(188,199,204,.35));
  }
  .window-frame[data-w="rain"] .rainlayer{ opacity:.55; animation:rainmove .5s linear infinite; }
  @keyframes rainmove{ to{ background-position:0 0, -4px 22px; } }
  .stars{
    position:absolute; inset:0; opacity:0; transition:opacity .8s;
    background-image:
      radial-gradient(1.4px 1.4px at 20% 24%,#FFF 50%,transparent 51%),
      radial-gradient(1.2px 1.2px at 62% 16%,#FFF 50%,transparent 51%),
      radial-gradient(1px 1px at 78% 38%,#FFF 50%,transparent 51%),
      radial-gradient(1.2px 1.2px at 40% 46%,#FFF 50%,transparent 51%),
      radial-gradient(1px 1px at 88% 60%,#FFF 50%,transparent 51%),
      radial-gradient(.9px .9px at 12% 62%,#FFF 50%,transparent 51%),
      radial-gradient(1.1px 1.1px at 52% 68%,#FFF 50%,transparent 51%),
      radial-gradient(.8px .8px at 33% 10%,#FFF 50%,transparent 51%);
  }
  .stars::after{
    content:""; position:absolute; right:26px; top:18px; width:18px; height:18px; border-radius:50%;
    background:radial-gradient(circle at 36% 36%, #FFF8E7, #E8DCC0 68%, #D8C9A8);
    box-shadow:0 0 18px 6px rgba(255,244,214,.55), inset -5px -3px 5px rgba(150,140,110,.55);
  }
  .window-frame[data-w="night"] .stars{ opacity:.9; }
  .glazing-lines{ position:absolute; inset:0; pointer-events:none; }
  .glazing-lines::before,.glazing-lines::after{ content:""; position:absolute; background:#E0CDB1; }
  .glazing-lines::before{ left:50%; top:0; bottom:0; width:8px; transform:translateX(-50%); }
  .glazing-lines::after{ top:50%; left:0; right:0; height:8px; transform:translateY(-50%); }
  .weather-tag{
    position:absolute; left:0; right:0; bottom:0; z-index:5; padding:8px 12px; pointer-events:none;
    display:flex; align-items:center; justify-content:space-between;
    background:linear-gradient(180deg,transparent,rgba(40,45,50,.35));
    color:#FFF9EE; font-size:10px; letter-spacing:.08em;
  }
  .weather-tag b{ font-size:11.5px; font-weight:600; }
  .windowsill{
    position:absolute; left:50%; top:300px; transform:translateX(-50%);
    width:316px; height:16px; border-radius:4px; z-index:6;
    background:linear-gradient(180deg,#F0E3C8,#DFCBA6);
    box-shadow:0 8px 14px rgba(90,70,45,.22);
  }
  .succulent{ position:absolute; left:calc(50% - 146px); top:228px; z-index:9; width:64px; height:82px; cursor:pointer; }
  .succulent .foliage{ position:absolute; left:8px; right:8px; top:0; height:56px; }
  .succulent .blf{
    position:absolute; width:16px; height:24px;
    border-radius:52% 52% 50% 50% / 62% 62% 40% 40%;
    background:radial-gradient(circle at 36% 30%, #7FA070, #5F8156 72%);
    box-shadow:inset 0 -4px 6px rgba(30,60,30,.4);
  }
  .succulent .blf.l{ left:2px; top:16px; transform:rotate(-48deg) scale(.85); }
  .succulent .blf.r{ right:2px; top:16px; transform:rotate(48deg) scale(.85); }
  .succulent .blf.c{ left:23px; top:3px; transform:rotate(3deg) scale(.88); }
  .succulent .lf{
    position:absolute; width:17px; height:27px;
    border-radius:52% 52% 50% 50% / 62% 62% 40% 40%;
    box-shadow:inset 0 -4px 6px rgba(40,70,40,.32), 0 3px 5px rgba(40,30,20,.18);
  }
  .succulent .lf1{ left:24px; top:0; background:radial-gradient(circle at 36% 30%, #A9C79B, #7E9A72 72%); }
  .succulent .lf2{ left:5px; top:9px; transform:rotate(-34deg); background:radial-gradient(circle at 36% 30%, #9FBE90, #74906A 72%); }
  .succulent .lf3{ right:5px; top:9px; transform:rotate(34deg); background:radial-gradient(circle at 36% 30%, #A4C395, #78936C 72%); }
  .succulent .lf4{ left:13px; top:18px; transform:rotate(-16deg) scale(.92); background:radial-gradient(circle at 36% 30%, #8FAE82, #6A8960 72%); }
  .succulent .lf5{ right:13px; top:18px; transform:rotate(16deg) scale(.92); background:radial-gradient(circle at 36% 30%, #93B186, #6E8D64 72%); }
  .succulent .lf6{ left:27px; top:15px; transform:rotate(6deg) scale(.95); background:radial-gradient(circle at 36% 30%, #9CBB93, #74906A 72%); }
  .plant-pot{
    position:absolute; left:50%; bottom:0; transform:translateX(-50%);
    width:34px; height:26px;
    background:linear-gradient(180deg,#C4906F,#A96F55);
    border-radius:4px 4px 9px 9px;
    box-shadow:0 6px 10px rgba(40,30,20,.3), inset 0 2px 0 rgba(255,255,255,.22), inset -3px 0 4px rgba(80,40,20,.18);
  }
  .plant-pot::before{
    content:""; position:absolute; left:-3px; right:-3px; top:-4px; height:7px;
    background:linear-gradient(180deg,#D2A084,#B87F62);
    border-radius:3px;
    box-shadow:0 2px 3px rgba(40,30,20,.25);
  }
  .succulent .water-can{
    position:absolute; left:44px; top:-16px; width:34px; height:34px;
    opacity:0; transform:rotate(0deg); transition:.35s ease; pointer-events:none;
  }
  .succulent .water-can svg{ width:100%; height:100%; }
  .succulent .drop{
    position:absolute; left:34px; top:6px; width:4px; height:7px;
    border-radius:50% 50% 60% 60%; background:#9CC3D8; opacity:0;
  }
  .succulent.watering .water-can{ opacity:1; transform:rotate(-35deg); }
  .succulent.watering .drop{ animation:dropfall .7s linear infinite; }
  .succulent.watering .drop.d2{ animation-delay:.18s; }
  .succulent.watering .drop.d3{ animation-delay:.36s; }
  .succulent.watering .foliage{ animation:leafb 1.2s ease; }
  @keyframes dropfall{
    0%{ transform:translateY(0); opacity:0; }
    25%{ opacity:1; }
    100%{ transform:translateY(26px); opacity:0; }
  }
  @keyframes leafb{ 40%{ filter:brightness(1.15); } }

  .wboard{ position:absolute; left:196px; bottom:388px; width:48px; height:58px; z-index:5; }
  .wb-face{
    position:absolute; left:0; right:0; top:0; height:42px;
    background:#FDFCF8; border:1px solid #E2DCCF; border-radius:5px;
    box-shadow:0 4px 10px rgba(60,45,30,.25), 0 1px 2px rgba(60,45,30,.15);
    transform:rotate(-2deg);
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px;
    padding:4px 5px;
  }
  .wb-icon{ width:20px; height:20px; }
  .wb-icon svg{ width:100%; height:100%; }
  .wb-text{ font-size:8px; color:#57534B; font-family:var(--ui); font-weight:600; white-space:nowrap; }
  .wb-leg{ position:absolute; bottom:0; width:3px; height:13px; background:#B99B6C; border-radius:2px; box-shadow:0 2px 3px rgba(60,45,30,.3); }
  .wb-leg.l{ left:10px; transform:rotate(14deg); }
  .wb-leg.r{ right:10px; transform:rotate(-14deg); }
  .board{ position:absolute; left:22px; top:296px; width:104px; z-index:7; cursor:pointer; }
  .board .bd{
    position:relative; width:104px; height:132px; border-radius:5px;
    background:
      var(--cork),
      linear-gradient(180deg,#CFA878,#B98F5F);
    background-size:120px, auto;
    background-blend-mode:multiply, normal;
    border:6px solid; border-color:#A98B5E #94764C #8A6D44 #94764C;
    box-shadow:0 10px 20px rgba(90,70,45,.28), inset 0 2px 4px rgba(255,246,228,.35), inset 0 -3px 6px rgba(90,65,35,.4);
    transform:rotate(-1.6deg);
  }
  .board .mini{
    position:absolute; width:38px; padding:5px 4px; font-family:var(--serif); font-size:6.6px;
    line-height:1.5; color:#5B5140; background:#FBF4E4;
    box-shadow:0 2px 4px rgba(90,70,45,.18);
  }
  .board .mini::before{
    content:""; position:absolute; top:-3px; left:50%; transform:translateX(-50%) rotate(-4deg);
    width:16px; height:5px; background:rgba(255,255,255,.7);
  }
  .board .m1{ left:7px; top:8px; transform:rotate(-3deg); background:#F7E4DC; }
  .board .m2{ right:6px; top:34px; transform:rotate(3.5deg); background:#E8EFE4; }
  .board .m3{ left:24px; top:74px; transform:rotate(-2deg); background:#FBF4E4; }
  .desk-surface{
    position:absolute; left:0; right:0; bottom:0; height:46%; z-index:8;
    background:linear-gradient(180deg,#E9D2B0 0%,#DFC39C 12%,#D9BA90 100%);
    box-shadow:0 -10px 30px rgba(90,70,45,.18);
  }
  .desk-surface::before{
    content:""; position:absolute; inset:0; opacity:.4;
    background:repeating-linear-gradient(93deg,rgba(150,110,65,.09) 0 2px,transparent 2px 15px);
  }
  .desk-surface::after{
    content:""; position:absolute; left:0; right:0; top:0; height:9px;
    background:linear-gradient(180deg,rgba(255,246,228,.9),transparent);
  }
  .curtains{ position:absolute; top:46px; left:0; right:0; height:270px; z-index:9; pointer-events:none; }
  .curtains::before{
    content:""; position:absolute; top:0; left:34px; right:34px; height:5px; border-radius:3px;
    background:linear-gradient(180deg,#C9A96F,#B08F5F); box-shadow:0 3px 6px rgba(90,70,45,.25);
  }
  .curtain{
    position:absolute; top:5px; width:58px; height:224px; pointer-events:auto; cursor:pointer;
    transform-origin:top center;
    border-radius:0 0 26px 26px / 0 0 34px 16px;
    background:
      repeating-linear-gradient(90deg, rgba(120,90,60,.10) 0 6px, rgba(255,255,255,0) 6px 18px),
      var(--curt,#FBF6EA);
    box-shadow:0 6px 16px rgba(90,70,45,.18);
    animation:sway var(--swd,5.2s) ease-in-out infinite;
  }
  .curtain.cl{ left:calc(50% - 152px); }
  .curtain.cr{ right:calc(50% - 152px); }
  .desk-page.windy{ --swd:2.2s; }
  .curtains[data-style="2"] .curtain{
    --curt:#F6E3DC;
    background:
      radial-gradient(6px 6px at 12px 16px, #E8A9B8 42%, transparent 43%),
      radial-gradient(5px 5px at 30px 30px, #C9909F 42%, transparent 43%),
      radial-gradient(5px 5px at 16px 44px, #E8A9B8 40%, transparent 41%),
      repeating-linear-gradient(90deg, rgba(120,90,60,.08) 0 6px, rgba(255,255,255,0) 6px 18px),
      #F6E3DC;
  }
  .curtains[data-style="3"] .curtain{
    --curt:#DCE6EF;
    background:
      repeating-linear-gradient(90deg, rgba(70,90,120,.28) 0 2px, transparent 2px 12px),
      repeating-linear-gradient(0deg, rgba(70,90,120,.28) 0 2px, transparent 2px 12px),
      #DCE6EF;
  }
  .curtains[data-style="4"] .curtain{
    --curt:#CBD4C7;
    background:
      var(--fiber),
      repeating-linear-gradient(90deg, rgba(70,90,70,.14) 0 3px, transparent 3px 20px),
      #CBD4C7;
    background-size:40px 40px, auto, auto;
    background-blend-mode:multiply, normal, normal;
  }
  .curtains[data-style="5"] .curtain{
    --curt:#F3D8CF;
    background:
      var(--fiber),
      repeating-linear-gradient(90deg, rgba(201,112,90,.22) 0 7px, transparent 7px 18px),
      #F3D8CF;
    background-size:40px 40px, auto, auto;
    background-blend-mode:multiply, normal, normal;
  }
  @keyframes sway{
    0%,100%{ transform:skewX(0deg); }
    50%{ transform:skewX(2.6deg); }
  }

  .bb-lock{
    position:absolute; left:50%; bottom:-10px; width:24px; height:20px; margin-left:-12px; z-index:4;
    background:linear-gradient(180deg,#E8C778,#C9A24B); border-radius:4px;
    box-shadow:0 3px 6px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.55);
    transition:transform .5s ease .1s, opacity .5s ease .15s;
    cursor:pointer;
  }
  .bb-lock::before{
    content:""; position:absolute; left:50%; top:-8px; width:12px; height:12px; margin-left:-6px;
    border:3px solid #C9A24B; border-bottom:0; border-radius:7px 7px 0 0;
  }
  .bb-lock::after{
    content:""; position:absolute; left:50%; top:6px; width:4px; height:6px; margin-left:-2px;
    border-radius:2px; background:#7A5E1E; box-shadow:3px 0 0 -1px #7A5E1E;
  }
  .bigbox.unlocked .bb-lock{ transform:rotate(-55deg) translateY(10px); opacity:0; }

  .book{
    position:absolute; left:190px; bottom:6px; width:150px; height:88px; z-index:2;
    transform:rotate(2deg); perspective:520px;
  }
  .bk-backboard{
    position:absolute; inset:0;
    background:linear-gradient(180deg,#8A6A44,#6E5232);
    border-radius:4px 10px 10px 4px;
    box-shadow:0 12px 20px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,246,228,.25);
  }
  .bk-backboard::before{
    content:""; position:absolute; left:0; top:0; bottom:0; width:12px;
    background:repeating-linear-gradient(90deg,#7A5C38 0 3px,#93724A 3px 6px);
    border-radius:4px 0 0 4px;
  }
  .bk-sheet{
    position:absolute; left:14px; right:6px; top:6px; bottom:6px;
    background:var(--fiber), #FBF6E8;
    background-size:60px 60px, auto; background-blend-mode:multiply, normal;
    border-radius:2px 6px 6px 2px;
    box-shadow:0 2px 6px rgba(0,0,0,.3), inset 0 0 20px rgba(120,95,60,.12);
    padding:8px 8px 0;
  }
  .bk-turn{
    position:absolute; left:14px; right:6px; top:6px; bottom:6px; display:none;
    background:var(--fiber), #FBF6E8;
    background-size:60px 60px, auto; background-blend-mode:multiply, normal;
    border-radius:2px 6px 6px 2px;
    box-shadow:0 4px 10px rgba(0,0,0,.4);
    transform-origin:left center; z-index:2;
  }
  .book.flipping .bk-turn{ display:block; animation:turnpage .5s ease both; }
  @keyframes turnpage{
    from{ transform:rotateY(0); }
    to{ transform:rotateY(-172deg); }
  }
  .bk-pagehead{ display:flex; align-items:center; gap:6px; }
  .bk-pagehead .d{ font-size:9px; color:#7A6A4E; font-weight:600; font-family:var(--ui); }
  .bk-pagehead .pg{ margin-left:auto; font-size:8px; color:#A2947E; font-family:var(--ui); }
  .bk-hearts{ display:flex; flex-wrap:wrap; gap:2px 10px; justify-content:center; padding-top:8px; }
  .bk-heart{
    position:relative; width:26px; height:24px; margin:12px 3px 15px;
    cursor:pointer; transition:transform .2s;
  }
  .bk-heart:active{ transform:scale(.88); }
  .bk-heart::before,.bk-heart::after{
    content:""; position:absolute; top:0; width:13px; height:21px;
    background:
      linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 45%, rgba(90,70,45,.2)),
      var(--mc,#EFE0C0);
    border-radius:13px 13px 0 0;
    box-shadow:inset 0 0 0 1px rgba(120,95,60,.15);
  }
  .bk-heart::before{ left:13px; transform:rotate(-45deg); transform-origin:0 100%; }
  .bk-heart::after{ left:0; transform:rotate(45deg); transform-origin:100% 100%; }
  .bk-heart .crease{
    position:absolute; left:12px; top:2px; width:1.5px; height:19px;
    background:linear-gradient(180deg,transparent,rgba(90,70,45,.4),transparent);
  }
  .bk-heart .bh-label{
    position:absolute; top:25px; left:50%; transform:translateX(-50%);
    white-space:nowrap; font-size:6.5px; color:#7A6A5C; font-family:var(--ui);
  }
  .bk-heart .bs-seal{
    position:absolute; top:-8px; right:-8px; width:10px; height:10px; border-radius:50%;
    background:radial-gradient(circle at 36% 32%, #E8927E, #B5402E 72%);
    box-shadow:0 2px 3px rgba(0,0,0,.4); z-index:2;
  }
  .bk-cover{
    position:absolute; inset:0; border-radius:4px 10px 10px 4px;
    transform-origin:left center;
    transform-style:preserve-3d;
    transition:transform .8s cubic-bezier(.3,.75,.3,1);
    cursor:pointer; z-index:3;
  }
  .bk-cover .bcf,.bk-cover .bcb{
    position:absolute; inset:0; border-radius:4px 10px 10px 4px; backface-visibility:hidden;
  }
  .bk-cover .bcf{
    background:
      linear-gradient(100deg, transparent 30%, rgba(255,255,255,.16) 46%, transparent 60%),
      linear-gradient(165deg,#8F5B3C,#714427);
    box-shadow:0 12px 20px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,246,228,.3), inset 2px 0 0 rgba(255,255,255,.12);
    display:flex; align-items:center; justify-content:center;
  }
  .bk-cover .bcf::before{
    content:""; position:absolute; inset:10px 14px 10px 22px; border:1px solid rgba(246,231,208,.4); border-radius:3px;
  }
  .bk-cover .bcf span{
    font-family:var(--serif); font-size:11px; letter-spacing:.3em; color:#F3E3C4;
    text-shadow:0 1px 2px rgba(0,0,0,.4);
  }
  .bk-cover .bcb{
    transform:rotateY(180deg);
    background:var(--fiber), #EFE6D0;
    background-size:60px 60px, auto; background-blend-mode:multiply, normal;
    box-shadow:inset 0 0 24px rgba(120,95,60,.25), 0 8px 16px rgba(0,0,0,.35);
  }
  .book.open .bk-cover{ transform:rotateY(-178deg); }
  .bk-nav{
    position:absolute; bottom:-4px; width:26px; height:22px; border:0; cursor:pointer;
    background:rgba(60,44,28,.75); color:rgba(246,231,208,.9); border-radius:6px;
    font-size:13px; line-height:1; display:none; z-index:4; font-family:var(--ui);
  }
  .book.open .bk-nav{ display:block; }
  .bk-nav.next{ right:-4px; }
  .bk-nav.prev{ left:-4px; }

  .school-desk{ position:absolute; left:0; right:0; bottom:0; height:46%; z-index:8; }
  .sd-plane{
    position:absolute; left:22px; right:22px; bottom:300px; height:126px; z-index:1;
    clip-path:polygon(9% 0,91% 0,100% 100%,0 100%);
    background:linear-gradient(180deg,#EBD6B2 0%,#E3CBA1 55%,#DABF93 100%);
    filter:drop-shadow(0 8px 12px rgba(90,70,45,.2));
  }
  .sd-plane::after{
    content:""; position:absolute; left:0; right:0; top:0; height:9px;
    background:linear-gradient(180deg,rgba(255,246,228,.55),transparent);
  }
  .sd-top{
    position:absolute; left:14px; right:14px; bottom:286px; height:18px; border-radius:6px;
    background:linear-gradient(180deg,#EFD8B4 0%,#E3CBA1 45%,#D5B689 100%);
    box-shadow:0 10px 22px rgba(90,70,45,.2), inset 0 2px 0 rgba(255,246,228,.7);
    z-index:2;
  }
  .sd-top::before{
    content:""; position:absolute; inset:0; border-radius:6px; opacity:.4;
    background:repeating-linear-gradient(93deg,rgba(150,110,65,.09) 0 2px,transparent 2px 15px);
  }
  .sd-front{
    position:absolute; left:30px; right:30px; bottom:118px; height:168px;
    border-radius:8px 8px 4px 4px;
    background:linear-gradient(180deg,#E0C79D,#CDAE7E);
    box-shadow:0 14px 26px rgba(90,70,45,.25);
    z-index:2;
  }
  .sd-front::after{
    content:""; position:absolute; inset:0; border-radius:8px;
    box-shadow:inset 0 2px 0 rgba(255,246,228,.4), inset 0 -3px 6px rgba(90,65,35,.25);
  }
  .sd-leg{ position:absolute; bottom:0; width:20px; height:122px; border-radius:4px 4px 0 0; background:linear-gradient(180deg,#D2B082,#B99463); z-index:2; }
  .sd-leg.l{ left:44px; }
  .sd-leg.r{ right:44px; }
  .desk-hole{
    position:absolute; left:50%; transform:translateX(-50%); bottom:144px; width:220px; height:140px;
    border-radius:10px; cursor:pointer; overflow:hidden; z-index:2;
    background:radial-gradient(120% 90% at 50% 30%, #4B3A28, #2E2318 70%);
    box-shadow:inset 0 10px 24px rgba(0,0,0,.6), 0 2px 0 rgba(255,246,228,.25);
  }
  .desk-hole::after{
    content:""; position:absolute; left:0; right:0; bottom:0; height:56px;
    background:radial-gradient(70% 90% at 50% 100%, rgba(255,205,140,.3), transparent 75%);
  }
  .desk-hole .hb-side{
    position:absolute; left:50%; bottom:14px; transform:translateX(-50%) rotate(-2deg);
    width:124px; height:56px; border-radius:6px;
    background:linear-gradient(180deg,#DCA984,#C89268);
    box-shadow:0 8px 14px rgba(0,0,0,.4), inset 0 2px 0 rgba(255,246,228,.3);
  }
  .desk-hole .hb-side::before{
    content:""; position:absolute; left:50%; top:-2px; width:12px; height:58px; margin-left:-6px;
    background:#C9705A; border-radius:2px; box-shadow:0 2px 4px rgba(0,0,0,.3);
  }
  .desk-hole .hb-side::after{
    content:""; position:absolute; left:50%; top:19px; width:13px; height:13px; margin-left:-6px;
    border-radius:3px; background:#E8C778;
    box-shadow:0 2px 4px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.5);
  }
  .desk-hole .hole-book{
    position:absolute; left:26px; top:64px; width:54px; height:30px; opacity:.92;
    background:linear-gradient(165deg,#8F5B3C,#714427);
    border-radius:2px 5px 5px 2px;
    box-shadow:0 4px 8px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,246,228,.25);
    transform:rotate(-4deg);
  }
  .desk-hole .hole-book::before{
    content:""; position:absolute; left:0; top:0; bottom:0; width:6px;
    background:repeating-linear-gradient(90deg,#7A5C38 0 2px,#93724A 2px 4px);
  }
  .desk-hole .hole-book::after{
    content:"收到的纸条"; position:absolute; left:10px; right:4px; top:9px;
    font-family:var(--serif); font-size:6.5px; color:rgba(243,227,196,.85); letter-spacing:.1em; white-space:nowrap;
  }
  .desk-hole .hole-slip{
    position:absolute; width:34px; height:26px; background:rgba(251,244,228,.92); opacity:.85;
    box-shadow:0 4px 8px rgba(0,0,0,.4);
  }
  .desk-hole .hole-slip::before{
    content:""; position:absolute; top:-3px; left:50%; transform:translateX(-50%) rotate(-4deg);
    width:16px; height:5px; background:rgba(255,255,255,.6);
  }
  .desk-hole .hole-slip.hs1{ right:46px; bottom:20px; transform:rotate(-7deg); }
  .desk-hole .hole-slip.hs2{ left:32px; bottom:12px; transform:rotate(5deg); background:#F7E4DC; }
  .desk-hole:active .hb-side{ transform:translateX(-50%) rotate(-2deg) scale(.97); }

  .lamp-glow{
    position:absolute; left:40px; bottom:150px; width:280px; height:230px; z-index:2;
    background:radial-gradient(ellipse 62% 46% at 42% 18%, rgba(255,226,150,.36), transparent 72%);
    pointer-events:none; opacity:0; transition:opacity .45s;
  }
  .desk-page.lamp-on .lamp-glow{ opacity:1; }
  .desk-lamp.lit .shade::after{ box-shadow:0 0 26px 12px rgba(255,225,150,.75); }

  /* ---- 洞内 ---- */
  .hole-page{
    background:
      radial-gradient(80% 42% at 50% 0%, rgba(255,214,150,.14), transparent 55%),
      radial-gradient(90% 70% at 50% 40%, #4A3A29 0%, #33261A 55%, #221810 100%);
    overflow:hidden;
  }
  .hole-page::before, .hole-page::after{
    content:""; position:absolute; top:0; bottom:0; width:36px; z-index:1;
    background:
      var(--wood),
      repeating-linear-gradient(90deg,rgba(90,66,40,.5) 0 3px,rgba(60,44,28,.5) 3px 9px);
    background-size:230px 115px, auto;
    background-blend-mode:multiply, normal;
  }
  .hole-page::before{ left:0; }
  .hole-page::after{ right:0; }
  .hole-title{
    position:absolute; top:18px; left:0; right:0; text-align:center; z-index:2;
    color:rgba(246,231,208,.6); font-family:var(--ui); font-weight:600; font-size:11px; letter-spacing:.5em;
  }
  .hole-back{
    position:absolute; left:14px; top:12px; z-index:20; border:0; cursor:pointer;
    background:rgba(58,44,30,.7); border:1px solid rgba(201,169,111,.4); color:rgba(246,231,208,.9);
    border-radius:20px; padding:7px 13px; font-size:11px; font-family:var(--ui);
  }
  .hole-page .page-placeholder{ display:none; }
  .bigbox{ position:absolute; left:50%; bottom:100px; width:250px; height:210px; margin-left:-125px; perspective:560px; }
  .bb-hinge{
    position:absolute; left:24px; right:24px; top:-9px; height:10px; border-radius:4px 4px 0 0;
    background:linear-gradient(180deg,#C8BFA9,#A19684);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.55);
    z-index:4;
  }
  .bb-hinge::before, .bb-hinge::after{
    content:""; position:absolute; top:2px; width:5px; height:5px; border-radius:50%;
    background:#8A7E6A; box-shadow:inset 0 1px 1px rgba(255,255,255,.5);
  }
  .bb-hinge::before{ left:6px; }
  .bb-hinge::after{ right:6px; }
  .bb-depth{
    position:absolute; left:8px; right:8px; bottom:-8px; height:9px;
    background:linear-gradient(180deg,#8E8268,#6B6250);
    border-radius:0 0 10px 10px;
    box-shadow:0 10px 18px rgba(0,0,0,.45);
    z-index:0;
  }
  .bb-
  .bb-
  .bb-inside{
    position:absolute; left:3px; right:3px; top:4px; height:118px; border-radius:8px;
    background:linear-gradient(180deg,#6B6152,#4E4638);
    box-shadow:inset 0 8px 18px rgba(0,0,0,.55), inset 0 -2px 0 rgba(255,255,255,.12);
  }
  .bb-lid{
    position:absolute; left:-4px; right:-4px; top:-6px; height:126px;
    transform-style:preserve-3d; transform-origin:top center;
    transition:transform .85s cubic-bezier(.3,.75,.3,1);
    z-index:3; cursor:pointer;
  }
  .bigbox.open .bb-lid{ transform:rotateX(-152deg); }
  .bb-lid .lf, .bb-lid .li{ position:absolute; inset:0; border-radius:9px; backface-visibility:hidden; }
  .bb-lid .lf{
    border:2px solid #9A8F7B;
    background:
      linear-gradient(100deg, transparent 26%, rgba(255,255,255,.34) 44%, rgba(255,255,255,.1) 52%, transparent 64%),
      repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0 1px, transparent 1px 3px),
      linear-gradient(165deg,#DCD6CA,#C4BCA9 55%,#B0A48D);
    box-shadow:0 10px 24px rgba(0,0,0,.4), inset 0 2px 0 rgba(255,255,255,.55), inset 0 -3px 5px rgba(80,70,55,.28);
  }
  .bb-lid .lf::before{
    content:""; position:absolute; left:24px; right:24px; top:20px; bottom:24px;
    border-radius:6px;
    background:
      radial-gradient(60% 70% at 50% 40%, rgba(201,112,90,.22), rgba(201,112,90,.06) 70%, transparent),
      linear-gradient(180deg,#F6EFD9,#EBDFBC);
    border:1px solid rgba(122,94,49,.45);
    box-shadow:inset 0 0 0 3px rgba(255,255,255,.5), inset 0 0 0 4px rgba(122,94,49,.28), 0 1px 2px rgba(90,70,45,.25);
  }
  .bb-lid .lf::after{
    content:"心情盒子";
    position:absolute; left:0; right:0; top:56%;
    text-align:center;
    font-family:var(--serif); font-size:13px; letter-spacing:.34em; color:#7A5A2E;
    text-shadow:0 1px 0 rgba(255,255,255,.6);
  }
  .bb-lid .li{
    transform:rotateX(180deg);
    border:2px solid #B4A78F;
    background:
      linear-gradient(100deg, transparent 30%, rgba(255,255,255,.4) 47%, rgba(255,255,255,.1) 55%, transparent 66%),
      repeating-linear-gradient(0deg, rgba(255,255,255,.07) 0 1px, transparent 1px 3px),
      linear-gradient(180deg,#EFE7D6,#DFD4BE);
    box-shadow:inset 0 0 14px rgba(120,100,70,.28), inset 0 2px 0 rgba(255,255,255,.6);
  }
  .bigbox:not(.open) .bb-lid .li{ pointer-events:none; }
  .rolls{ position:absolute; left:10px; right:10px; top:5px; bottom:4px; z-index:2; }
  .roll{ position:absolute; text-align:center; cursor:pointer; transition:opacity .3s; }
  .roll.dim{ opacity:.18; pointer-events:none; }
  .roll .rc{
    width:40px; height:40px; position:relative; border-radius:50%;
    background:
      radial-gradient(circle at 36% 30%, rgba(255,255,255,.55), transparent 46%),
      repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.4) 0 2.4px, rgba(80,50,25,.24) 2.4px 4.8px),
      var(--mc,#F1E3C6);
    box-shadow:
      0 6px 10px rgba(15,10,6,.5),
      0 2px 3px rgba(15,10,6,.35),
      inset 0 0 0 1px rgba(118,94,60,.35),
      inset 0 -4px 8px rgba(88,66,38,.35),
      inset 0 3px 6px rgba(255,255,255,.7);
    transition:transform .2s;
  }
  .roll .rc::after{
    content:""; position:absolute; right:-5px; bottom:-3px; width:15px; height:12px;
    background:linear-gradient(180deg, rgba(255,255,255,.3), rgba(80,50,25,.18)), var(--mc,#F1E3C6);
    border-radius:0 0 3px 4px; transform:rotate(26deg); transform-origin:top left;
    box-shadow:0 3px 5px rgba(0,0,0,.3), inset 0 0 0 1px rgba(118,94,60,.25);
  }
  .roll:active .rc{ transform:scale(.9); }
  .roll .rtag{
    position:absolute; top:-11px; left:50%; transform:translateX(-50%);
    background:#FDFBF4; border:1px solid #D8CCB8; border-radius:3px;
    font-size:6.5px; color:#6E6455; font-family:var(--ui); padding:1px 4px;
    white-space:nowrap; box-shadow:0 2px 3px rgba(0,0,0,.4); z-index:3;
  }
  .hud-tl{ position:absolute; left:12px; right:12px; top:0; bottom:0; display:flex; align-items:center; justify-content:space-between; }
  .hud-tl::before{
    content:""; position:absolute; left:6px; right:6px; top:50%; height:2px; margin-top:-1px;
    background:linear-gradient(90deg,transparent,rgba(201,140,60,.55) 5%,rgba(201,140,60,.55) 95%,transparent);
    box-shadow:0 0 8px rgba(255,200,120,.5);
  }
  .hud-tl .hm{ font-size:6.5px; color:rgba(122,94,49,.75); font-family:var(--ui); flex:none; margin-right:3px; position:relative; z-index:1; }
  .hud-node{ position:relative; z-index:1; text-align:center; cursor:pointer; opacity:.55; transition:opacity .25s; min-width:15px; flex:none; }
  .hud-node.on{ opacity:1; }
  .hud-node .hf{ display:flex; justify-content:center; }
  .hud-node .hd{ font-size:7px; color:rgba(90,60,30,.8); margin-top:1px; white-space:nowrap; font-family:var(--ui); }
  .hud-node.on .hd{ color:#7A4A1E; font-weight:600; }
  .hud-node.on .hf{ filter:drop-shadow(0 0 5px rgba(255,190,110,.9)); }
  .hole-empty{
    position:absolute; left:0; right:0; top:46px; text-align:center;
    color:rgba(246,231,208,.5); font-size:10px; font-family:var(--serif);
  }
  .unroll-wrap{ position:relative; }
  .unroll-wrap::before{
    content:""; position:absolute; left:50%; top:-9px; width:62%; height:16px; margin-left:-31%; z-index:2;
    border-radius:8px;
    background:linear-gradient(180deg,#F6EDD8,#D9C9A8);
    box-shadow:0 3px 6px rgba(90,70,45,.35), inset 0 2px 3px rgba(255,255,255,.6);
    opacity:0;
  }
  .unroll-wrap.go::before{ animation:curlmove .8s ease both; }
  @keyframes curlmove{
    0%{ opacity:1; transform:translateY(0) rotate(-2deg); }
    70%{ opacity:1; }
    100%{ opacity:0; transform:translateY(28px) rotate(2deg); }
  }
  .unroll-paper{ transform-origin:top center; transform:scaleY(.05) scaleX(.85); }
  .unroll-paper.go{ animation:paperunroll .8s cubic-bezier(.25,.85,.3,1) both; }
  @keyframes paperunroll{
    0%{ transform:scaleY(.05) scaleX(.85); }
    35%{ transform:scaleY(.3) scaleX(.96); }
    70%{ transform:scaleY(.86) scaleX(1.02); }
    100%{ transform:scaleY(1) scaleX(1); }
  }
  .hole-zoom{
    position:absolute; inset:0; z-index:95; display:none;
    background:radial-gradient(circle at 50% 64%, #4A3826 0%, #241A10 62%);
    transform-origin:50% 64%;
  }
  .hole-zoom.play{ display:block; animation:holezoom .52s ease both; }
  @keyframes holezoom{
    from{ opacity:0; transform:scale(.12); }
    to{ opacity:1; transform:scale(1); }
  }
  .desk-lamp{ position:absolute; left:118px; bottom:392px; z-index:5; width:80px; height:100px; cursor:pointer; transform:scale(.8); transform-origin:bottom center; }
  .desk-lamp .shade{
    position:absolute; left:20px; top:0; width:46px; height:30px; border-radius:8px 8px 3px 3px;
    background:linear-gradient(165deg,#F2DA9E 0%,#E4C285 45%,#C89A5B 100%); transform:rotate(-8deg);
    box-shadow:0 6px 14px rgba(190,150,90,.35), inset 2px 2px 3px rgba(255,250,230,.6);
  }
  .desk-lamp .shade::after{
    content:""; position:absolute; left:4px; right:4px; bottom:-5px; height:6px;
    background:#F7E7C2; border-radius:50%; filter:blur(1px);
    box-shadow:0 0 18px 8px rgba(255,225,150,.55);
  }
  .desk-lamp .stem{ position:absolute; left:41px; top:26px; width:4px; height:48px; background:linear-gradient(90deg,#8A7355,#D9C39B 40%,#F1E4C6 52%,#A98F66 78%,#6E5940); border-radius:2px; }
  .desk-lamp .base{ position:absolute; left:26px; top:70px; width:34px; height:8px; border-radius:50%; background:#C7A776; }
  .cup{ position:absolute; right:168px; bottom:348px; z-index:6; width:36px; height:40px; }
  .cup-css{
    position:absolute; inset:0;
    background:linear-gradient(90deg,#E5DBC8,#FBF6EC 30%,#FBF6EC 62%,#E0D3BC);
    border-radius:3px 3px 10px 10px; box-shadow:0 8px 14px rgba(90,70,45,.2), inset -3px 0 4px rgba(160,140,110,.3);
  }
  .cup-css::before{
    content:""; position:absolute; right:-7px; top:8px; width:11px; height:13px;
    border:2px solid #F0E4D2; border-left:0; border-radius:0 8px 8px 0;
  }
  .cup-css::after{ content:""; position:absolute; left:5px; right:5px; top:5px; height:3px; border-radius:50%; background:#D8C3A0; }
  .notebook{
    position:absolute; left:36px; bottom:378px; z-index:4; width:74px; height:32px;
    background:#F7EDD9; border-radius:3px; transform:rotate(-6deg) scale(.9); transform-origin:bottom center;
    box-shadow:0 6px 12px rgba(90,70,45,.18); cursor:pointer;
  }
  .notebook::after{
    content:""; position:absolute; left:6px; right:6px; top:8px; height:1px; background:#E2D3B8;
    box-shadow:0 6px 0 #E2D3B8, 0 12px 0 #E2D3B8;
  }
  .pen{
    position:absolute; left:224px; bottom:362px; z-index:5; width:56px; height:5px; border-radius:3px;
    background:linear-gradient(90deg,#B4836A,#D3A88E); transform:rotate(8deg) scale(.95); transform-origin:center;
    box-shadow:0 3px 6px rgba(90,70,45,.2);
  }
  .desk-page .windy-placeholder{ display:none; }

  /* ---------- sheets / modals ---------- */
  .overlay{
    position:absolute; inset:0; z-index:70; background:rgba(52,44,35,.38);
    opacity:0; pointer-events:none; transition:opacity .25s; backdrop-filter:blur(2px);
  }
  .overlay.show{ opacity:1; pointer-events:auto; }
  .sheet{
    position:absolute; left:0; right:0; bottom:0; z-index:80;
    background:#FBFAF7; border-radius:20px 20px 0 0; padding:10px 18px 26px;
    transform:translateY(104%); transition:transform .32s cubic-bezier(.22,.9,.3,1);
    max-height:88%; overflow-y:auto; box-shadow:0 -14px 40px rgba(40,32,24,.16);
  }
  .sheet.show{ transform:translateY(0); }
  .sheet::-webkit-scrollbar{ width:0; }
  .sheet .grab{ width:38px; height:4px; border-radius:2px; background:#D8CCB8; margin:2px auto 14px; }
  .sheet .sheet-title{ display:flex; align-items:center; margin-bottom:14px; }
  .sheet .sheet-title h3{ font-family:var(--ui); font-size:15px; font-weight:600; }
  .sheet .sheet-title .x{
    margin-left:auto; width:28px; height:28px; border-radius:50%; border:0; background:#F1EFEA;
    color:#8E887E; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center;
  }
  .sheet .sheet-title .x svg{ width:12px; height:12px; }

  .modal{
    position:absolute; inset:0; z-index:85; display:flex; align-items:center; justify-content:center;
    padding:24px; opacity:0; pointer-events:none; transition:opacity .22s;
  }
  .modal.show{ opacity:1; pointer-events:auto; }
  .modal .backdrop{ position:absolute; inset:0; background:rgba(52,44,35,.42); backdrop-filter:blur(2px); }
  .modal .card{
    position:relative; width:100%; max-height:86%; overflow-y:auto; border-radius:20px;
    background:#FBFAF7; padding:20px 18px; box-shadow:0 24px 60px rgba(40,32,24,.3);
    transform:translateY(10px) scale(.98); transition:transform .22s;
  }
  .modal.show .card{ transform:none; }
  .modal .card::-webkit-scrollbar{ width:0; }
  .modal .card .mclose{
    position:absolute; right:12px; top:12px; width:28px; height:28px; border-radius:50%;
    border:0; background:#F1EFEA; color:#8E887E; cursor:pointer;
    display:flex; align-items:center; justify-content:center; z-index:2;
  }
  .modal .card .mclose svg{ width:12px; height:12px; }

  .detail-paper{ padding:20px 20px 26px; margin-bottom:14px; }
  .detail-paper .dtxt{ font-family:var(--serif); font-size:15px; line-height:2; white-space:pre-wrap; position:relative; }
  .detail-paper .dmeta{
    display:flex; align-items:center; gap:6px; margin-top:16px; padding-top:10px;
    border-top:1px dashed rgba(120,100,70,.18); font-size:9.5px; color:#A2947E; font-family:var(--ui);
  }
  .detail-paper .dmeta .ava{
    width:17px; height:17px; border-radius:50%; background:#E3D3B9; display:flex; align-items:center;
    justify-content:center; font-size:8px; color:#7B6C56;
  }
  .detail-paper img.doodle{ width:100%; border-radius:6px; margin-top:10px; background:#fff; position:relative; }
  .timer{
    display:flex; align-items:center; gap:8px; font-size:10px; color:#8E887E;
    background:#F7F5F1; border:1px solid #E7E4DD; border-radius:10px; padding:8px 11px; margin-bottom:14px;
  }
  .timer b{ font-weight:600; color:var(--accent); font-variant-numeric:tabular-nums; }
  .timer .bar{ flex:1; height:3px; border-radius:2px; background:#E9E6DF; overflow:hidden; }
  .timer .bar i{ display:block; height:100%; background:var(--accent); border-radius:2px; transition:width 1s linear; }
  .act-grid{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
  .act{
    display:flex; flex-direction:column; align-items:center; gap:6px; padding:12px 4px;
    border-radius:12px; background:#FFFFFF; border:1px solid #E7E4DD; cursor:pointer;
    font-size:10px; color:#57534B; font-family:var(--ui);
  }
  .act svg{ width:16px; height:16px; opacity:.7; }
  .act.danger{ color:var(--accent); }
  .act:active{ background:#F4F3EF; }

  .note-list{ display:flex; flex-direction:column; gap:10px; }
  .note-list .paper{ padding:13px 14px; font-size:12px; line-height:1.8; }
  .note-list .paper .m{ font-size:9px; color:#8E887E; margin-top:7px; font-family:var(--ui); position:relative; }
  .note-list .paper .acts{ display:flex; gap:8px; margin-top:9px; position:relative; }
  .note-list .paper .acts button{
    font-size:9.5px; font-family:var(--ui); border:1px solid #DAD7D0; background:transparent;
    color:#6E6A62; border-radius:7px; padding:4px 8px; cursor:pointer;
  }
  .empty{ text-align:center; padding:34px 0; color:#A29C92; font-size:11px; line-height:1.9; }
  .empty b{ display:block; font-family:var(--ui); font-size:14px; font-weight:600; color:#8E887E; margin-bottom:4px; }

  .tl{ position:relative; padding-left:26px; }
  .tl::before{
    content:""; position:absolute; left:8px; top:6px; bottom:6px; width:1px;
    background:repeating-linear-gradient(180deg,#D8D4CC 0 5px,transparent 5px 10px);
  }
  .tl-item{ position:relative; margin-bottom:20px; }
  .tl-item .node{
    position:absolute; left:-23px; top:2px; width:16px; height:16px; border-radius:50%;
    background:#FFFFFF; border:1px solid #D8D4CC; display:flex; align-items:center; justify-content:center;
  }
  .tl-item .node svg{ width:10px; height:10px; }
  .tl-item .date{ font-size:9px; color:#8E887E; margin-bottom:6px; }
  .tl-slip{ padding:13px 15px; }
  .tl-slip .face{ margin-bottom:6px; }
  .tl-slip p{ font-family:var(--serif); font-size:12.5px; line-height:1.85; white-space:pre-wrap; position:relative; }
  .tl-slip .foot{ display:flex; align-items:center; margin-top:9px; position:relative; gap:8px; }
  .tl-slip .foot .when{ font-size:9px; color:#A2947E; }
  .tl-slip .foot .share-flag{ font-size:8.5px; color:#9AAE8C; border:1px solid #CBD8C4; border-radius:6px; padding:2px 6px; }
  .tl-slip .foot .btns{ margin-left:auto; display:flex; gap:6px; }
  .tl-slip .foot button{
    font-size:9px; font-family:var(--ui); color:#8B8171;
    border:1px solid #DED2BD; background:transparent; border-radius:7px; padding:4px 8px; cursor:pointer;
  }

  .profile{ display:flex; align-items:center; gap:12px; margin-bottom:16px; }
  .profile .ava{
    width:56px; height:56px; border-radius:50%; flex:none;
    background:linear-gradient(150deg,#B9A08C,#9C8270); color:#FFF6EE;
    display:flex; align-items:center; justify-content:center; font-family:var(--ui); font-size:20px; font-weight:500;
    box-shadow:0 6px 14px rgba(120,100,80,.25);
  }
  .profile h3{ font-family:var(--ui); font-size:15px; font-weight:600; margin-bottom:3px; }
  .profile p{ font-size:10px; color:#8E887E; }
  .profile .edit{
    margin-left:auto; font-size:9.5px; color:#8B8171; border:1px solid #DED2BD;
    border-radius:8px; padding:5px 9px; background:transparent; cursor:pointer; font-family:var(--ui);
  }
  .member{
    position:relative; border-radius:14px; padding:14px 16px; overflow:hidden; margin-bottom:18px;
    background:linear-gradient(135deg,#4C463E,#6B6053 60%,#7C6B55);
    color:#F6EBD6; cursor:pointer;
  }
  .member::after{
    content:""; position:absolute; right:-26px; top:-40px; width:110px; height:110px; border-radius:50%;
    border:1px solid rgba(246,235,214,.22);
  }
  .member .m1{ display:flex; align-items:center; gap:6px; font-size:11.5px; letter-spacing:.06em; }
  .member .m1 svg{ width:13px; height:13px; }
  .member .m2{ font-size:9px; opacity:.6; margin-top:5px; }
  .member .tag{
    position:absolute; right:14px; bottom:14px; font-size:8.5px; letter-spacing:.1em;
    border:1px solid rgba(246,235,214,.35); border-radius:20px; padding:3px 8px;
  }
  .setting-row{
    display:flex; align-items:center; gap:10px; padding:13px 4px; cursor:pointer;
    border-bottom:1px solid #EDE4D4; font-size:12px; color:#5B5245;
  }
  .setting-row:last-child{ border-bottom:0; }
  .setting-row .ic{ width:18px; display:flex; justify-content:center; opacity:.6; }
  .setting-row .ic svg{ width:15px; height:15px; }
  .setting-row .val{ margin-left:auto; font-size:10px; color:#A2947E; }
  .setting-row .arr{ color:#C6B9A4; font-size:11px; margin-left:6px; }
  .setting-row .badge{
    min-width:16px; height:16px; border-radius:8px; background:#C0705A; color:#FFF6EA;
    font-size:8.5px; display:flex; align-items:center; justify-content:center; padding:0 4px;
    margin-left:auto;
  }
  .setting-row .badge + .arr{ margin-left:2px; }
  .setting-group-title{ font-size:9px; letter-spacing:.14em; color:#B0A390; margin:18px 2px 2px; }
  .toggle{
    margin-left:auto; width:34px; height:19px; border-radius:10px; background:#DDD2BF; position:relative;
    transition:background .2s; flex:none;
  }
  .toggle::after{
    content:""; position:absolute; top:2px; left:2px; width:15px; height:15px; border-radius:50%;
    background:#FFF9EE; transition:transform .2s; box-shadow:0 1px 2px rgba(0,0,0,.15);
  }
  .toggle.on{ background:#9AAE8C; }
  .toggle.on::after{ transform:translateX(15px); }

  .toast{
    position:absolute; left:50%; bottom:120px; transform:translate(-50%,10px); z-index:120;
    background:rgba(32,28,24,.92); color:#F5F3EF; font-size:11px; padding:9px 16px;
    border-radius:14px; opacity:0; pointer-events:none; transition:.25s; white-space:nowrap;
    max-width:86%; overflow:hidden; text-overflow:ellipsis;
    box-shadow:0 8px 20px rgba(0,0,0,.22);
  }
  .toast.show{ opacity:1; transform:translate(-50%,0); }

  /* ---- 详细设计批次 ---- */
  .time-filter{ position:absolute; top:72px; left:14px; z-index:24; display:flex; gap:6px; }
  .tf-chip{
    font-size:9.5px; padding:5px 10px; border-radius:14px; cursor:pointer;
    background:rgba(255,255,255,.94); border:1px solid #E5E2DB; color:#8E887E;
    box-shadow:0 2px 8px rgba(40,35,28,.06);
  }
  .tf-chip.on{ background:#2B2620; color:#F5F4F1; border-color:#2B2620; }

  .note-list .paper.env{ background:#F2EEE8; }
  .env-mark{
    display:inline-flex; align-items:center; gap:3px; font-size:8.5px; color:#8B8171;
    border:1px solid #DED2BD; border-radius:6px; padding:2px 6px; font-family:var(--ui);
    margin-left:6px;
  }
  .env-mark svg{ width:10px; height:10px; }

  .paste-anim{ position:absolute; inset:0; z-index:55; display:none; pointer-events:none; }
  .paste-anim.play{ display:block; }
  .paste-anim .glue{
    position:absolute; left:50%; top:42%; width:130px; height:60px; margin:-30px 0 0 -65px;
    background:radial-gradient(closest-side,rgba(255,248,230,.9),transparent);
    opacity:0;
  }
  .paste-anim.play .glue{ animation:gluefade .9s .3s ease both; }
  @keyframes gluefade{ 30%{opacity:.9;} 100%{opacity:0;} }
  .paste-anim .swipe{
    position:absolute; left:50%; top:42%; width:90px; height:90px; margin:-45px 0 0 -45px;
    color:rgba(178,95,73,.9); opacity:0;
  }
  .paste-anim.play .swipe{ animation:swipe .8s ease both; }
  @keyframes swipe{
    0%{ transform:translate(-110px,-70px) rotate(-35deg); opacity:0; }
    25%{ opacity:1; }
    100%{ transform:translate(110px,70px) rotate(25deg); opacity:0; }
  }
  .paste-anim .slap{
    position:absolute; left:50%; top:45%; width:170px; margin-left:-85px; margin-top:-40px;
    opacity:0;
  }
  .paste-anim.play .slap{ animation:slap .7s .55s ease both; }
  @keyframes slap{
    0%{ transform:scale(2.1) rotate(10deg); opacity:0; }
    35%{ opacity:1; }
    60%{ transform:scale(.94) rotate(-3deg); }
    100%{ transform:scale(1) rotate(0deg); opacity:1; }
  }

  .journey{ display:flex; align-items:center; gap:7px; margin-top:7px; }
  .journey .track{ flex:1; height:3px; border-radius:2px; background:#E9E6DF; overflow:hidden; position:relative; }
  .journey .track i{ position:absolute; left:0; top:0; bottom:0; width:0; background:var(--accent); border-radius:2px; transition:width .7s ease; }
  .journey .stage{ font-size:8.5px; color:#A09A90; white-space:nowrap; }
  .bubble.done .journey{ opacity:0; transition:opacity .6s .8s; }
  .readhint{ margin-top:5px; font-size:9px; color:#A3A99B; display:flex; align-items:center; gap:4px; }
  .readhint::before{ content:""; width:5px; height:5px; border-radius:50%; background:#B7C3AB; }
  .chat-tools{ display:flex; gap:6px; align-items:center; }
  .pencil{ filter:grayscale(1) contrast(1.12) brightness(1.04); }

  .glass-note{
    position:absolute; left:16px; top:14px; width:56px; padding:9px 6px; z-index:4; cursor:pointer;
    background:rgba(253,240,196,.92); font-family:var(--serif); font-size:8.5px; line-height:1.6;
    color:#7A5E1E; box-shadow:0 3px 8px rgba(80,60,20,.25); transform:rotate(-4deg); text-align:center;
  }
  .drift-letter{
    position:absolute; left:-46px; top:64px; z-index:2; width:40px; cursor:pointer;
    animation:driftacross 14s linear infinite;
  }
  @keyframes driftacross{
    0%{ transform:translateX(0) translateY(0) rotate(-6deg); }
    25%{ transform:translateX(80px) translateY(14px) rotate(5deg); }
    50%{ transform:translateX(160px) translateY(-8px) rotate(-7deg); }
    75%{ transform:translateX(240px) translateY(10px) rotate(4deg); }
    100%{ transform:translateX(320px) translateY(0) rotate(-5deg); }
  }
  .drift-letter.crumpled{ animation:crumple .8s ease forwards; }
  @keyframes crumple{
    40%{ transform:translate(150px,-10px) rotate(200deg) scale(.7); }
    100%{ transform:translate(150px,150px) rotate(560deg) scale(.12); opacity:0; }
  }
  .album{
    position:absolute; right:38px; bottom:338px; width:72px; height:34px; z-index:5;
    background:linear-gradient(165deg,#6E5338,#563F28);
    border-radius:4px 9px 9px 4px;
    box-shadow:0 10px 22px rgba(90,70,45,.32), inset 0 1px 0 rgba(255,246,228,.2);
    transform:rotate(4deg); cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    white-space:nowrap;
  }
  .album::before{ content:""; position:absolute; left:-4px; top:3px; width:5px; height:24px; border-radius:3px; background:#C9A96F; }
  .album span, .album text{ font-family:var(--serif); font-size:10px; color:#EBD9BD; letter-spacing:.15em; font-weight:600; white-space:nowrap; }

  .stamp-grid{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
  .stamp{
    border:2px dotted #C9B58E; border-radius:6px; padding:8px 4px 6px; text-align:center;
    background:#FBF3DF; cursor:pointer;
  }
  .stamp .sn{ font-family:var(--serif); font-size:9.5px; color:#7A5E1E; }
  .stamp .sd{ font-size:7.5px; color:#A2947E; margin-top:3px; }
  .stamp svg{ width:20px; height:20px; opacity:.6; margin-bottom:2px; }
  .stamp.empty{ border-style:dashed; background:transparent; }
  .stamp.empty .sn{ color:#B3A58D; }
  .album-title{ display:flex; align-items:center; margin-bottom:14px; }
  .album-title h3{ font-family:var(--ui); font-size:15px; font-weight:600; }
  .album-title span{ margin-left:auto; font-size:9px; color:#8E887E; }

  .citypass{ position:absolute; inset:0; z-index:90; display:none; overflow:hidden; background:linear-gradient(180deg,#3B4354 0%,#575063 45%,#8B7460 100%); }
  .citypass.play{ display:block; }
  .cp-buildings{ position:absolute; left:0; right:0; bottom:18%; }
  .cp-buildings i{ position:absolute; bottom:0; background:#2E2A26; border-radius:3px 3px 0 0; }
  .cp-buildings i::after{
    content:""; position:absolute; inset:0;
    background:repeating-linear-gradient(0deg,rgba(255,225,150,.16) 0 3px,transparent 3px 9px);
  }
  .cp-l1{ height:120px; }
  .cp-l2{ height:190px; opacity:.85; }
  .citypass.play .cp-l1{ animation:citymove 1.4s linear both; }
  .citypass.play .cp-l2{ animation:citymove2 1.4s linear both; }
  @keyframes citymove{ from{ transform:translateX(55%);} to{ transform:translateX(-28%);} }
  @keyframes citymove2{ from{ transform:translateX(28%);} to{ transform:translateX(-42%);} }
  .cp-caption{
    position:absolute; left:0; right:0; top:26%; text-align:center; color:#F3E9D6;
    font-family:var(--serif); font-size:12px; letter-spacing:.3em; opacity:0;
  }
  .citypass.play .cp-caption{ animation:capfade 1.4s ease both; }
  @keyframes capfade{ 20%{opacity:0;} 45%{opacity:1;} 85%{opacity:1;} 100%{opacity:0;} }
  .cp-window{
    position:absolute; left:50%; top:38%; width:74px; height:88px; margin:-44px 0 0 -37px;
    border:5px solid #E0CDB1; border-radius:6px; background:linear-gradient(180deg,#F6D98F,#E8A85F);
    box-shadow:0 0 40px 12px rgba(255,215,140,.45); opacity:0;
  }
  .citypass.play .cp-window{ animation:winappear 1.4s ease both; }
  @keyframes winappear{ 55%{opacity:0; transform:scale(.6);} 80%{opacity:1; transform:scale(1.05);} 100%{opacity:1; transform:scale(1);} }
  .cp-window::before, .cp-window::after{ content:""; position:absolute; background:#E0CDB1; }
  .cp-window::before{ left:50%; top:0; bottom:0; width:4px; transform:translateX(-50%); }
  .cp-window::after{ top:50%; left:0; right:0; height:4px; transform:translateY(-50%); }

  .visit-page{ background:#EFE4D2; overflow:hidden; }
  .back-btn{
    position:absolute; left:14px; top:12px; z-index:20; border:0; cursor:pointer;
    background:rgba(252,248,238,.8); border:1px solid #DCCFB8; color:#74695A;
    border-radius:20px; padding:7px 13px; font-size:11px; font-family:var(--ui);
  }
  .visit-actions{ position:absolute; left:16px; right:16px; bottom:26px; z-index:15; display:flex; gap:8px; }
  .visit-actions button{
    flex:1; height:42px; border-radius:12px; border:1px solid #DCD1BD; background:rgba(252,248,238,.9);
    color:#5B5245; font-size:11px; font-family:var(--ui); cursor:pointer;
    box-shadow:0 6px 14px rgba(90,70,45,.14);
  }
  .visit-actions button.main{ background:#4A4238; color:#FBF5E8; border-color:#4A4238; }
  .visit-hint{ position:absolute; left:0; right:0; bottom:78px; text-align:center; font-size:9px; color:rgba(90,70,45,.5); z-index:14; }

  .write-paper textarea{
    width:100%; min-height:88px; resize:none; border:0; outline:none; background:none;
    font-family:var(--serif); font-size:13px; line-height:1.9; color:#4A4238; position:relative;
  }
  .write-foot{ display:flex; gap:8px; margin-top:14px; }
  .write-foot button{
    flex:1; height:40px; border-radius:11px; border:0; cursor:pointer; font-family:var(--ui); font-size:11.5px;
  }
  .write-foot .ok{ background:#A85A44; color:#FFF6EF; }
  .write-foot .no{ background:transparent; border:1px solid #DAD7D0; color:#6E6A62; }
  .letter-actions{ display:flex; gap:8px; margin-top:14px; }
  .letter-actions button{
    flex:1; height:42px; border-radius:12px; border:0; cursor:pointer; font-family:var(--ui); font-size:11.5px;
  }
  .letter-actions .reply{ background:#2B2620; color:#F5F4F1; }
  .letter-actions .drop{ background:transparent; border:1px solid #DAD7D0; color:#6E6A62; }

  .fly-paper{
    position:absolute; z-index:110; width:120px; padding:12px; background:#FDFBF4;
    box-shadow:0 10px 20px rgba(50,40,30,.3); font-family:var(--serif); font-size:10px; line-height:1.6;
    border-radius:2px;
    transition:transform .8s cubic-bezier(.3,.7,.4,1), opacity .8s; pointer-events:none;
  }
  .title-chip{
    font-size:9px; color:#9C4A5C; border:1px solid #E8C7CE; background:#FBF0EB;
    border-radius:12px; padding:2px 8px; margin-left:8px; display:inline-block; vertical-align:middle; font-weight:400;
  }

  .tiles{ position:absolute; inset:0; z-index:1; overflow:hidden; }
  .tiles img{
    position:absolute; width:195.2px; height:195.2px;
    user-select:none; -webkit-user-drag:none; background:#F1EDE6;
  }
  .map-brand{
    position:absolute; left:14px; bottom:76px; z-index:23; pointer-events:none;
    font-size:7px; color:#8E887E; background:rgba(255,255,255,.82); border-radius:4px; padding:2px 5px;
    letter-spacing:.03em; font-family:var(--ui);
  }

  /* ---- 写实质感层 ---- */
  .tex{ position:absolute; inset:0; pointer-events:none; border-radius:inherit; }
  .tex-noise{ background-image:var(--noise); background-size:110px; mix-blend-mode:overlay; opacity:.32; }
  .tex-wood{ background-image:var(--wood); background-size:230px 115px; mix-blend-mode:multiply; opacity:.55; }
  .tex-metal{ background-image:var(--metal); background-size:170px 85px; mix-blend-mode:overlay; opacity:.42; }

  .phone::before{
    content:""; position:absolute; inset:0; z-index:128; pointer-events:none;
    background:radial-gradient(135% 115% at 50% 42%, transparent 58%, rgba(36,24,12,.2));
  }
  .phone::after{
    content:""; position:absolute; inset:0; z-index:129; pointer-events:none;
    background-image:var(--noise); background-size:130px;
    mix-blend-mode:overlay; opacity:.15;
  }

  .osh{
    position:absolute; height:10px; border-radius:50%;
    background:rgba(70,50,30,.3); filter:blur(4px); z-index:1; pointer-events:none;
  }
  .motes{ position:absolute; pointer-events:none; z-index:6; }
  .motes i{
    position:absolute; width:3px; height:3px; border-radius:50%;
    background:rgba(255,236,190,.85); filter:blur(.6px);
    animation:mote 9s ease-in-out infinite;
  }
  .motes i:nth-child(2){ width:2px; height:2px; animation-delay:2.2s; }
  .motes i:nth-child(3){ animation-delay:4.4s; }
  .motes i:nth-child(4){ width:2px; height:2px; animation-delay:1.2s; }
  .motes i:nth-child(5){ width:4px; height:4px; animation-delay:6s; }
  @keyframes mote{
    0%,100%{ transform:translate(0,0); opacity:.12; }
    50%{ transform:translate(10px,-18px); opacity:.85; }
  }
  .bshadow{
    position:absolute; left:50%; bottom:84px; width:276px; height:22px; margin-left:-138px;
    border-radius:50%; background:rgba(0,0,0,.55); filter:blur(10px); z-index:0; pointer-events:none;
  }

  @media (max-width:430px){
    
    
    .phone{ width:100%; height:100dvh; border-radius:0; box-shadow:none; }
    .notch{ display:none; }
    .statusbar{ height:36px; padding-top:6px; }
  }


.desk-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 50px;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.desk-phone {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--bg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.desk-header {
  position: absolute;
  top: 14px;
  left: 18px;
  right: 18px;
  z-index: 25;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.desk-meta-box {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.owner-ava {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.meta-texts {
  display: flex;
  flex-direction: column;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.title-row .desk-title {
  font-family: var(--ui);
  font-size: 13px;
  font-weight: 700;
  color: #5D4F3E;
  letter-spacing: 0.1em;
}

.desk-tag {
  font-size: 8px;
  background: #E8DECE;
  color: #7A6953;
  padding: 1px 5px;
  border-radius: 8px;
  font-weight: 600;
}

.sub-text {
  font-size: 8.5px;
  color: #9A9184;
}

.desk-top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-pill-btn {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #D8D4CC;
  color: #74695A;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 14px;
  cursor: pointer;
}

.gear-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #D8D4CC;
  color: #74695A;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(40, 35, 28, 0.1);
  backdrop-filter: blur(6px);
}
.gear-btn svg { width: 16px; height: 16px; }

.dhead {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.dhead-ava {
  width: 26px;
  height: 26px;
  border-radius: 50%;
}
.dhead-author {
  font-size: 12px;
  font-weight: 700;
  color: #5D4F3E;
}

/* 浮动菜单 */
.gear-pop-overlay {
  position: absolute;
  inset: 0;
  z-index: 120;
  background: rgba(40, 32, 24, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.gear-card {
  width: 100%;
  max-width: 280px;
  background: #FBFAF7;
  border-radius: 18px;
  padding: 16px 18px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.3);
}
.gear-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px dashed #E2DCCF;
  margin-bottom: 10px;
}
.gear-title { font-size: 13px; font-weight: 700; color: #5D4F3E; }
.gear-close { font-size: 15px; color: #8E887E; cursor: pointer; padding: 4px; }
.gear-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 4px;
  border-bottom: 1px solid #F1EFEA;
  cursor: pointer;
}
.row-label { font-size: 11px; color: #6E685D; font-weight: 500; }
.row-val { font-size: 11px; color: #9A7B56; font-weight: 600; }


/* 👑 会员装扮工坊与信件样式 */
.shop-pill-btn {
  background: linear-gradient(135deg, #FFE8B6, #F5D38A);
  border: 1px solid #DDB86C;
  border-radius: 14px;
  padding: 3px 9px;
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(120, 90, 40, 0.2);
  transition: transform 0.2s;
  &:active { transform: scale(0.94); }
}
.shop-badge { font-size: 11px; }
.shop-text { font-size: 10px; font-weight: 700; color: #6D4C1B; }

.letter-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.letter-actions button {
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.letter-actions .drop-btn {
  background: #F1EFEA;
  border: 1px solid #D8D4CC;
  color: #74695A;
}
.letter-actions .reply-btn {
  background: #A85A44;
  border: 0;
  color: #FFF;
  box-shadow: 0 4px 10px rgba(168, 90, 68, 0.3);
}

.decor-shop-modal .shop-card {
  max-width: 340px;
  padding: 20px 16px;
}
.shop-header {
  text-align: center;
  margin-bottom: 14px;
}
.shop-title {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #4D3D2C;
}
.shop-sub {
  display: block;
  font-size: 9px;
  color: #8C755E;
  margin-top: 3px;
}
.shop-tabs {
  display: flex;
  border-bottom: 1px solid #EBE5DB;
  margin-bottom: 14px;
}
.s-tab {
  flex: 1;
  text-align: center;
  padding: 6px 0 8px;
  font-size: 11px;
  color: #8E887E;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}
.s-tab.active {
  color: #7A5E1E;
  font-weight: 700;
  border-bottom-color: #7A5E1E;
}
.decor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
}
.decor-card {
  border: 1.5px solid #E5E0D5;
  border-radius: 10px;
  padding: 8px;
  background: #FFF;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: border-color 0.2s;
}
.decor-card.equipped {
  border-color: #C9A24B;
  background: #FFFDF8;
}
.decor-preview-box {
  width: 100%;
  height: 52px;
  border-radius: 6px;
  position: relative;
  box-shadow: inset 0 0 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: flex-start;
  padding: 4px;
}
.preview-badge {
  font-size: 7.5px;
  background: rgba(0,0,0,0.6);
  color: #FFE6A8;
  padding: 1px 4px;
  border-radius: 4px;
}
.decor-name {
  font-size: 11px;
  font-weight: 600;
  color: #4D3D2C;
  margin-top: 6px;
}
.decor-price {
  font-size: 9px;
  color: #A2825B;
  margin-top: 2px;
}
.equip-btn {
  margin-top: 6px;
  font-size: 9.5px;
  padding: 4px;
  border-radius: 6px;
  border: 1px solid #D8D4CC;
  background: #F8F6F1;
  color: #6E685D;
}
.decor-card.equipped .equip-btn {
  background: #7A5E1E;
  color: #FFF;
  border-color: #7A5E1E;
}

/* 花盆款式换肤 */
.plant-pot.pot-ceramic {
  background: linear-gradient(180deg, #F8F6F0, #E0DBD0) !important;
  box-shadow: 0 6px 10px rgba(40,30,20,.2), inset 0 2px 0 rgba(255,255,255,.9) !important;
}
.plant-pot.pot-woodlog {
  background: linear-gradient(180deg, #8A633F, #614225) !important;
}
.plant-pot.pot-teapot {
  background: linear-gradient(180deg, #9BA9B2, #6F7D86) !important;
}

/* 课桌材质换肤 */
.school-desk.desk-style-cherry .sd-top,
.school-desk.desk-style-cherry .sd-front {
  background: linear-gradient(180deg, #DE9A8B, #C27D6E) !important;
}
.school-desk.desk-style-retro .sd-top,
.school-desk.desk-style-retro .sd-front {
  background: linear-gradient(180deg, #648267, #48634A) !important;
}
.school-desk.desk-style-modern .sd-top,
.school-desk.desk-style-modern .sd-front {
  background: linear-gradient(180deg, #DCE2EA, #C2C8D1) !important;
}

/* ============ V3 无损增量样式（墙纸、地形楼房、右墙便签墙、桌面课程表、桌宠、桌洞扩展栏） ============ */
.desk-page .wall.wp-linen {
  background: radial-gradient(90% 70% at 62% 30%, #EFE6D6 0%, #E2D5BE 58%, #D3C3A7 100%) !important;
}
.desk-page .wall.wp-sage {
  background: radial-gradient(90% 70% at 62% 30%, #E8F0E5 0%, #D8E5D4 58%, #C4D6BF 100%) !important;
}
.desk-page .wall.wp-starry {
  background: radial-gradient(90% 70% at 62% 30%, #DCE4EF 0%, #C6D3E5 58%, #B2C3DA 100%) !important;
}

.school-desk.desk-style-walnut {
  .sd-plane { background: linear-gradient(180deg, #795548 0%, #65453A 55%, #54372E 100%) !important; }
  .sd-top { background: linear-gradient(180deg, #8A6254 0%, #6D4C41 45%, #563A31 100%) !important; }
  .sd-front { background: linear-gradient(180deg, #634439, #4A3129) !important; }
}
.school-desk.desk-style-cream {
  .sd-plane { background: linear-gradient(180deg, #FAF5EA 0%, #F1E8D7 55%, #E7DBC5 100%) !important; }
  .sd-top { background: linear-gradient(180deg, #FFFDF8 0%, #EFE5D3 45%, #DFD2BA 100%) !important; }
  .sd-front { background: linear-gradient(180deg, #ECE2CF, #DACDB6) !important; }
}
.school-desk.desk-style-sakura {
  .sd-plane { background: linear-gradient(180deg, #F6DCE0 0%, #ECC5CB 55%, #E0B1B9 100%) !important; }
  .sd-top { background: linear-gradient(180deg, #FBE6E9 0%, #E9BEC5 45%, #D8A4AE 100%) !important; }
  .sd-front { background: linear-gradient(180deg, #E4B8C0, #D09BA4) !important; }
}

/* 窗外地形自适应楼房/古城/雪山/海滨轮廓 */
.sc-buildings {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 46%;
  pointer-events: none;
  opacity: 0.72;
  transition: all 0.5s ease;

  &.tr-city {
    background: linear-gradient(180deg, #6E8194, #536578);
    clip-path: polygon(0 100%, 0 44%, 13% 44%, 13% 18%, 27% 18%, 27% 52%, 44% 52%, 44% 12%, 60% 12%, 60% 42%, 76% 42%, 76% 24%, 90% 24%, 90% 48%, 100% 48%, 100% 100%);
  }
  &.tr-ancient {
    background: linear-gradient(180deg, #64554B, #463A32);
    clip-path: polygon(0 100%, 0 60%, 16% 32%, 34% 60%, 50% 22%, 70% 60%, 86% 34%, 100% 60%, 100% 100%);
  }
  &.tr-mountain {
    background: linear-gradient(180deg, #6B8972, #4E6A55);
    clip-path: polygon(0 100%, 20% 26%, 45% 74%, 72% 14%, 100% 76%, 100% 100%);
  }
  &.tr-coastal {
    background: linear-gradient(180deg, #5495BC, #3A769C);
    clip-path: polygon(0 100%, 0 58%, 28% 50%, 58% 60%, 84% 48%, 100% 54%, 100% 100%);
  }
}

/* 右墙便签墙 (与左墙 .board 对称景深) */
.right-sticky-board {
  position: absolute;
  right: 22px;
  top: 296px;
  width: 104px;
  z-index: 7;
  cursor: pointer;

  .rsb-bd {
    position: relative;
    width: 104px;
    height: 132px;
    border-radius: 6px;
    background: rgba(253, 250, 242, 0.86);
    border: 2px dashed #C7B293;
    box-shadow: 0 10px 20px rgba(90, 70, 45, 0.16);
    transform: rotate(1.6deg);
    padding: 6px;
    box-sizing: border-box;
  }

  .rsb-tag {
    display: block;
    font-size: 8px;
    font-weight: 700;
    color: #8A6D44;
    text-align: center;
    margin-bottom: 4px;
  }

  .rsb-mini {
    position: absolute;
    width: 42px;
    padding: 4px;
    font-family: var(--serif);
    font-size: 6.5px;
    line-height: 1.45;
    color: #5B5140;
    background: #FFF6C8;
    box-shadow: 0 2px 4px rgba(90, 70, 45, 0.16);
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;

    &.s1 { left: 6px; top: 22px; transform: rotate(-3deg); background: #FFF5C2; }
    &.s2 { right: 6px; top: 44px; transform: rotate(3deg); background: #E3F2E5; }
    &.s3 { left: 22px; bottom: 10px; transform: rotate(-1.5deg); background: #FCE4EC; }
  }
}

/* 桌面立式课程表 (需求 18) */
.desk-schedule-card {
  position: absolute;
  right: 36px;
  bottom: 386px;
  width: 82px;
  height: 52px;
  z-index: 6;
  background: #FFFDF7;
  border: 1px solid #DFD3BC;
  border-radius: 6px;
  box-shadow: 0 6px 12px rgba(60, 45, 30, 0.22);
  transform: rotate(2.5deg);
  padding: 6px 6px 4px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;

  .dsc-clip {
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 6px;
    border-radius: 3px;
    background: #A98B5E;
  }

  .dsc-title {
    font-size: 8.5px;
    font-weight: 700;
    color: #3E2723;
  }

  .dsc-next {
    font-size: 7.5px;
    color: #A85A44;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* 桌面宠物扩展位 */
.desk-pet-companion {
  position: absolute;
  right: 122px;
  bottom: 382px;
  z-index: 7;
  cursor: pointer;
  filter: drop-shadow(0 5px 8px rgba(60, 45, 30, 0.28));
  .pet-emoji { font-size: 30px; }
}

/* 桌洞内模块化收纳快捷栏 */
.hole-modular-dock {
  position: absolute;
  top: 52px;
  left: 14px;
  right: 14px;
  z-index: 18;
  white-space: nowrap;

  .dock-pills-row {
    display: inline-flex;
    gap: 8px;
    padding: 4px 2px;
  }

  .hole-mod-pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 11px;
    border-radius: 14px;
    background: rgba(253, 249, 238, 0.14);
    border: 1px solid rgba(232, 206, 158, 0.42);
    color: #F6E7C5;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;

    &.extra {
      border-style: dashed;
      color: #F3D19C;
    }
  }
}

/* V3 手账抽屉通用样式 */
.v3-drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 210;
  background: rgba(34, 24, 18, 0.52);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.v3-drawer-sheet {
  width: 100%;
  max-width: 430px;
  max-height: 74vh;
  background: #FFFDF8;
  border-radius: 20px 20px 0 0;
  padding: 10px 16px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.v3-bar {
  width: 38px;
  height: 4px;
  border-radius: 2px;
  background: #D7CCC8;
  margin: 0 auto 10px;
}

.v3-h1 {
  font-size: 16px;
  font-weight: 700;
  color: #3E2723;
  margin-bottom: 10px;
}

.v3-scroll {
  flex: 1;
  min-height: 160px;
  max-height: 340px;
  margin-bottom: 10px;
}

.v3-note-card {
  background: #FFFBEF;
  border: 1px solid #EEE0B4;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 8px;

  .v3-note-head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .v3-note-from { font-size: 12px; font-weight: 700; color: #3E2723; }
  .v3-note-cat { font-size: 10px; color: #A85A44; background: #FFF2E0; padding: 1px 6px; border-radius: 8px; }
  .v3-note-txt { font-size: 13px; color: #3E2723; line-height: 1.55; }
}

.v3-add-row {
  display: flex;
  gap: 6px;
  align-items: center;

  &.compact { margin-bottom: 8px; }

  .v3-inp {
    flex: 1;
    background: #F5F1E8;
    border: 1px solid #E2D8C8;
    border-radius: 12px;
    padding: 8px 10px;
    font-size: 12px;
    color: #3E2723;
    &.short { flex: none; width: 64px; }
  }

  .v3-type-btn {
    padding: 8px 10px;
    border-radius: 12px;
    background: #F3E8D2;
    color: #3E2723;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .v3-btn {
    padding: 8px 12px;
    border-radius: 12px;
    background: #3E2723;
    color: #FFFDF8;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    flex-shrink: 0;
  }
}

.v3-days-row { display: flex; gap: 5px; margin-bottom: 10px; }
.v3-day-pill {
  flex: 1;
  text-align: center;
  padding: 5px 0;
  border-radius: 10px;
  background: #F4EFE4;
  font-size: 11px;
  color: #6D4C41;
  cursor: pointer;
  &.active { background: #3E2723; color: #FFFDF8; font-weight: 700; }
}

.v3-empty { text-align: center; padding: 28px 0; font-size: 12px; color: #8D6E63; }

.v3-sch-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #FFFBEF;
  border: 1px solid #EEE0B4;
  border-radius: 12px;
  margin-bottom: 8px;
  .v3-sch-time { font-size: 13px; font-weight: 700; color: #C25B38; width: 46px; }
  .v3-sch-info { flex: 1; }
  .v3-sch-title { display: block; font-size: 13px; font-weight: 700; color: #3E2723; }
  .v3-sch-room { display: block; font-size: 11px; color: #8D6E63; }
  .v3-del { font-size: 12px; color: #A1887F; padding: 4px; cursor: pointer; }
}

.v3-album-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.v3-album-card {
  background: #FFFDF8;
  border: 1px solid #E6DCC8;
  border-radius: 10px;
  padding: 6px 6px 10px;
  .v3-album-img { width: 100%; height: 110px; border-radius: 6px; }
  .v3-album-cap { display: block; font-size: 12px; font-weight: 600; color: #3E2723; margin-top: 6px; }
  .v3-album-loc { display: block; font-size: 10px; color: #8D6E63; }
}

.v3-cat-scroll { width: 100%; white-space: nowrap; margin-bottom: 8px; }
.v3-cat-row { display: inline-flex; gap: 6px; }
.v3-cat-pill {
  padding: 4px 12px;
  border-radius: 14px;
  background: #F4EFE4;
  font-size: 12px;
  color: #5D4037;
  cursor: pointer;
  &.active { background: #3E2723; color: #FFFDF8; font-weight: 600; }
}

.v3-ledger-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 10px;
  border-bottom: 0.5px solid #EFE7D8;
  .v3-lg-title { display: block; font-size: 13px; font-weight: 600; color: #3E2723; }
  .v3-lg-date { display: block; font-size: 10px; color: #8D6E63; }
  .v3-lg-amt { font-size: 14px; font-weight: 700; &.expense { color: #C25B38; } &.income { color: #2E7D32; } }
}

.v3-gift-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #FFFBEF;
  border: 1px solid #EEE0B4;
  border-radius: 12px;
  margin-bottom: 8px;
  .v3-gift-ico { font-size: 24px; }
  .v3-gift-info { flex: 1; }
  .v3-gift-name { display: block; font-size: 13px; font-weight: 700; color: #3E2723; }
  .v3-gift-msg { display: block; font-size: 11px; color: #8D6E63; margin-top: 2px; }
  .v3-gift-date { font-size: 10px; color: #9E8B7A; }
  .v3-equip-pill {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 12px;
    background: #F0E6D2;
    color: #5D4037;
    &.on { background: #3E2723; color: #FFFDF8; }
  }
}
/* ============ 原型级构图与光影精细升级（彻底解决顶栏叠压、左右侧墙透视零遮挡、桌面分区明晰） ============ */
.desk-page .wall.night-room {
  background: radial-gradient(85% 70% at 50% 28%, #343949 0%, #262A36 62%, #1D202A 100%) !important;
}

.desk-header {
  position: absolute !important;
  top: 10px !important;
  left: 14px !important;
  right: 14px !important;
  height: 44px !important;
  padding: 0 !important;
  z-index: 30 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;

  .desk-meta-box {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 4px 12px 4px 5px !important;
    border-radius: 22px !important;
    background: rgba(255, 253, 248, 0.88) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(214, 198, 174, 0.78) !important;
    box-shadow: 0 4px 12px rgba(62, 39, 35, 0.08) !important;
    max-width: 230px !important;
    overflow: hidden !important;

    .owner-ava {
      width: 30px !important;
      height: 30px !important;
      border-radius: 50% !important;
      flex-shrink: 0 !important;
    }

    .meta-texts {
      display: flex !important;
      flex-direction: column !important;
      min-width: 0 !important;
    }

    .title-row {
      display: flex !important;
      align-items: center !important;
      gap: 5px !important;
    }

    .desk-title-inline {
      font-size: 12px !important;
      font-weight: 700 !important;
      color: #3E2723 !important;
      line-height: 1.2 !important;
      position: static !important;
      letter-spacing: 0 !important;
    }

    .desk-tag {
      font-size: 9px !important;
      padding: 1px 5px !important;
      border-radius: 6px !important;
      background: #F3E8D2 !important;
      color: #8B5A2B !important;
      font-weight: 600 !important;
    }

    .sub-text {
      font-size: 10px !important;
      color: #795548 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      margin-top: 1px !important;
    }
  }

  .shop-pill-btn {
    background: linear-gradient(135deg, #4A3128, #3E2723) !important;
    color: #FFF8EB !important;
    border: none !important;
    padding: 6px 12px !important;
    border-radius: 18px !important;
    box-shadow: 0 4px 12px rgba(62, 39, 35, 0.22) !important;
    .shop-text { color: #FFF8EB !important; font-weight: 600 !important; }
  }
}

/* 窗帘下移至安全区下方，绝不穿插顶栏 */
.curtains {
  top: 64px !important;
  height: 230px !important;
  z-index: 12 !important;
}
.curtains::before {
  left: 56px !important;
  right: 56px !important;
}
.curtain {
  width: 44px !important;
  height: 218px !important;
}
.curtain.cl { left: calc(50% - 122px) !important; }
.curtain.cr { right: calc(50% - 122px) !important; }

/* 居中收窄大窗，为左右侧墙留出完整透视空间 */
.window-frame {
  top: 74px !important;
  width: 214px !important;
  height: 218px !important;
  border-width: 9px !important;
  z-index: 7 !important;
}

.sc-terrain-svg {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 112px;
  pointer-events: none;
  z-index: 1;
}

.windowsill {
  top: 288px !important;
  width: 248px !important;
  height: 15px !important;
  z-index: 9 !important;
}

/* 窗台多肉保留浇水特效并精准落位 */
.succulent {
  left: calc(50% - 116px) !important;
  top: 216px !important;
  z-index: 14 !important;
}

/* 斜射进桌面的温暖窗光光束 */
.desk-sunbeam {
  position: absolute;
  top: 294px;
  left: 50%;
  transform: translateX(-50%);
  width: 290px;
  height: 210px;
  background: linear-gradient(180deg, rgba(255, 244, 208, 0.32) 0%, rgba(255, 240, 195, 0.06) 78%, transparent 100%);
  clip-path: polygon(16% 0, 84% 0, 100% 100%, 0 100%);
  pointer-events: none;
  z-index: 11;
  transition: opacity 0.6s ease;
}
.desk-page.night-mode .desk-sunbeam {
  opacity: 0.04;
}

/* 左右对称侧墙：完全悬于桌面上方，带真实空间透视，绝不遮挡！ */
.board {
  left: 8px !important;
  top: 162px !important;
  width: 68px !important;
  z-index: 10 !important;

  .bd {
    width: 68px !important;
    height: 128px !important;
    border-width: 4px !important;
    transform: perspective(260px) rotateY(16deg) !important;
  }

  .mini {
    width: 52px !important;
    left: 4px !important;
    right: auto !important;
    font-size: 6.5px !important;
    padding: 4px 3px !important;
    overflow: hidden !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
  }
  .m1 { top: 8px !important; }
  .m2 { top: 44px !important; }
  .m3 { top: 82px !important; }
}

.right-sticky-board {
  right: 8px !important;
  top: 162px !important;
  width: 68px !important;
  z-index: 10 !important;

  .rsb-bd {
    width: 68px !important;
    height: 128px !important;
    transform: perspective(260px) rotateY(-16deg) !important;
    padding: 5px 4px !important;
  }

  .rsb-mini {
    width: 54px !important;
    left: 5px !important;
    right: auto !important;
    &.s1 { top: 22px !important; }
    &.s2 { top: 56px !important; }
    &.s3 { top: 90px !important; bottom: auto !important; }
  }
}

/* 近景桌面道具精准分区：台灯(左后)、手账书(左前)、课程表(中后)、冒热气咖啡(中前)、宠物窝(右侧) */
.desk-lamp {
  left: 54px !important;
  bottom: 392px !important;
  z-index: 6 !important;
}

.notebook.hardcover-book {
  left: 28px !important;
  bottom: 318px !important;
  width: 92px !important;
  height: 62px !important;
  padding: 8px 10px !important;
  border-radius: 4px 10px 10px 4px !important;
  background: linear-gradient(135deg, #FFFBF0, #F3E3BD) !important;
  box-shadow: -4px 5px 0 #7C583A, 0 10px 18px rgba(70, 50, 28, 0.24) !important;
  border: 1px solid #E3CFA0 !important;
  transform: rotate(-5deg) !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  z-index: 7 !important;

  &::after { display: none !important; }
  .hb-title { font-size: 11px; font-weight: 700; color: #3E2723; }
  .hb-sub { font-size: 9px; color: #8D6E63; }
  .hb-ribbon {
    position: absolute;
    right: 10px;
    bottom: -10px;
    width: 8px;
    height: 15px;
    background: #B94A38;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%);
  }
}

.desk-schedule-card {
  left: 142px !important;
  right: auto !important;
  bottom: 378px !important;
  width: 106px !important;
  height: 64px !important;
  transform: none !important;
  border: 2px solid #C8AD82 !important;
  border-radius: 8px !important;
  padding: 7px 8px !important;
  z-index: 7 !important;

  .dsc-title { font-size: 10px !important; }
  .dsc-next { font-size: 9px !important; color: #C25B38 !important; font-weight: 600 !important; }
}

.cup {
  left: 170px !important;
  right: auto !important;
  bottom: 316px !important;
  z-index: 8 !important;
}

.cup-steam {
  position: absolute;
  top: -18px;
  left: 8px;
  width: 18px;
  height: 16px;
  pointer-events: none;

  .st {
    position: absolute;
    bottom: 0;
    width: 2px;
    height: 12px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.85);
    filter: blur(1px);
    animation: cupSteamRise 2.4s ease-in-out infinite;
  }
  .s1 { left: 3px; }
  .s2 { left: 9px; animation-delay: 0.8s; }
  .s3 { left: 15px; animation-delay: 1.5s; }
}
@keyframes cupSteamRise {
  0% { transform: translateY(4px) scaleY(0.6); opacity: 0; }
  50% { opacity: 0.78; }
  100% { transform: translateY(-10px) scaleY(1.2); opacity: 0; }
}

.desk-pet-nest {
  position: absolute;
  right: 22px;
  bottom: 320px;
  width: 84px;
  height: 66px;
  z-index: 8;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;

  .pet-emoji {
    font-size: 32px;
    margin-bottom: -12px;
    z-index: 2;
    filter: drop-shadow(0 4px 6px rgba(60, 40, 20, 0.24));
    animation: petNestBreathe 3s ease-in-out infinite;
  }

  .pet-cushion {
    width: 74px;
    height: 22px;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 35%, #F5E6CC, #D4B48C);
    box-shadow: 0 6px 12px rgba(70, 50, 28, 0.22);
  }
}
@keyframes petNestBreathe {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-3px) scale(1.04); }
}
/* ============ 「桌洞里」实木分隔抽屉全景样式（零空洞、全拟物实物、避开悬浮导航栏） ============ */
.hole-organizer-page {
  display: flex !important;
  flex-direction: column !important;
  padding: 0 18px !important;
  box-sizing: border-box !important;
}

.hole-top-light {
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
  height: 140px;
  background: linear-gradient(180deg, rgba(255, 232, 182, 0.2) 0%, transparent 100%);
  pointer-events: none;
  z-index: 2;
}

.hole-org-header {
  position: relative;
  z-index: 20;
  padding: 14px 4px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;

  .hole-back-btn {
    padding: 6px 13px;
    border-radius: 18px;
    background: rgba(255, 248, 232, 0.12);
    border: 1px solid rgba(226, 198, 148, 0.35);
    color: #F6E7C8;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }

  .hole-org-title {
    font-size: 13px;
    font-weight: 700;
    color: rgba(246, 231, 200, 0.9);
    letter-spacing: 5px;
  }

  .hole-org-count {
    font-size: 10px;
    color: rgba(226, 198, 148, 0.68);
  }
}

.hole-org-scroll {
  position: relative;
  z-index: 10;
  flex: 1;
  min-height: 0;
  padding-bottom: calc(92px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.drawer-organizer {
  padding: 10px;
  margin-bottom: 18px;
  border-radius: 14px;
  background: rgba(30, 20, 13, 0.44);
  border: 2px solid #5E452F;
  box-shadow: inset 0 10px 26px rgba(0, 0, 0, 0.58), 0 2px 0 rgba(255, 235, 200, 0.12);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wood-comp {
  position: relative;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(64, 47, 32, 0.54) 0%, rgba(42, 30, 20, 0.74) 100%);
  border: 1.5px solid rgba(132, 98, 66, 0.56);
  box-shadow: inset 0 6px 14px rgba(0, 0, 0, 0.48), 0 1px 0 rgba(255, 236, 200, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
}

.comp-label {
  position: absolute;
  bottom: 6px;
  font-size: 10px;
  font-weight: 600;
  color: rgba(246, 231, 200, 0.88);
  letter-spacing: 0.8px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.65);
}

.comp-badge {
  position: absolute;
  top: 7px;
  right: 8px;
  font-size: 9px;
  padding: 1px 6px;
  border-radius: 8px;
  background: rgba(255, 245, 224, 0.14);
  color: #EBD4AA;
  z-index: 5;
}

.org-row-top {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 10px;
  height: 142px;
}

.prop-album {
  position: relative;
  width: 112px;
  height: 80px;
  margin-bottom: 12px;
  border-radius: 4px 10px 10px 4px;
  background: linear-gradient(155deg, #ECE2CE, #D5C4A6);
  box-shadow: -4px 6px 0 #8F7554, 0 10px 18px rgba(0, 0, 0, 0.45);
  transform: rotate(-3deg);
  padding: 8px 10px;
  box-sizing: border-box;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 10px;
    background: #9B7E5A;
    border-radius: 4px 0 0 4px;
  }

  .prop-album-t {
    display: block;
    font-size: 10px;
    font-weight: 700;
    color: #5D4037;
    margin-left: 8px;
    margin-top: 6px;
  }

  .prop-album-s {
    display: block;
    font-size: 8px;
    color: #8D6E63;
    margin-left: 8px;
    margin-top: 3px;
  }

  .album-polaroid-peek {
    position: absolute;
    right: -8px;
    top: -10px;
    width: 42px;
    height: 48px;
    background: #FFFDF8;
    padding: 4px 4px 11px;
    border-radius: 3px;
    transform: rotate(11deg);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
    box-sizing: border-box;
  }

  .album-polaroid-pic {
    width: 100%;
    height: 100%;
    border-radius: 1px;
    background: linear-gradient(180deg, #8BC0DF, #E8CFA2 70%, #6B5C4E);
  }
}

.prop-jewelry {
  position: relative;
  width: 82px;
  height: 74px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: linear-gradient(155deg, #2F5242, #1D372B);
  border: 2px solid #C8A563;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.48), inset 0 2px 8px rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  .jw-ico { font-size: 17px; }

  .jewelry-clasp {
    position: absolute;
    bottom: -4px;
    width: 18px;
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(180deg, #F0D28A, #C49A45);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  }
}

/* 第二排 C 位：完整保留原版 3D 金属心情铁盒 */
.org-row-mid {
  height: 196px;
  padding-top: 12px;
  overflow: visible;
}

.bigbox.org-bigbox {
  position: relative !important;
  left: auto !important;
  bottom: auto !important;
  margin: 0 0 12px 0 !important;
  width: 244px !important;
  height: 132px !important;
}

.org-row-lower {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 10px;
  height: 136px;
}

.prop-notes-book {
  position: relative;
  width: 122px;
  height: 76px;
  margin-bottom: 12px;
  border-radius: 4px 10px 10px 4px;
  background: linear-gradient(165deg, #8F5B3C, #6B4024);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255, 240, 215, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: rotate(1.5deg);

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 11px;
    background: repeating-linear-gradient(90deg, #6E492A 0 3px, #855C39 3px 6px);
    border-radius: 4px 0 0 4px;
  }

  .pnb-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #F5E3C2; margin-left: 8px; }
  .pnb-sub { font-size: 8px; color: rgba(245, 227, 194, 0.72); margin-left: 8px; margin-top: 3px; }

  .index-tab {
    position: absolute;
    right: -13px;
    width: 15px;
    height: 16px;
    border-radius: 0 4px 4px 0;
    font-size: 7.5px;
    font-weight: 700;
    color: #4A3525;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

    &.t1 { top: 9px; background: #F9D7DF; }
    &.t2 { top: 30px; background: #D8ECD9; }
    &.t3 { top: 51px; background: #FBE8B6; }
  }
}

.prop-ledger {
  position: relative;
  width: 74px;
  height: 80px;
  margin-bottom: 12px;
  border-radius: 4px 8px 8px 4px;
  background: linear-gradient(160deg, #D8B480, #B88E56);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: rotate(-2deg);

  .ledger-band {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 12px;
    width: 6px;
    background: #4E342E;
  }

  .pl-title { font-size: 11px; font-weight: 700; color: #4E342E; margin-right: 8px; }
  .pl-sub { font-size: 8px; color: #6D4C41; margin-right: 8px; margin-top: 3px; }
}

.org-row-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  height: 112px;
}

.prop-gift {
  position: relative;
  width: 76px;
  height: 52px;
  margin-bottom: 14px;
  border-radius: 6px;
  background: linear-gradient(180deg, #E8C59B, #CE9F6E);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.45);

  &::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 10px;
    margin-left: -5px;
    background: #C2523E;
  }

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 10px;
    margin-top: -5px;
    background: #C2523E;
  }

  .gift-bow {
    position: absolute;
    top: -11px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 16px;
    z-index: 2;
  }
}

.extra-slot-comp {
  border: 1.5px dashed rgba(232, 198, 140, 0.45) !important;
  background: rgba(34, 24, 16, 0.36) !important;

  .extra-plus-ico {
    font-size: 26px;
    color: rgba(243, 209, 156, 0.82);
    margin-bottom: 14px;
  }

  .extra-lbl {
    color: #F3D19C;
  }
}
</style>
