<template>
  <scroll-view
    scroll-y
    class="moments-scroll-view"
    :style="{ paddingTop: (statusBarHeight + 52) + 'px' }"
    @tap="closeActionMenu"
  >
    <view class="moments-inner-feed">
      <!-- 微信经典：顶部封面大图 + 个人信息右下角贴边角叠放 -->
      <view class="moments-cover-section">
        <image
          class="moments-cover-img"
          src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1000&auto=format&fit=crop&q=80"
          mode="aspectFill"
        />
        <view class="moments-cover-overlay" />
        <view class="moments-user-badge" @tap="openMyProfileSheet">
          <text class="moments-my-name">{{ myProfile.name }}</text>
          <image class="moments-my-avatar" :src="myProfile.avatar" mode="aspectFill" />
        </view>
      </view>

      <!-- 全局活跃紧急求助广播 (有求助时吸顶提示) -->
      <view
        v-if="topEmergencyHelp"
        class="moments-emergency-banner"
        :class="{ 'life-saving-banner': topEmergencyHelp.isEmergency }"
        @tap="openDetailSheet(topEmergencyHelp)"
      >
        <view class="banner-badge">
          <text class="badge-icon">{{ topEmergencyHelp.isEmergency ? '🚨 救命呼救' : '🆘 急事求助' }}</text>
        </view>
        <text class="banner-text">{{ topEmergencyHelp.userName }}: {{ topEmergencyHelp.content }}</text>
        <view class="banner-action">
          <text>查看 ›</text>
        </view>
      </view>

      <!-- 周边无动态空状态 -->
      <view v-if="sortedMomentsStatuses.length === 0" class="moments-empty-card">
        <text class="empty-icon">🍃</text>
        <text class="empty-title">周边 500 米内暂无动态</text>
        <text class="empty-desc">成为这里第一个发动态的人吧，500米内关注你的邻友都能看到！</text>
        <button class="empty-post-btn" @tap="openPublishSheet">立即发布第一条动态</button>
      </view>

      <!-- 微信标准：纯净无边框社交流 (Hairline 极细线分隔) -->
      <view class="moments-feed-stream">
        <view
          v-for="item in sortedMomentsStatuses"
          :key="item.id"
          class="moment-item"
          :class="{ 'is-emergency-item': item.isHelp && item.isEmergency && !item.helpResolved }"
        >
          <!-- 左侧平滑微圆角头像 (微信标准 squircle) -->
          <view class="item-left" @tap.stop="viewAuthorProfile(item)">
            <image class="author-avatar" :src="item.userAvatar" mode="aspectFill" />
          </view>

          <!-- 右侧主体内容 -->
          <view class="item-right">
            <!-- 昵称与标签 -->
            <view class="author-row">
              <view class="author-name-box" @tap.stop="viewAuthorProfile(item)">
                <text class="author-name">{{ item.userName }}</text>
                <text v-if="item.isAcgn" class="acgn-badge">🌸 二次元 · {{ item.acgnTag || '同好' }}</text>
                <text v-if="item.isHelp && isHelpResolvedPromptVisible(item)" class="help-mini-tag" :class="{ emergency: item.isEmergency && !item.helpResolved, resolved: item.helpResolved }">
                  {{ item.helpResolved ? '✅已解决' : item.isEmergency ? '🚨救命求助' : '🆘急事求助' }}
                </text>
                <text v-if="item.userId === myProfile.id" class="author-my-tag">我</text>
              </view>
            </view>

            <!-- 动态正文 (深炭灰 #191919，行高 1.55，点击支持进入详情) -->
            <view class="post-text-wrap" @tap="openDetailSheet(item)">
              <text class="post-text" :class="{ 'emergency-text': item.isHelp && item.isEmergency && !item.helpResolved }">
                {{ item.content }}
              </text>
            </view>

            <!-- 微信标准图片排版 (1图保真、4图2x2、多图3列紧密九宫格) -->
            <view v-if="item.images && item.images.length > 0" class="moment-media-wrap">
              <!-- 单图自适应 -->
              <view v-if="item.images.length === 1" class="single-img-box">
                <image
                  class="single-img"
                  :src="item.images[0]"
                  mode="aspectFill"
                  @tap.stop="previewImage(item.images[0], item.images)"
                />
              </view>
              <!-- 4 图 2x2 矩形 -->
              <view v-else-if="item.images.length === 4" class="grid-4-box">
                <image
                  v-for="(img, idx) in item.images"
                  :key="idx"
                  class="grid-img-4"
                  :src="img"
                  mode="aspectFill"
                  @tap.stop="previewImage(img, item.images)"
                />
              </view>
              <!-- 3 列标准紧凑九宫格 -->
              <view v-else class="grid-multi-box">
                <image
                  v-for="(img, idx) in item.images"
                  :key="idx"
                  class="grid-img-multi"
                  :src="img"
                  mode="aspectFill"
                  @tap.stop="previewImage(img, item.images)"
                />
              </view>
            </view>

            <!-- 位置标签 (微信经典板岩蓝 #576B95) -->
            <view class="location-link" @tap.stop="openDetailSheet(item)">
              <text>📍 附近空间 ({{ formatDistance(item.distance) }})</text>
            </view>

            <!-- 元信息与经典右侧 "··" 操作入口 -->
            <view class="item-meta-row">
              <text class="meta-time">{{ formatTime(item.createdAt) }}</text>

              <!-- 展开的微信深色操作胶囊 -->
              <view
                v-if="activeActionMenuStatusId === item.id"
                class="action-capsule"
                @tap.stop
              >
                <view class="capsule-btn" @tap.stop="handleLikeFromMenu(item)">
                  <text class="capsule-icon">{{ (item.likes || []).includes(myProfile.name) ? '🤍' : '❤️' }}</text>
                  <text class="capsule-text">{{ (item.likes || []).includes(myProfile.name) ? '取消' : '赞' }}</text>
                </view>
                <view class="capsule-divider" />
                <view class="capsule-btn" @tap.stop="openInPlaceComment(item)">
                  <text class="capsule-icon">💬</text>
                  <text class="capsule-text">评论</text>
                </view>
              </view>

              <!-- 经典的灰底双点 "··" 按钮 -->
              <view
                class="dots-btn"
                @tap.stop="toggleActionMenu(item.id)"
                hover-class="dots-hover"
                title="操作"
              >
                <view class="dot" />
                <view class="dot" />
              </view>
            </view>

            <!-- 微信经典灰色折角互动框 (点赞人列表 + 原地评论树) -->
            <view
              v-if="((item.likes && item.likes.length > 0) || (item.comments && item.comments.length > 0))"
              class="interaction-bubble"
              @tap.stop
            >
              <!-- 点赞列表行 -->
              <view v-if="item.likes && item.likes.length > 0" class="likes-line">
                <text class="like-heart-icon">❤️</text>
                <text class="likes-users">{{ item.likes.join('、') }}</text>
              </view>

              <!-- 点赞与评论之间的细分隔线 -->
              <view
                v-if="item.likes && item.likes.length > 0 && item.comments && item.comments.length > 0"
                class="bubble-divider"
              />

              <!-- 原地评论列表 (点击任意评论可直接原地二级回复) -->
              <view v-if="item.comments && item.comments.length > 0" class="comments-list">
                <view
                  v-for="cmt in item.comments"
                  :key="cmt.id"
                  class="comment-row"
                  @tap.stop="openInPlaceComment(item, cmt.userName)"
                >
                  <!-- 二级回复：李四 回复 张三: -->
                  <text class="comment-user" @tap.stop="viewCommenterProfile(cmt)">{{ cmt.userName }}</text>
                  <template v-if="cmt.replyToUserName">
                    <text class="reply-text">回复</text>
                    <text class="comment-reply-to">{{ cmt.replyToUserName }}</text>
                  </template>
                  <text class="comment-colon">：</text>
                  <text class="comment-content">{{ cmt.content }}</text>

                  <!-- 评论配图 (点击放大) -->
                  <view v-if="cmt.images && cmt.images.length > 0" class="cmt-img-preview-box">
                    <image
                      class="cmt-inline-photo"
                      :src="cmt.images[0]"
                      mode="aspectFill"
                      @tap.stop="previewImage(cmt.images[0], cmt.images)"
                    />
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="moments-bottom-padding" />
    </view>

    <!-- 微信原生级：原地底部升起评论条 (无需跳转或打开大弹窗) -->
    <view v-if="inPlaceCommentVisible" class="in-place-mask" @tap.stop="closeInPlaceComment" />
    <view v-if="inPlaceCommentVisible" class="in-place-comment-bar" @tap.stop>
      <input
        class="in-place-input"
        v-model="inPlaceCommentText"
        :placeholder="inPlaceReplyToUser ? '回复 ' + inPlaceReplyToUser + '...' : (inPlaceCommentTarget?.userId === myProfile.id ? '我是发布者，写下最新回复...' : '评论...')"
        placeholder-class="in-place-placeholder"
        :focus="true"
        confirm-type="send"
        @confirm="handleSendInPlaceComment"
      />
      <button
        class="in-place-send-btn"
        :disabled="!inPlaceCommentText.trim()"
        @tap.stop="handleSendInPlaceComment"
        hover-class="btn-hover"
      >
        发送
      </button>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppState } from "../../composables/useAppState";
import { formatDistance } from "../../services/geo";
const {
  statusBarHeight, myProfile, sortedMomentsStatuses, activeHelpStatuses,
  openMyProfileSheet, openPublishSheet, viewAuthorProfile, viewCommenterProfile,
  previewImage, toggleLikeStatus, openDetailSheet, formatTime, isHelpResolvedPromptVisible,
  activeActionMenuStatusId, toggleActionMenu, closeActionMenu, handleLikeFromMenu,
  inPlaceCommentVisible, inPlaceCommentTarget, inPlaceReplyToUser, inPlaceCommentText,
  openInPlaceComment, closeInPlaceComment, handleSendInPlaceComment,
} = useAppState();

const topEmergencyHelp = computed(() => {
  if (!activeHelpStatuses.value.length) return null;
  const emergency = activeHelpStatuses.value.find((s) => s.isEmergency);
  return emergency || activeHelpStatuses.value[0];
});
</script>

<style lang="scss" scoped>
.moments-emergency-banner {
  margin: 16rpx 24rpx;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1rpx solid #f59e0b;
  border-radius: 12rpx;
  padding: 14rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  cursor: pointer;

  &.life-saving-banner {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border-color: #ef4444;

    .banner-badge {
      background-color: #dc2626;
      .badge-icon { color: #ffffff; }
    }
    .banner-text { color: #b91c1c; font-weight: 700; }
    .banner-action text { color: #b91c1c; font-weight: 700; }
  }

  .banner-badge {
    padding: 4rpx 10rpx;
    background-color: #f59e0b;
    border-radius: 8rpx;
    flex-shrink: 0;

    .badge-icon { font-size: 20rpx; color: #ffffff; font-weight: 700; }
  }

  .banner-text {
    flex: 1;
    font-size: 22rpx;
    color: #92400e;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .banner-action {
    flex-shrink: 0;
    font-size: 20rpx;
    color: #b45309;
    font-weight: 600;
  }
}
</style>
