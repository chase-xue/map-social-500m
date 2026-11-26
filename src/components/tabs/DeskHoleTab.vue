<template>
  <view class="desk-container" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="desk-phone" :class="['wp-' + decor.wallpaperStyle, { 'lamp-on': isLampLit }]">
      <!-- ==================== 1. 三层景深书桌主景 ==================== -->
      <view v-show="!isHolePageActive" class="page desk-page">
        <!-- 顶栏：头像/天气 + 右上角独立装扮页入口 -->
        <view class="desk-header">
          <view class="desk-meta-box" @tap="handleViewOwnerProfile">
            <image class="owner-ava" :src="currentDesk.ownerAvatar" mode="aspectFill" />
            <view class="meta-texts">
              <view class="title-row">
                <text class="desk-title">{{ isVisitingOther ? (currentDesk.ownerName + '的桌洞') : '我的桌洞' }}</text>
                <text class="desk-tag">{{ terrainName }}</text>
              </view>
              <text class="sub-text">{{ weatherIcon }} {{ weatherLabel }}{{ liveTempC !== null ? ' ' + liveTempC + '°C' : '' }} · 访客 {{ currentDesk.visitorCount }}</text>
            </view>
          </view>

          <view class="desk-top-actions">
            <view v-if="isVisitingOther" class="back-pill-btn" @tap="exitVisiting">
              <text>‹ 回我桌洞</text>
            </view>
            <view v-else class="decor-entry-btn" @tap="decorPageVisible = true">
              <text class="decor-ico">🎨</text>
              <text class="decor-txt">装扮</text>
            </view>
          </view>
        </view>

        <!-- 远景层：窗户（实时天气 + 地形楼房轮廓，点击可手动切换） -->
        <view class="window-stage" @tap="windowControlVisible = true">
          <view class="window-sky" :class="'w-' + currentDesk.weather">
            <view v-if="currentDesk.weather === 'sunny'" class="sky-sun" />
            <view v-if="currentDesk.weather === 'night'" class="sky-moon" />
            <view v-if="currentDesk.weather === 'cloudy' || currentDesk.weather === 'sunny'" class="sky-cloud c1" />
            <view v-if="currentDesk.weather === 'cloudy'" class="sky-cloud c2" />
            <view v-if="currentDesk.weather === 'rainy'" class="sky-rain" />
            <!-- 根据附近地形动态切换的建筑/风景轮廓 -->
            <view class="terrain-silhouette" :class="'tr-' + decor.terrain" />
            <view class="window-hint-pill">点击切天气/窗景</view>
          </view>
          <view class="window-mullion v" />
          <view class="window-mullion h" />
          <!-- 两侧窗帘 -->
          <view class="curtain-side left" :class="'curt-' + decor.curtainStyle" />
          <view class="curtain-side right" :class="'curt-' + decor.curtainStyle" />
        </view>

        <!-- 中景层：左墙留言板 + 右墙便签墙（景深错落） -->
        <view class="mid-depth-walls">
          <!-- 左边：留言板 -->
          <view class="left-message-board" @tap="boardModalVisible = true">
            <text class="wall-board-title">📌 留言板</text>
            <view class="mini-notes-col">
              <view
                v-for="n in currentDesk.windowNotes.slice(0, 2)"
                :key="n.id"
                class="mini-board-slip"
                :class="'c-' + n.color"
              >
                <text class="slip-txt">{{ n.content.slice(0, 14) }}</text>
              </view>
            </view>
          </view>

          <!-- 右边：便签墙 -->
          <view class="right-sticky-wall" @tap="stickyWallModalVisible = true">
            <text class="wall-board-title">📝 便签墙</text>
            <view class="sticky-wall-grid">
              <view
                v-for="sw in (currentDesk.stickyWallNotes || []).slice(0, 3)"
                :key="sw.id"
                class="mini-sticky-tile"
                :class="'c-' + sw.color"
              >
                <text class="sticky-txt">{{ sw.content.slice(0, 10) }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 近景层：实木写字台（一本书 + 课程表 + 宠物扩展角 + 桌洞入口） -->
        <view class="desk-surface-wrap" :class="'desk-skin-' + decor.deskStyle">
          <view class="desk-top-plane">
            <!-- 1. 桌面一本书（日记手账本） -->
            <view class="desk-book-item" @tap="bookModalVisible = true">
              <view class="book-spine" />
              <view class="book-cover">
                <text class="book-title">手账本</text>
                <text class="book-sub">{{ currentDesk.diaryEntries.length }} 篇</text>
              </view>
            </view>

            <!-- 2. 桌面课程表（需求 18） -->
            <view class="desk-schedule-stand" @tap="scheduleModalVisible = true">
              <view class="schedule-clip" />
              <text class="sch-head">📅 课程表</text>
              <text class="sch-preview">{{ nextScheduleText }}</text>
            </view>

            <!-- 3. 桌面宠物扩展位（需求 14 预留） -->
            <view class="desk-pet-corner" @tap="decorPageVisible = true">
              <text v-if="decor.petSlot !== 'none'" class="pet-avatar-ico">
                {{ decor.petSlot === 'cat' ? '🐱' : decor.petSlot === 'shiba' ? '🐕' : '🐦' }}
              </text>
              <view v-else class="pet-empty-hint">
                <text class="pet-plus">🐾</text>
                <text class="pet-tip">宠物位</text>
              </view>
            </view>
          </view>

          <!-- 书桌前脸 + 立体桌洞入口 -->
          <view class="desk-front-apron">
            <view class="desk-hole-cavity" @tap="enterDeskHole">
              <view class="cavity-glow" />
              <view class="cavity-items-peek">
                <text class="peek-ico">🫧</text>
                <text class="peek-ico">📷</text>
                <text class="peek-ico">📌</text>
                <text class="peek-ico">📒</text>
                <text class="peek-ico">🎁</text>
                <text class="peek-ico">💍</text>
              </view>
              <text class="cavity-label">点击潜入桌洞 · 收纳与扩展槽位 ›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- ==================== 2. 「桌洞里」模块化收纳空间（需求 16） ==================== -->
      <view v-if="isHolePageActive" class="page hole-drawer-page">
        <view class="hole-top-bar">
          <view class="hole-back-pill" @tap="isHolePageActive = false">‹ 回到桌前</view>
          <text class="hole-main-title">桌 洞 里</text>
          <view class="hole-slot-badge">{{ 6 + (currentDesk.extraSlots?.length || 0) }} 个槽位</view>
        </view>

        <scroll-view scroll-y class="hole-modules-scroll">
          <!-- 6 大核心收纳盒 + 扩展槽位 -->
          <view class="hole-boxes-grid">
            <view class="box-tile mood-box" @tap="activeHoleModule = 'mood'">
              <text class="box-ico">🫧</text>
              <text class="box-name">心情盒子</text>
              <text class="box-meta">{{ currentDesk.diaryEntries.length }} 卷心情</text>
            </view>

            <view class="box-tile album-box" @tap="activeHoleModule = 'album'">
              <text class="box-ico">📷</text>
              <text class="box-name">相册</text>
              <text class="box-meta">{{ currentDesk.albumPhotos?.length || 0 }} 张回忆</text>
            </view>

            <view class="box-tile notes-box" @tap="activeHoleModule = 'collected'">
              <text class="box-ico">📌</text>
              <text class="box-name">收藏的纸条</text>
              <text class="box-meta">{{ (currentDesk.noteCategories?.length || 1) - 1 }} 个分类</text>
            </view>

            <view class="box-tile ledger-box" @tap="activeHoleModule = 'ledger'">
              <text class="box-ico">📒</text>
              <text class="box-name">记账本</text>
              <text class="box-meta">结余 ¥{{ ledgerBalance }}</text>
            </view>

            <view class="box-tile gift-box" @tap="activeHoleModule = 'gifts'">
              <text class="box-ico">🎁</text>
              <text class="box-name">收到礼物</text>
              <text class="box-meta">{{ currentDesk.gifts?.length || 0 }} 件心意</text>
            </view>

            <view class="box-tile jewelry-box" @tap="activeHoleModule = 'jewelry'">
              <text class="box-ico">💍</text>
              <text class="box-name">首饰盒</text>
              <text class="box-meta">{{ currentDesk.jewelry?.length || 0 }} 件饰品</text>
            </view>

            <!-- 已添加的扩展槽位 -->
            <view
              v-for="slot in currentDesk.extraSlots || []"
              :key="slot.id"
              class="box-tile extra-slot-tile"
              @tap="openExtraSlot(slot)"
            >
              <text class="box-ico">{{ slot.icon }}</text>
              <text class="box-name">{{ slot.name }}</text>
              <text class="box-meta">扩展槽位</text>
            </view>

            <!-- 新增扩展槽位按钮 -->
            <view class="box-tile add-slot-tile" @tap="showAddSlotDrawer = true">
              <text class="box-ico">＋</text>
              <text class="box-name">扩展槽位</text>
              <text class="box-meta">添加新盒子</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- ==================== 3. 各类手账抽屉弹窗 ==================== -->

      <!-- A. 窗外天气 & 地形手动切换抽屉（需求 13） -->
      <view v-if="windowControlVisible" class="drawer-mask" @tap="windowControlVisible = false">
        <view class="drawer-sheet" @tap.stop>
          <view class="drawer-bar" />
          <text class="drawer-h1">🪟 窗外天气与地形风景</text>
          <text class="drawer-sub">默认随定位实时同步，也可随时手动切换</text>

          <text class="group-label">天气氛围</text>
          <view class="chip-grid-4">
            <view
              v-for="w in weatherList"
              :key="w.id"
              class="sel-chip"
              :class="{ active: currentDesk.weather === w.id }"
              @tap="setManualWeather(w.id)"
            >
              {{ w.icon }} {{ w.label }}
            </view>
          </view>

          <text class="group-label">附近地形楼房</text>
          <view class="chip-grid-2">
            <view
              v-for="t in terrainList"
              :key="t.id"
              class="sel-chip"
              :class="{ active: decor.terrain === t.id }"
              @tap="setManualTerrain(t.id)"
            >
              {{ t.icon }} {{ t.label }}
            </view>
          </view>
        </view>
      </view>

      <!-- B. 左墙留言板抽屉（需求 15） -->
      <view v-if="boardModalVisible" class="drawer-mask" @tap="boardModalVisible = false">
        <view class="drawer-sheet tall-sheet" @tap.stop>
          <view class="drawer-bar" />
          <text class="drawer-h1">📌 左墙留言板</text>
          <scroll-view scroll-y class="sheet-scroll">
            <view v-for="n in currentDesk.windowNotes" :key="n.id" class="note-row-card" :class="'c-' + n.color">
              <text class="note-row-txt">{{ n.content }}</text>
              <text class="note-row-meta">{{ n.authorName }}</text>
            </view>
          </scroll-view>
          <view class="inline-add-bar">
            <input class="inline-inp" v-model="newBoardText" placeholder="在留言板写一句..." maxlength="60" />
            <view class="inline-btn" @tap="submitBoardNote">贴上</view>
          </view>
        </view>
      </view>

      <!-- C. 右墙便签墙抽屉（需求 15） -->
      <view v-if="stickyWallModalVisible" class="drawer-mask" @tap="stickyWallModalVisible = false">
        <view class="drawer-sheet tall-sheet" @tap.stop>
          <view class="drawer-bar" />
          <text class="drawer-h1">📝 右墙便签墙</text>
          <scroll-view scroll-y class="sheet-scroll">
            <view v-for="sw in currentDesk.stickyWallNotes || []" :key="sw.id" class="note-row-card" :class="'c-' + sw.color">
              <text class="note-row-txt">{{ sw.content }}</text>
            </view>
          </scroll-view>
          <view class="inline-add-bar">
            <input class="inline-inp" v-model="newStickyText" placeholder="记一条贴在便签墙..." maxlength="60" />
            <view class="inline-btn" @tap="submitStickyNote">贴上</view>
          </view>
        </view>
      </view>

      <!-- D. 桌面手账书抽屉（需求 15） -->
      <view v-if="bookModalVisible" class="drawer-mask" @tap="bookModalVisible = false">
        <view class="drawer-sheet tall-sheet" @tap.stop>
          <view class="drawer-bar" />
          <text class="drawer-h1">📖 桌面手账本</text>
          <scroll-view scroll-y class="sheet-scroll">
            <view v-for="d in currentDesk.diaryEntries" :key="d.id" class="diary-card">
              <view class="diary-head">
                <text class="diary-title">{{ d.title }}</text>
                <text class="diary-date">{{ d.dateStr }}</text>
              </view>
              <text class="diary-body">{{ d.content }}</text>
            </view>
          </scroll-view>
          <view class="inline-add-bar">
            <input class="inline-inp" v-model="newDiaryText" placeholder="写下今天的一段随笔..." maxlength="150" />
            <view class="inline-btn" @tap="submitDiaryEntry">记入书页</view>
          </view>
        </view>
      </view>

      <!-- E. 桌面课程表抽屉（需求 18） -->
      <view v-if="scheduleModalVisible" class="drawer-mask" @tap="scheduleModalVisible = false">
        <view class="drawer-sheet tall-sheet" @tap.stop>
          <view class="drawer-bar" />
          <text class="drawer-h1">📅 桌面课程表</text>
          <view class="day-pills-row">
            <view
              v-for="d in weekDays"
              :key="d"
              class="day-pill"
              :class="{ active: activeScheduleDay === d }"
              @tap="activeScheduleDay = d"
            >
              {{ d }}
            </view>
          </view>
          <scroll-view scroll-y class="sheet-scroll">
            <view v-if="filteredSchedule.length === 0" class="empty-box-tip">{{ activeScheduleDay }} 暂无课程安排，享受慢时光～</view>
            <view v-for="sc in filteredSchedule" :key="sc.id" class="schedule-row">
              <text class="sc-time">{{ sc.time }}</text>
              <view class="sc-info">
                <text class="sc-title">{{ sc.title }}</text>
                <text v-if="sc.room" class="sc-room">📍 {{ sc.room }}</text>
              </view>
              <text class="sc-del" @tap="removeScheduleItem(sc.id)">✕</text>
            </view>
          </scroll-view>
          <view class="schedule-add-form">
            <input class="sch-inp time" v-model="newCourseTime" placeholder="09:00" maxlength="8" />
            <input class="sch-inp name" v-model="newCourseTitle" placeholder="课程/待办名称" maxlength="20" />
            <view class="inline-btn" @tap="addScheduleItem">添加</view>
          </view>
        </view>
      </view>

      <!-- F. 桌洞 6 大子模块详情抽屉（需求 16） -->
      <view v-if="activeHoleModule" class="drawer-mask" @tap="activeHoleModule = null">
        <view class="drawer-sheet tall-sheet" @tap.stop>
          <view class="drawer-bar" />

          <!-- 1) 心情盒子 -->
          <template v-if="activeHoleModule === 'mood'">
            <text class="drawer-h1">🫧 心情盒子</text>
            <scroll-view scroll-y class="sheet-scroll">
              <view v-for="d in currentDesk.diaryEntries" :key="d.id" class="diary-card">
                <view class="diary-head">
                  <text class="diary-title">{{ d.title }}</text>
                  <text class="diary-date">{{ d.dateStr }}</text>
                </view>
                <text class="diary-body">{{ d.content }}</text>
              </view>
            </scroll-view>
          </template>

          <!-- 2) 相册 -->
          <template v-else-if="activeHoleModule === 'album'">
            <text class="drawer-h1">📷 桌洞相册</text>
            <scroll-view scroll-y class="sheet-scroll">
              <view class="album-grid">
                <view v-for="ph in currentDesk.albumPhotos || []" :key="ph.id" class="album-card">
                  <image class="album-img" :src="ph.url" mode="aspectFill" />
                  <text class="album-cap">{{ ph.caption }}</text>
                  <text class="album-loc">{{ ph.location }} · {{ ph.dateStr }}</text>
                </view>
              </view>
            </scroll-view>
          </template>

          <!-- 3) 收藏的纸条（支持自定义新增分类） -->
          <template v-else-if="activeHoleModule === 'collected'">
            <text class="drawer-h1">📌 收藏的纸条</text>
            <scroll-view scroll-x class="cat-pills-scroll" :show-scrollbar="false">
              <view class="cat-pills-row">
                <view
                  v-for="cat in currentDesk.noteCategories || ['全部']"
                  :key="cat"
                  class="cat-pill"
                  :class="{ active: activeNoteCat === cat }"
                  @tap="activeNoteCat = cat"
                >
                  {{ cat }}
                </view>
              </view>
            </scroll-view>
            <view class="inline-add-bar compact">
              <input class="inline-inp" v-model="newCategoryName" placeholder="新建收藏分类（如：读书摘抄）" maxlength="10" />
              <view class="inline-btn" @tap="addNoteCategory">+ 分类</view>
            </view>
            <scroll-view scroll-y class="sheet-scroll">
              <view v-for="note in filteredDrawerNotes" :key="note.id" class="diary-card">
                <view class="diary-head">
                  <text class="diary-title">{{ note.senderName }}</text>
                  <text class="diary-date">{{ note.category || '未分类' }}</text>
                </view>
                <text class="diary-body">{{ note.fullContent }}</text>
              </view>
            </scroll-view>
          </template>

          <!-- 4) 记账本 -->
          <template v-else-if="activeHoleModule === 'ledger'">
            <text class="drawer-h1">📒 手账记账本</text>
            <view class="ledger-summary">
              <text>本月结余：<text class="bal-num">¥{{ ledgerBalance }}</text></text>
            </view>
            <scroll-view scroll-y class="sheet-scroll">
              <view v-for="item in currentDesk.ledger || []" :key="item.id" class="ledger-row">
                <view>
                  <text class="lg-cat">{{ item.category }} · {{ item.note }}</text>
                  <text class="lg-date">{{ item.dateStr }}</text>
                </view>
                <text class="lg-amt" :class="item.type">
                  {{ item.type === 'expense' ? '-' : '+' }}¥{{ item.amount }}
                </text>
              </view>
            </scroll-view>
            <view class="schedule-add-form">
              <view class="type-toggle" @tap="newLedgerType = newLedgerType === 'expense' ? 'income' : 'expense'">
                {{ newLedgerType === 'expense' ? '支出' : '收入' }}
              </view>
              <input class="sch-inp time" type="digit" v-model="newLedgerAmount" placeholder="金额" />
              <input class="sch-inp name" v-model="newLedgerNote" placeholder="备注(如咖啡)" maxlength="14" />
              <view class="inline-btn" @tap="addLedgerEntry">记一笔</view>
            </view>
          </template>

          <!-- 5) 收到礼物 -->
          <template v-else-if="activeHoleModule === 'gifts'">
            <text class="drawer-h1">🎁 收到的礼物</text>
            <scroll-view scroll-y class="sheet-scroll">
              <view v-for="g in currentDesk.gifts || []" :key="g.id" class="gift-row">
                <text class="gift-ico">{{ g.icon }}</text>
                <view class="gift-info">
                  <text class="gift-name">{{ g.name }}（{{ g.from }} 赠）</text>
                  <text class="gift-msg">{{ g.message }}</text>
                </view>
                <text class="gift-date">{{ g.dateStr }}</text>
              </view>
            </scroll-view>
          </template>

          <!-- 6) 首饰盒 -->
          <template v-else-if="activeHoleModule === 'jewelry'">
            <text class="drawer-h1">💍 首饰盒</text>
            <scroll-view scroll-y class="sheet-scroll">
              <view v-for="j in currentDesk.jewelry || []" :key="j.id" class="gift-row" @tap="toggleJewelryEquip(j.id)">
                <text class="gift-ico">{{ j.icon }}</text>
                <view class="gift-info">
                  <text class="gift-name">{{ j.name }}</text>
                  <text class="gift-msg">{{ j.rarity }}</text>
                </view>
                <view class="equip-pill" :class="{ on: j.equipped }">{{ j.equipped ? '已佩戴' : '佩戴' }}</view>
              </view>
            </scroll-view>
          </template>
        </view>
      </view>

      <!-- G. 添加扩展槽位抽屉 -->
      <view v-if="showAddSlotDrawer" class="drawer-mask" @tap="showAddSlotDrawer = false">
        <view class="drawer-sheet" @tap.stop>
          <view class="drawer-bar" />
          <text class="drawer-h1">➕ 新增桌洞扩展槽位</text>
          <text class="drawer-sub">把你想收纳的新手账模块放进桌洞</text>
          <view class="inline-add-bar">
            <input class="inline-inp" v-model="newSlotName" placeholder="槽位名（如：票根夹 / 书单 / 植物志）" maxlength="10" />
            <view class="inline-btn" @tap="confirmAddSlot">添加</view>
          </view>
        </view>
      </view>

      <!-- H. 独立全屏装扮新页面（需求 14） -->
      <DeskDecorPage
        :visible="decorPageVisible"
        :statusBarHeight="statusBarHeight"
        :modelValue="decor"
        @close="decorPageVisible = false"
        @save="handleSaveDecor"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { TerrainType } from "../../types";
import {
  getMyDeskData,
  saveMyDeskData,
  getOtherDeskData,
  addWindowNote,
  addDiaryMemory,
  fetchRealtimeWeather,
  DeskHoleData,
  DeskDecorConfig,
  ScheduleItem,
  ExtraSlotModule
} from "../../services/deskService";
import { useAppState } from "../../composables/useAppState";
import DeskDecorPage from "../modals/DeskDecorPage.vue";

const {
  statusBarHeight,
  userLocation,
  activeLandmark,
  myProfile,
  targetVisitingDesk,
  openProfileByUserId,
  openMyProfileSheet
} = useAppState();

const currentDesk = ref<DeskHoleData>(getMyDeskData());
const isVisitingOther = ref(false);
const isLampLit = ref(true);
const isHolePageActive = ref(false);
const liveTempC = ref<number | null>(null);

// 弹窗状态
const decorPageVisible = ref(false);
const windowControlVisible = ref(false);
const boardModalVisible = ref(false);
const stickyWallModalVisible = ref(false);
const bookModalVisible = ref(false);
const scheduleModalVisible = ref(false);
const activeHoleModule = ref<"mood" | "album" | "collected" | "ledger" | "gifts" | "jewelry" | null>(null);
const showAddSlotDrawer = ref(false);

// 表单输入
const newBoardText = ref("");
const newStickyText = ref("");
const newDiaryText = ref("");
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

const decor = computed<DeskDecorConfig>(() => {
  return currentDesk.value.decor || {
    deskStyle: "classic",
    curtainStyle: 1,
    wallpaperStyle: "warm",
    terrain: currentDesk.value.terrain || "city",
    petSlot: "none"
  };
});

const weatherList = [
  { id: "sunny" as const, icon: "☀️", label: "晴朗" },
  { id: "cloudy" as const, icon: "⛅", label: "多云" },
  { id: "rainy" as const, icon: "🌧️", label: "细雨" },
  { id: "night" as const, icon: "🌙", label: "静夜" },
];

const terrainList: { id: TerrainType; icon: string; label: string }[] = [
  { id: "city", icon: "🏙️", label: "都市楼宇" },
  { id: "ancient", icon: "🏯", label: "古城青瓦" },
  { id: "mountain", icon: "🏔️", label: "远山森林" },
  { id: "coastal", icon: "🌊", label: "海滨灯塔" },
];

const weatherIcon = computed(() => weatherList.find((w) => w.id === currentDesk.value.weather)?.icon || "☀️");
const weatherLabel = computed(() => weatherList.find((w) => w.id === currentDesk.value.weather)?.label || "晴朗");
const terrainName = computed(() => terrainList.find((t) => t.id === decor.value.terrain)?.label || "都市楼宇");

const nextScheduleText = computed(() => {
  const list = currentDesk.value.schedule || [];
  if (list.length === 0) return "今日空闲";
  const first = list[0];
  return `${first.day} ${first.time} ${first.title}`;
});

const filteredSchedule = computed(() => {
  return (currentDesk.value.schedule || []).filter((s) => s.day === activeScheduleDay.value);
});

const filteredDrawerNotes = computed(() => {
  const list = currentDesk.value.drawerNotes || [];
  if (activeNoteCat.value === "全部") return list;
  return list.filter((n) => n.category === activeNoteCat.value);
});

const ledgerBalance = computed(() => {
  return (currentDesk.value.ledger || []).reduce((acc, cur) => {
    return acc + (cur.type === "income" ? cur.amount : -cur.amount);
  }, 0);
});

// 同步实时天气与漫游地形
async function syncWeatherAndTerrain() {
  if (isVisitingOther.value) return;
  const lat = activeLandmark.value?.latitude ?? userLocation.value.latitude;
  const lon = activeLandmark.value?.longitude ?? userLocation.value.longitude;
  if (activeLandmark.value?.terrain && currentDesk.value.decor) {
    currentDesk.value.decor.terrain = activeLandmark.value.terrain;
    currentDesk.value.terrain = activeLandmark.value.terrain;
    saveMyDeskData(currentDesk.value);
  }
  const live = await fetchRealtimeWeather(lat, lon);
  if (live) {
    currentDesk.value.weather = live.weather;
    if (typeof live.tempC === "number") liveTempC.value = live.tempC;
    saveMyDeskData(currentDesk.value);
  }
}

onMounted(() => {
  syncWeatherAndTerrain();
});

watch(activeLandmark, () => {
  syncWeatherAndTerrain();
});

watch(
  targetVisitingDesk,
  (target) => {
    if (target) {
      currentDesk.value = getOtherDeskData(target.userId, target.name, target.avatar);
      isVisitingOther.value = true;
      targetVisitingDesk.value = null;
    }
  },
  { immediate: true }
);

function exitVisiting() {
  currentDesk.value = getMyDeskData();
  isVisitingOther.value = false;
}

function handleViewOwnerProfile() {
  if (isVisitingOther.value) {
    openProfileByUserId(currentDesk.value.ownerId, currentDesk.value.ownerName, currentDesk.value.ownerAvatar);
  } else {
    openMyProfileSheet();
  }
}

function enterDeskHole() {
  isHolePageActive.value = true;
}

function setManualWeather(w: "sunny" | "rainy" | "night" | "cloudy") {
  currentDesk.value.weather = w;
  if (!isVisitingOther.value) saveMyDeskData(currentDesk.value);
  uni.showToast({ title: `窗外已切换为 ${weatherLabel.value}`, icon: "none" });
}

function setManualTerrain(tr: TerrainType) {
  if (!currentDesk.value.decor) {
    currentDesk.value.decor = { ...decor.value };
  }
  currentDesk.value.decor.terrain = tr;
  currentDesk.value.terrain = tr;
  if (!isVisitingOther.value) saveMyDeskData(currentDesk.value);
  uni.showToast({ title: `窗外风景已切换为 ${terrainName.value}`, icon: "none" });
}

function handleSaveDecor(next: DeskDecorConfig) {
  currentDesk.value.decor = { ...next };
  currentDesk.value.terrain = next.terrain;
  if (!isVisitingOther.value) saveMyDeskData(currentDesk.value);
  uni.showToast({ title: "桌洞装扮已保存 ✨", icon: "success" });
}

function submitBoardNote() {
  if (!newBoardText.value.trim()) return;
  addWindowNote(currentDesk.value, newBoardText.value.trim(), "yellow", myProfile.value);
  newBoardText.value = "";
  uni.showToast({ title: "已贴上左墙留言板", icon: "success" });
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
    isMine: true
  });
  saveMyDeskData(currentDesk.value);
  newStickyText.value = "";
  uni.showToast({ title: "已贴上右墙便签墙", icon: "success" });
}

function submitDiaryEntry() {
  if (!newDiaryText.value.trim()) return;
  addDiaryMemory(currentDesk.value, "窗边随笔", newDiaryText.value.trim(), terrainName.value, "日常", "yellow");
  newDiaryText.value = "";
  uni.showToast({ title: "已记入手账本 📖", icon: "success" });
}

function addScheduleItem() {
  if (!newCourseTitle.value.trim()) return;
  if (!currentDesk.value.schedule) currentDesk.value.schedule = [];
  currentDesk.value.schedule.push({
    id: "sc_" + Date.now(),
    day: activeScheduleDay.value,
    time: newCourseTime.value.trim() || "09:00",
    title: newCourseTitle.value.trim()
  });
  saveMyDeskData(currentDesk.value);
  newCourseTitle.value = "";
  uni.showToast({ title: "已添加至课程表 📅", icon: "success" });
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
    uni.showToast({ title: `已新增分类「${name}」`, icon: "success" });
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
    note: newLedgerNote.value.trim() || "手账记录",
    dateStr: `${now.getMonth() + 1}-${now.getDate()}`
  });
  saveMyDeskData(currentDesk.value);
  newLedgerAmount.value = "";
  newLedgerNote.value = "";
  uni.showToast({ title: "记账成功 📒", icon: "success" });
}

function toggleJewelryEquip(id: string) {
  const list = currentDesk.value.jewelry || [];
  list.forEach((item) => {
    if (item.id === id) item.equipped = !item.equipped;
  });
  saveMyDeskData(currentDesk.value);
  uni.showToast({ title: "首饰佩戴状态已更新 💍", icon: "none" });
}

function openExtraSlot(slot: ExtraSlotModule) {
  uni.showToast({ title: `${slot.icon} ${slot.name}：${slot.desc}`, icon: "none" });
}

function confirmAddSlot() {
  const name = newSlotName.value.trim();
  if (!name) return;
  if (!currentDesk.value.extraSlots) currentDesk.value.extraSlots = [];
  currentDesk.value.extraSlots.push({
    id: "slot_" + Date.now(),
    name,
    icon: "📦",
    desc: "自定义扩展手账收纳盒"
  });
  saveMyDeskData(currentDesk.value);
  newSlotName.value = "";
  showAddSlotDrawer.value = false;
  uni.showToast({ title: `已新增扩展槽位「${name}」`, icon: "success" });
}
</script>

<style lang="scss" scoped>
.desk-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
  overflow: hidden;
}

.desk-phone {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.wp-warm { background: linear-gradient(180deg, #f7f3ea 0%, #ede3d1 100%); }
  &.wp-linen { background: linear-gradient(180deg, #efe6d6 0%, #deceb4 100%); }
  &.wp-sage { background: linear-gradient(180deg, #e7f0e5 0%, #d1e1cd 100%); }
  &.wp-starry { background: linear-gradient(180deg, #dbe4ef 0%, #bfd0e3 100%); }
}

.page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 顶栏 */
.desk-header {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 20;
}

.desk-meta-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 253, 248, 0.88);
  backdrop-filter: blur(10px);
  padding: 5px 10px 5px 6px;
  border-radius: 20px;
  border: 0.5px solid rgba(215, 204, 196, 0.8);
  cursor: pointer;

  .owner-ava { width: 32px; height: 32px; border-radius: 50%; }
  .title-row { display: flex; align-items: center; gap: 5px; }
  .desk-title { font-size: 13px; font-weight: 700; color: #3e2723; }
  .desk-tag { font-size: 9px; background: #f3e8d2; color: #8b5a2b; padding: 1px 5px; border-radius: 6px; font-weight: 600; }
  .sub-text { font-size: 10px; color: #795548; }
}

.desk-top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.decor-entry-btn, .back-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 18px;
  background: #3e2723;
  color: #fffdf8;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(62, 39, 35, 0.2);
  cursor: pointer;
}

/* 远景窗户 */
.window-stage {
  position: relative;
  width: 68%;
  height: 175px;
  margin: 4px auto 0;
  border: 6px solid #fffdf8;
  border-radius: 12px;
  box-shadow: 0 8px 22px rgba(62, 39, 35, 0.14), inset 0 0 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}

.window-sky {
  position: relative;
  width: 100%;
  height: 100%;

  &.w-sunny { background: linear-gradient(180deg, #87c5eb 0%, #e7f4fc 100%); }
  &.w-cloudy { background: linear-gradient(180deg, #b5c6d4 0%, #e3eaef 100%); }
  &.w-rainy { background: linear-gradient(180deg, #748899 0%, #aebdca 100%); }
  &.w-night { background: linear-gradient(180deg, #1d2b45 0%, #3a4f73 100%); }

  .sky-sun {
    position: absolute;
    top: 16px;
    right: 26px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: radial-gradient(circle, #fff7c2, #fcd34d);
    box-shadow: 0 0 24px #fde68a;
  }

  .sky-moon {
    position: absolute;
    top: 18px;
    right: 28px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #fef3c7;
    box-shadow: 0 0 18px rgba(254, 243, 199, 0.65);
  }

  .sky-cloud {
    position: absolute;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 20px;
    &.c1 { width: 58px; height: 18px; top: 28px; left: 24px; }
    &.c2 { width: 46px; height: 14px; top: 52px; right: 34px; }
  }

  .sky-rain {
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(110deg, transparent, transparent 10px, rgba(255, 255, 255, 0.35) 11px, transparent 12px);
  }

  .terrain-silhouette {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 62px;

    &.tr-city {
      background: #6c8093;
      clip-path: polygon(0 100%, 0 38%, 14% 38%, 14% 16%, 30% 16%, 30% 48%, 48% 48%, 48% 12%, 66% 12%, 66% 42%, 82% 42%, 82% 24%, 100% 24%, 100% 100%);
    }
    &.tr-ancient {
      background: #5b4d44;
      clip-path: polygon(0 100%, 0 58%, 16% 32%, 34% 58%, 50% 24%, 70% 58%, 86% 34%, 100% 58%, 100% 100%);
    }
    &.tr-mountain {
      background: #66856d;
      clip-path: polygon(0 100%, 20% 28%, 45% 74%, 72% 16%, 100% 78%, 100% 100%);
    }
    &.tr-coastal {
      background: #4e91b8;
      clip-path: polygon(0 100%, 0 54%, 25% 48%, 55% 58%, 85% 46%, 100% 52%, 100% 100%);
    }
  }

  .window-hint-pill {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 9px;
    color: #fffdf8;
    background: rgba(62, 39, 35, 0.52);
    padding: 2px 8px;
    border-radius: 10px;
    white-space: nowrap;
  }
}

.window-mullion {
  position: absolute;
  background: rgba(255, 253, 248, 0.85);
  pointer-events: none;
  &.v { width: 4px; top: 0; bottom: 0; left: 50%; transform: translateX(-50%); }
  &.h { height: 4px; left: 0; right: 0; top: 52%; }
}

.curtain-side {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 28px;
  pointer-events: none;
  background: rgba(255, 253, 248, 0.88);
  &.left { left: 0; border-radius: 0 0 18px 0; }
  &.right { right: 0; border-radius: 0 0 0 18px; }
  &.curt-2 { background: rgba(232, 218, 194, 0.9); }
  &.curt-3 { background: rgba(186, 206, 220, 0.9); }
  &.curt-4 { background: rgba(196, 218, 194, 0.9); }
  &.curt-5 { background: rgba(238, 206, 162, 0.9); }
}

/* 中景层：左留言板 + 右便签墙 */
.mid-depth-walls {
  display: flex;
  justify-content: space-between;
  padding: 12px 14px 8px;
  gap: 12px;
  z-index: 10;
}

.left-message-board {
  flex: 1;
  background: #dfc099;
  border: 3px solid #9c744c;
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 5px 14px rgba(62, 39, 35, 0.14);
  transform: perspective(400px) rotateY(4deg);
  cursor: pointer;

  .mini-notes-col {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 6px;
  }

  .mini-board-slip {
    background: #fff9db;
    padding: 4px 6px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    &.c-pink { background: #fce7f3; }
    &.c-green { background: #dcfce7; }
    .slip-txt { font-size: 10px; color: #3e2723; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  }
}

.right-sticky-wall {
  flex: 1;
  background: rgba(255, 253, 248, 0.72);
  border: 1.5px dashed #cbb89d;
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 5px 14px rgba(62, 39, 35, 0.1);
  transform: perspective(400px) rotateY(-4deg);
  cursor: pointer;

  .sticky-wall-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 6px;
  }

  .mini-sticky-tile {
    width: calc(50% - 3px);
    background: #fff7c2;
    padding: 5px;
    border-radius: 4px;
    box-sizing: border-box;
    box-shadow: 0 2px 4px rgba(62, 39, 35, 0.08);
    &.c-pink { background: #fde2e8; }
    &.c-green { background: #dff5e3; }
    .sticky-txt { font-size: 9px; color: #5d4037; display: block; line-height: 1.3; }
  }
}

.wall-board-title {
  font-size: 11px;
  font-weight: 700;
  color: #4e342e;
}

/* 近景层：课桌台面 + 桌洞 */
.desk-surface-wrap {
  margin-top: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8px 24px rgba(62, 39, 35, 0.16);

  &.desk-skin-classic {
    .desk-top-plane { background: linear-gradient(180deg, #e2c197 0%, #c89d6d 100%); }
    .desk-front-apron { background: #a87d50; }
  }
  &.desk-skin-walnut {
    .desk-top-plane { background: linear-gradient(180deg, #795548 0%, #5d4037 100%); }
    .desk-front-apron { background: #3e2723; }
  }
  &.desk-skin-cream {
    .desk-top-plane { background: linear-gradient(180deg, #faf5ea 0%, #eae0ce 100%); }
    .desk-front-apron { background: #d6c8b2; }
  }
  &.desk-skin-sakura {
    .desk-top-plane { background: linear-gradient(180deg, #f6dce0 0%, #e4b7be 100%); }
    .desk-front-apron { background: #c9929b; }
  }
}

.desk-top-plane {
  padding: 16px 14px 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  border-top: 3px solid rgba(255, 255, 255, 0.35);
}

.desk-book-item {
  display: flex;
  width: 96px;
  height: 70px;
  border-radius: 4px 10px 10px 4px;
  overflow: hidden;
  box-shadow: 0 5px 12px rgba(62, 39, 35, 0.24);
  cursor: pointer;

  .book-spine { width: 12px; background: #6d4c41; }
  .book-cover {
    flex: 1;
    background: linear-gradient(135deg, #fff9e6, #f3e2b3);
    padding: 8px 6px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .book-title { font-size: 12px; font-weight: 700; color: #3e2723; }
    .book-sub { font-size: 10px; color: #8d6e63; }
  }
}

.desk-schedule-stand {
  position: relative;
  flex: 1;
  height: 70px;
  background: #fffdf8;
  border: 1px solid #e5d8bd;
  border-radius: 8px;
  padding: 8px 10px;
  box-sizing: border-box;
  box-shadow: 0 5px 12px rgba(62, 39, 35, 0.16);
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;

  .schedule-clip {
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 7px;
    border-radius: 4px;
    background: #8d6e63;
  }

  .sch-head { font-size: 11px; font-weight: 700; color: #3e2723; }
  .sch-preview { font-size: 10px; color: #c25b38; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}

.desk-pet-corner {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  background: rgba(255, 253, 248, 0.45);
  border: 1.5px dashed rgba(62, 39, 35, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  .pet-avatar-ico { font-size: 32px; }
  .pet-empty-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    .pet-plus { font-size: 16px; }
    .pet-tip { font-size: 9px; color: #5d4037; font-weight: 600; }
  }
}

.desk-front-apron {
  padding: 10px 14px 14px;
}

.desk-hole-cavity {
  position: relative;
  background: linear-gradient(180deg, #2b1d17 0%, #3e2a20 100%);
  border-radius: 12px;
  padding: 12px 14px;
  border: 2px solid rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 6px 14px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  .cavity-items-peek {
    display: flex;
    gap: 12px;
    .peek-ico { font-size: 17px; }
  }

  .cavity-label {
    font-size: 11px;
    font-weight: 600;
    color: #f3e2b8;
  }
}

/* ==================== 桌洞里模块化收纳空间 ==================== */
.hole-drawer-page {
  background: linear-gradient(180deg, #3c2920 0%, #2a1c15 100%);
  padding: 12px 14px;
  box-sizing: border-box;
}

.hole-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;

  .hole-back-pill {
    padding: 5px 12px;
    border-radius: 14px;
    background: rgba(255, 253, 248, 0.16);
    color: #fffdf8;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .hole-main-title { font-size: 16px; font-weight: 700; color: #f6e7c5; letter-spacing: 3px; }
  .hole-slot-badge { font-size: 11px; color: #d8c29d; }
}

.hole-modules-scroll {
  flex: 1;
  min-height: 0;
}

.hole-boxes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-bottom: 20px;
}

.box-tile {
  background: linear-gradient(180deg, #fffdf6 0%, #f8eed3 100%);
  border: 1.5px solid #e6d5a9;
  border-radius: 16px;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  cursor: pointer;

  .box-ico { font-size: 30px; }
  .box-name { font-size: 14px; font-weight: 700; color: #3e2723; }
  .box-meta { font-size: 11px; color: #8d6e63; }

  &.add-slot-tile {
    background: rgba(255, 253, 248, 0.1);
    border: 1.5px dashed rgba(246, 231, 197, 0.45);
    .box-ico, .box-name { color: #f6e7c5; }
    .box-meta { color: #cbb692; }
  }
}

/* ==================== 统一手账抽屉弹窗 ==================== */
.drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(34, 24, 18, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.drawer-sheet {
  width: 100%;
  max-width: 430px;
  background: #fffdf8;
  border-radius: 20px 20px 0 0;
  padding: 10px 16px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  max-height: 78vh;

  &.tall-sheet { height: 70vh; }
}

.drawer-bar {
  width: 38px;
  height: 4px;
  border-radius: 2px;
  background: #d7ccc8;
  margin: 0 auto 10px;
}

.drawer-h1 { font-size: 16px; font-weight: 700; color: #3e2723; margin-bottom: 4px; }
.drawer-sub { font-size: 11px; color: #8d6e63; margin-bottom: 12px; }
.group-label { font-size: 12px; font-weight: 700; color: #5d4037; margin: 8px 0 6px; }

.chip-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.chip-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }

.sel-chip {
  text-align: center;
  padding: 8px 4px;
  border-radius: 12px;
  background: #f5f0e4;
  font-size: 12px;
  font-weight: 600;
  color: #5d4037;
  cursor: pointer;

  &.active { background: #3e2723; color: #fffdf8; }
}

.sheet-scroll { flex: 1; min-height: 0; margin: 8px 0; }

.note-row-card, .diary-card {
  background: #fffbef;
  border: 1px solid #eee0b4;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 8px;

  &.c-pink { background: #fff0f5; border-color: #f3cddb; }
  &.c-green { background: #effaf2; border-color: #cde8d5; }

  .note-row-txt, .diary-body { font-size: 13px; color: #3e2723; line-height: 1.55; display: block; }
  .note-row-meta { font-size: 11px; color: #8d6e63; margin-top: 4px; display: block; }
  .diary-head { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .diary-title { font-size: 13px; font-weight: 700; color: #3e2723; }
  .diary-date { font-size: 11px; color: #8d6e63; }
}

.inline-add-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;

  &.compact { margin-top: 4px; margin-bottom: 6px; }

  .inline-inp {
    flex: 1;
    background: #f5f1e8;
    border: 1px solid #e2d8c8;
    border-radius: 14px;
    padding: 8px 12px;
    font-size: 13px;
    color: #3e2723;
  }

  .inline-btn {
    padding: 8px 14px;
    border-radius: 14px;
    background: #3e2723;
    color: #fffdf8;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    flex-shrink: 0;
  }
}

.day-pills-row {
  display: flex;
  gap: 6px;
  margin: 8px 0;
}

.day-pill {
  flex: 1;
  text-align: center;
  padding: 5px 0;
  border-radius: 10px;
  background: #f4efe4;
  font-size: 11px;
  font-weight: 600;
  color: #6d4c41;
  cursor: pointer;
  &.active { background: #3e2723; color: #fffdf8; }
}

.schedule-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fffbef;
  border: 1px solid #eee0b4;
  border-radius: 12px;
  margin-bottom: 8px;

  .sc-time { font-size: 13px; font-weight: 700; color: #c25b38; width: 46px; }
  .sc-info { flex: 1; }
  .sc-title { display: block; font-size: 13px; font-weight: 700; color: #3e2723; }
  .sc-room { display: block; font-size: 11px; color: #8d6e63; }
  .sc-del { font-size: 12px; color: #a1887f; padding: 4px; cursor: pointer; }
}

.schedule-add-form {
  display: flex;
  gap: 6px;
  align-items: center;

  .type-toggle {
    padding: 8px 10px;
    border-radius: 12px;
    background: #f3e8d2;
    color: #3e2723;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .sch-inp {
    background: #f5f1e8;
    border: 1px solid #e2d8c8;
    border-radius: 12px;
    padding: 7px 10px;
    font-size: 12px;
    color: #3e2723;
    &.time { width: 64px; }
    &.name { flex: 1; }
  }
}

.empty-box-tip {
  text-align: center;
  padding: 28px 0;
  font-size: 12px;
  color: #8d6e63;
}

.cat-pills-scroll { width: 100%; white-space: nowrap; margin: 6px 0; }
.cat-pills-row { display: inline-flex; gap: 6px; }
.cat-pill {
  padding: 4px 12px;
  border-radius: 14px;
  background: #f4efe4;
  font-size: 12px;
  color: #5d4037;
  cursor: pointer;
  &.active { background: #3e2723; color: #fffdf8; font-weight: 600; }
}

.album-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.album-card {
  background: #fffdf8;
  border: 1px solid #e6dcc8;
  border-radius: 10px;
  padding: 6px 6px 10px;
  .album-img { width: 100%; height: 110px; border-radius: 6px; }
  .album-cap { display: block; font-size: 12px; font-weight: 600; color: #3e2723; margin-top: 6px; }
  .album-loc { display: block; font-size: 10px; color: #8d6e63; }
}

.ledger-summary {
  background: #fff8e1;
  border: 1px solid #edd9a3;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
  color: #5d4037;
  margin-bottom: 6px;
  .bal-num { font-size: 16px; font-weight: 700; color: #3e2723; }
}

.ledger-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 10px;
  border-bottom: 0.5px solid #efe7d8;
  .lg-cat { display: block; font-size: 13px; font-weight: 600; color: #3e2723; }
  .lg-date { display: block; font-size: 10px; color: #8d6e63; }
  .lg-amt { font-size: 14px; font-weight: 700; &.expense { color: #c25b38; } &.income { color: #2e7d32; } }
}

.gift-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fffbef;
  border: 1px solid #eee0b4;
  border-radius: 12px;
  margin-bottom: 8px;

  .gift-ico { font-size: 26px; }
  .gift-info { flex: 1; }
  .gift-name { display: block; font-size: 13px; font-weight: 700; color: #3e2723; }
  .gift-msg { display: block; font-size: 11px; color: #8d6e63; margin-top: 2px; }
  .gift-date { font-size: 10px; color: #9e8b7a; }
  .equip-pill {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 12px;
    background: #f0e6d2;
    color: #5d4037;
    &.on { background: #3e2723; color: #fffdf8; }
  }
}
</style>
