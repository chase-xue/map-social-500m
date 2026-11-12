<template>
  <view v-if="aiMatchSheetVisible" class="ai-match-mask" @tap="closeAiMatchSheet(false)">
    <view class="ai-match-sheet" @tap.stop>
      <!-- 顶栏标题 -->
      <view class="sheet-header">
        <view class="header-left">
          <text class="header-icon">🤖</text>
          <text class="header-title">AI 邻里交友匹配</text>
          <text class="header-sub">500米物理生活圈</text>
        </view>
        <view class="header-close-btn" @tap="closeAiMatchSheet(true)">
          <text class="close-icon">✕</text>
        </view>
      </view>

      <!-- 视图 1：条件筛选与性格 AI 深度设定 -->
      <scroll-view v-if="viewMode === 'filter'" scroll-y class="sheet-scroll-body">
        <view class="filter-wrap">
          <!-- 1. 性别 -->
          <view class="filter-section">
            <text class="section-label">性别偏好</text>
            <view class="chips-group">
              <view
                class="filter-chip"
                :class="{ 'chip-active': filterParams.gender === 'all' }"
                @tap="filterParams.gender = 'all'"
              >
                <text>不限</text>
              </view>
              <view
                class="filter-chip"
                :class="{ 'chip-active': filterParams.gender === '女' }"
                @tap="filterParams.gender = '女'"
              >
                <text>👧 女生优先</text>
              </view>
              <view
                class="filter-chip"
                :class="{ 'chip-active': filterParams.gender === '男' }"
                @tap="filterParams.gender = '男'"
              >
                <text>👦 男生优先</text>
              </view>
            </view>
          </view>

          <!-- 2. 年龄区间 -->
          <view class="filter-section">
            <text class="section-label">年龄区间</text>
            <view class="chips-group">
              <view
                class="filter-chip"
                :class="{ 'chip-active': filterParams.ageRange === 'all' }"
                @tap="filterParams.ageRange = 'all'"
              >
                <text>不限年龄</text>
              </view>
              <view
                class="filter-chip"
                :class="{ 'chip-active': filterParams.ageRange === '18-24' }"
                @tap="filterParams.ageRange = '18-24'"
              >
                <text>18-24 岁</text>
              </view>
              <view
                class="filter-chip"
                :class="{ 'chip-active': filterParams.ageRange === '25-30' }"
                @tap="filterParams.ageRange = '25-30'"
              >
                <text>25-30 岁</text>
              </view>
              <view
                class="filter-chip"
                :class="{ 'chip-active': filterParams.ageRange === '31+' }"
                @tap="filterParams.ageRange = '31+'"
              >
                <text>31 岁以上</text>
              </view>
            </view>
          </view>

          <!-- 3. 星座 -->
          <view class="filter-section">
            <text class="section-label">星座星象偏好</text>
            <view class="chips-group">
              <view
                class="filter-chip"
                :class="{ 'chip-active': filterParams.constellation === 'all' }"
                @tap="filterParams.constellation = 'all'"
              >
                <text>不限 (星盘自由)</text>
              </view>
              <view
                class="filter-chip"
                :class="{ 'chip-active': filterParams.constellation.includes('火象') }"
                @tap="filterParams.constellation = '火象 (白羊/狮子/射手)'"
              >
                <text>🔥 火象</text>
              </view>
              <view
                class="filter-chip"
                :class="{ 'chip-active': filterParams.constellation.includes('水象') }"
                @tap="filterParams.constellation = '水象 (巨蟹/天蝎/双鱼)'"
              >
                <text>💧 水象</text>
              </view>
              <view
                class="filter-chip"
                :class="{ 'chip-active': filterParams.constellation.includes('风象') }"
                @tap="filterParams.constellation = '风象 (双子/天秤/水瓶)'"
              >
                <text>🌬️ 风象</text>
              </view>
              <view
                class="filter-chip"
                :class="{ 'chip-active': filterParams.constellation.includes('土象') }"
                @tap="filterParams.constellation = '土象 (金牛/处女/摩羯)'"
              >
                <text>🌱 土象</text>
              </view>
            </view>
          </view>

          <!-- 4. 🌟 性格一层 AI 语义匹配核心卡片 -->
          <view class="personality-ai-box">
            <view class="box-title-row">
              <text class="box-main-title">🌟 性格一层 · AI 智能语义匹配</text>
              <text class="box-badge">大模型算力</text>
            </view>

            <!-- 模式切换 -->
            <view class="mode-switch-grid">
              <view
                class="mode-card"
                :class="{ 'mode-selected': filterParams.personalityMode === 'same' }"
                @tap="filterParams.personalityMode = 'same'"
              >
                <text class="mode-icon">🎯</text>
                <view class="mode-text-col">
                  <text class="mode-name">灵魂同频模式</text>
                  <text class="mode-desc">寻找默契同频、话题共鸣的搭子</text>
                </view>
              </view>
              <view
                class="mode-card"
                :class="{ 'mode-selected': filterParams.personalityMode === 'complement' }"
                @tap="filterParams.personalityMode = 'complement'"
              >
                <text class="mode-icon">🧩</text>
                <view class="mode-text-col">
                  <text class="mode-name">性格互补模式</text>
                  <text class="mode-desc">一动一静、相处轻松的反差搭子</text>
                </view>
              </view>
            </view>

            <!-- 性格标签多选 -->
            <view class="tags-picker-box">
              <text class="tags-sub-title">我的性格画像标签 (可多选)：</text>
              <view class="chips-group">
                <view
                  v-for="tag in PRESET_PERSONALITY_TAGS"
                  :key="tag"
                  class="filter-chip chip-sm"
                  :class="{ 'chip-active': filterParams.personalityTags.includes(tag) }"
                  @tap="togglePersonalityTag(tag)"
                >
                  <text>{{ tag }}</text>
                </view>
              </view>
            </view>

            <!-- 自然语言性格描述 -->
            <view class="ai-desc-wrap">
              <textarea
                class="ai-desc-input"
                v-model="filterParams.customDesc"
                placeholder="也可以用一句话描述你的性格与交友愿景（如：外冷内热二次元，想找个能一起吃谷逛漫展的真诚近邻...）"
                maxlength="150"
              />
              <view class="ai-magic-btn" @tap="handleAutoFillAiPersonality">
                <text class="magic-icon">🪄</text>
                <text>一键从我发圈推断</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 视图 2：AI 匹配结果卡片流 -->
      <scroll-view v-else scroll-y class="sheet-scroll-body">
        <view class="result-wrap">
          <view class="result-top-bar">
            <view class="top-bar-left">
              <text class="bar-spark">✨</text>
              <text class="bar-title">AI 为你智能匹配了 {{ aiMatchResults.length }} 位合拍邻友</text>
            </view>
            <view class="re-filter-btn" @tap="viewMode = 'filter'">
              <text>重新调整 ↺</text>
            </view>
          </view>

          <!-- 推荐卡片流 -->
          <view v-for="item in aiMatchResults" :key="item.userId" class="match-card">
            <view class="match-badge">
              <text>{{ item.matchHighlight }}</text>
            </view>

            <view class="card-user-row">
              <image class="card-avatar" :src="item.userAvatar" mode="aspectFill" />
              <view class="card-meta">
                <view class="name-row">
                  <text class="user-name">{{ item.userName }}</text>
                  <text class="gender-age">{{ item.gender === '女' ? '♀' : '♂' }} {{ item.age }}岁</text>
                </view>
                <view class="constellation-row">
                  <text class="meta-tag">{{ item.constellation }}</text>
                  <text class="meta-tag tag-mbti">{{ item.mbti }}</text>
                  <text class="meta-dist">📍 {{ formatDistance(item.distance) }}</text>
                </view>
              </view>
            </view>

            <!-- AI 智能理由推荐气泡 -->
            <view class="ai-reason-bubble">
              <text class="reason-prefix">🤖 AI 契合简评：</text>
              <text class="reason-content">{{ item.aiReason }}</text>
            </view>

            <!-- 底部操作栏 -->
            <view class="card-bottom-actions">
              <view class="card-tags-list">
                <text v-for="t in item.personalityTags.slice(0, 3)" :key="t" class="p-pill">{{ t }}</text>
              </view>

              <button
                class="apply-btn"
                :class="{ 'btn-added': item.isFriend }"
                @tap="handleApply(item)"
              >
                {{ item.isFriend ? '💬 发消息' : '💬 申请好友 & 畅聊' }}
              </button>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部操作按钮 -->
      <view class="sheet-footer">
        <button
          v-if="viewMode === 'filter'"
          class="start-match-btn"
          :loading="isAiMatching"
          @tap="handleStartMatch"
        >
          <text class="btn-spark">✨</text>
          <text>{{ isAiMatching ? 'AI 正在计算 500 米契合度...' : '启动 AI 智能一键匹配' }}</text>
        </button>
        <button
          v-else
          class="back-filter-btn"
          @tap="viewMode = 'filter'"
        >
          <text>⚙️ 重新调整筛选条件</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAppState } from '../../composables/useAppState';
import { AiMatchFilter, AiMatchUserResult } from '../../types';
import { formatDistance } from '../../services/geo';

const {
  aiMatchSheetVisible,
  aiMatchResults,
  isAiMatching,
  closeAiMatchSheet,
  runAiMatchFilter,
  applyAndChatWithMatch,
} = useAppState();

const viewMode = ref<'filter' | 'result'>('filter');

const PRESET_PERSONALITY_TAGS = [
  '二次元宅', '猫系慢热', '温柔倾听', '幽默社牛',
  '活泼开朗', '细致考究', 'MBTI-INFP', 'MBTI-ENFP',
  '佛系安静', '运动阳光', '热心真诚'
];

const filterParams = reactive<AiMatchFilter>({
  gender: 'all',
  ageRange: 'all',
  constellation: 'all',
  personalityMode: 'same',
  personalityTags: ['二次元宅', '猫系慢热', '温柔倾听'],
  customDesc: ''
});

function togglePersonalityTag(tag: string) {
  const idx = filterParams.personalityTags.indexOf(tag);
  if (idx >= 0) {
    filterParams.personalityTags.splice(idx, 1);
  } else {
    filterParams.personalityTags.push(tag);
  }
}

function handleAutoFillAiPersonality() {
  filterParams.customDesc = '表面慢热猫系，喜欢宅家追番看二次元周边，想找能一起吃谷逛漫展或喝咖啡的真诚搭子！';
  uni.showToast({ title: '已提炼你的社交人格！', icon: 'none' });
}

function handleStartMatch() {
  runAiMatchFilter({ ...filterParams });
  setTimeout(() => {
    viewMode.value = 'result';
  }, 450);
}

function handleApply(candidate: AiMatchUserResult) {
  applyAndChatWithMatch(candidate);
}
</script>

<style lang="scss" scoped>
.ai-match-mask {
  position: absolute;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 120;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.ai-match-sheet {
  background-color: #ffffff;
  border-radius: 36rpx 36rpx 0 0;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.sheet-header {
  padding: 24rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 0.5px solid #f1f5f9;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .header-icon { font-size: 36rpx; }
    .header-title { font-size: 32rpx; font-weight: 700; color: #1e293b; }
    .header-sub {
      font-size: 20rpx;
      color: #8b5cf6;
      background-color: #ede9fe;
      padding: 2rpx 10rpx;
      border-radius: 8rpx;
      font-weight: 600;
    }
  }

  .header-close-btn {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    .close-icon { font-size: 28rpx; color: #94a3b8; }
  }
}

.sheet-scroll-body {
  flex: 1;
  max-height: 65vh;
  padding: 24rpx 32rpx;
  box-sizing: border-box;
}

.filter-section {
  margin-bottom: 24rpx;

  .section-label {
    display: block;
    font-size: 26rpx;
    font-weight: 600;
    color: #475569;
    margin-bottom: 12rpx;
  }
}

.chips-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;

  .filter-chip {
    padding: 10rpx 24rpx;
    border-radius: 28rpx;
    background-color: #f8fafc;
    border: 1rpx solid #e2e8f0;
    font-size: 24rpx;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;

    &.chip-sm {
      padding: 8rpx 20rpx;
      font-size: 22rpx;
    }

    &.chip-active {
      background-color: #ede9fe;
      border-color: #8b5cf6;
      color: #6d28d9;
      font-weight: 600;
      box-shadow: 0 2rpx 8rpx rgba(139, 92, 246, 0.15);
    }
  }
}

/* 性格一层卡片 */
.personality-ai-box {
  background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%);
  border: 1.5rpx solid #ddd6fe;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;

  .box-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18rpx;

    .box-main-title {
      font-size: 26rpx;
      font-weight: 700;
      color: #6d28d9;
    }

    .box-badge {
      font-size: 18rpx;
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
      color: #ffffff;
      padding: 2rpx 12rpx;
      border-radius: 12rpx;
      font-weight: 600;
    }
  }

  .mode-switch-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14rpx;
    margin-bottom: 20rpx;

    .mode-card {
      background-color: #ffffff;
      border: 1rpx solid #e2e8f0;
      border-radius: 16rpx;
      padding: 16rpx;
      display: flex;
      align-items: flex-start;
      gap: 12rpx;
      cursor: pointer;
      transition: all 0.2s;

      .mode-icon { font-size: 32rpx; }
      .mode-text-col {
        display: flex;
        flex-direction: column;
        .mode-name { font-size: 24rpx; font-weight: 700; color: #334155; }
        .mode-desc { font-size: 18rpx; color: #94a3b8; margin-top: 4rpx; line-height: 1.3; }
      }

      &.mode-selected {
        background-color: #8b5cf6;
        border-color: #7c3aed;
        box-shadow: 0 4rpx 14rpx rgba(139, 92, 246, 0.3);

        .mode-name { color: #ffffff; }
        .mode-desc { color: rgba(255, 255, 255, 0.85); }
      }
    }
  }

  .tags-picker-box {
    margin-bottom: 20rpx;
    .tags-sub-title {
      display: block;
      font-size: 22rpx;
      color: #6d28d9;
      font-weight: 600;
      margin-bottom: 10rpx;
    }
  }

  .ai-desc-wrap {
    position: relative;

    .ai-desc-input {
      width: 100%;
      height: 110rpx;
      background-color: #ffffff;
      border: 1rpx solid #cbd5e1;
      border-radius: 14rpx;
      padding: 14rpx 16rpx;
      font-size: 22rpx;
      color: #1e293b;
      box-sizing: border-box;
    }

    .ai-magic-btn {
      position: absolute;
      right: 12rpx;
      bottom: 12rpx;
      background: #ede9fe;
      border: 1rpx solid #ddd6fe;
      padding: 4rpx 12rpx;
      border-radius: 10rpx;
      display: flex;
      align-items: center;
      gap: 4rpx;
      font-size: 20rpx;
      color: #6d28d9;
      font-weight: 600;
      cursor: pointer;
    }
  }
}

/* 结果流视图 */
.result-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;

  .top-bar-left {
    display: flex;
    align-items: center;
    gap: 8rpx;
    .bar-spark { font-size: 28rpx; }
    .bar-title { font-size: 26rpx; font-weight: 700; color: #1e293b; }
  }

  .re-filter-btn {
    font-size: 22rpx;
    color: #8b5cf6;
    font-weight: 600;
    cursor: pointer;
  }
}

.match-card {
  background-color: #ffffff;
  border: 1rpx solid #e2e8f0;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  position: relative;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

  .match-badge {
    position: absolute;
    top: 24rpx;
    right: 24rpx;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #ffffff;
    font-size: 20rpx;
    font-weight: 700;
    padding: 4rpx 14rpx;
    border-radius: 14rpx;
  }

  .card-user-row {
    display: flex;
    gap: 18rpx;
    align-items: center;
    margin-bottom: 16rpx;

    .card-avatar {
      width: 88rpx;
      height: 88rpx;
      border-radius: 50%;
      border: 2rpx solid #ede9fe;
    }

    .card-meta {
      display: flex;
      flex-direction: column;

      .name-row {
        display: flex;
        align-items: center;
        gap: 10rpx;
        .user-name { font-size: 28rpx; font-weight: 700; color: #1e293b; }
        .gender-age { font-size: 22rpx; color: #ec4899; }
      }

      .constellation-row {
        display: flex;
        align-items: center;
        gap: 10rpx;
        margin-top: 6rpx;

        .meta-tag {
          font-size: 20rpx;
          background: #f1f5f9;
          color: #475569;
          padding: 2rpx 10rpx;
          border-radius: 8rpx;

          &.tag-mbti {
            background: #ede9fe;
            color: #6d28d9;
            font-weight: 600;
          }
        }

        .meta-dist {
          font-size: 20rpx;
          color: #94a3b8;
        }
      }
    }
  }

  .ai-reason-bubble {
    background-color: #f5f3ff;
    border-left: 4rpx solid #8b5cf6;
    border-radius: 12rpx;
    padding: 14rpx 18rpx;
    font-size: 22rpx;
    color: #5b21b6;
    line-height: 1.5;
    margin-bottom: 18rpx;

    .reason-prefix { font-weight: 700; }
  }

  .card-bottom-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-tags-list {
      display: flex;
      gap: 8rpx;
      .p-pill {
        font-size: 18rpx;
        color: #64748b;
        background: #f8fafc;
        border: 1rpx solid #e2e8f0;
        padding: 2rpx 10rpx;
        border-radius: 8rpx;
      }
    }

    .apply-btn {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: #ffffff;
      border: none;
      font-size: 22rpx;
      font-weight: 600;
      padding: 8rpx 24rpx;
      border-radius: 24rpx;
      box-shadow: 0 4rpx 10rpx rgba(139, 92, 246, 0.3);

      &.btn-added {
        background: #07c160;
        box-shadow: 0 4rpx 10rpx rgba(7, 193, 96, 0.3);
      }
    }
  }
}

.sheet-footer {
  padding: 16rpx 32rpx 32rpx;
  background-color: #ffffff;
  border-top: 0.5px solid #f1f5f9;

  .start-match-btn {
    width: 100%;
    height: 84rpx;
    background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%);
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 700;
    border-radius: 42rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    box-shadow: 0 8rpx 24rpx rgba(124, 58, 237, 0.35);
  }

  .back-filter-btn {
    width: 100%;
    height: 80rpx;
    background: #f1f5f9;
    color: #475569;
    font-size: 26rpx;
    font-weight: 600;
    border-radius: 40rpx;
    border: 1rpx solid #e2e8f0;
  }
}
</style>
