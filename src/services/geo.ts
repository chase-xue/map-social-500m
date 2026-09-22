import { Coordinates, StatusItem } from "../types";

const EARTH_RADIUS_METERS = 6378137.0; // WGS-84 地球赤道半径(米)

/**
 * 角度转弧度
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180.0;
}

/**
 * 使用 Haversine 球面距离公式计算两个经纬度坐标之间的直线距离（单位：米）
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);
  const deltaLat = radLat1 - radLat2;
  const deltaLng = toRadians(lng1) - toRadians(lng2);

  const sinDeltaLat = Math.sin(deltaLat / 2.0);
  const sinDeltaLng = Math.sin(deltaLng / 2.0);

  const a =
    sinDeltaLat * sinDeltaLat +
    Math.cos(radLat1) * Math.cos(radLat2) * sinDeltaLng * sinDeltaLng;

  const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
  const distance = EARTH_RADIUS_METERS * c;

  return Math.round(distance);
}

/**
 * 判断目标坐标是否在用户的 500 米范围内
 */
export function isWithin500Meters(
  userPos: Coordinates,
  targetPos: Coordinates
): boolean {
  const distance = calculateDistance(
    userPos.latitude,
    userPos.longitude,
    targetPos.latitude,
    targetPos.longitude
  );
  return distance <= 500;
}

/**
 * 过滤出 500 米范围内的状态列表，并注入实时距离字段
 * @param userPos 当前用户经纬度
 * @param allStatuses 所有历史状态
 * @param radius 距离范围，默认 500 米
 */
export function filterStatusesWithinRange(
  userPos: Coordinates,
  allStatuses: StatusItem[],
  radius = 500
): StatusItem[] {
  return allStatuses
    .map((item) => {
      const distance = calculateDistance(
        userPos.latitude,
        userPos.longitude,
        item.latitude,
        item.longitude
      );
      return {
        ...item,
        distance,
      };
    })
    .filter((item) => item.distance <= radius)
    .sort((a, b) => a.distance - b.distance); // 按距离由近到远排序
}

/**
 * 格式化距离文案展示
 */
export function formatDistance(meters: number): string {
  if (meters < 10) {
    return "就在你身旁";
  }
  if (meters < 1000) {
    return `${meters}米处`;
  }
  return `${(meters / 1000).toFixed(1)}公里处`;
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);

  if (diffSec < 60) {
    return "刚刚";
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}分钟前`;
  }
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}小时前`;
  }
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) {
    return `${diffDay}天前`;
  }

  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * 辅助函数：根据中心点和距离（米）生成一个模拟经纬度偏移
 * 用于在当前用户附近动态生成测试数据
 */
export function createOffsetCoordinates(
  center: Coordinates,
  distanceMeters: number,
  bearingDegrees: number
): Coordinates {
  const radBearing = toRadians(bearingDegrees);
  const angularDistance = distanceMeters / EARTH_RADIUS_METERS;
  const radLat = toRadians(center.latitude);
  const radLng = toRadians(center.longitude);

  const destLat = Math.asin(
    Math.sin(radLat) * Math.cos(angularDistance) +
      Math.cos(radLat) * Math.sin(angularDistance) * Math.cos(radBearing)
  );

  const destLng =
    radLng +
    Math.atan2(
      Math.sin(radBearing) * Math.sin(angularDistance) * Math.cos(radLat),
      Math.cos(angularDistance) - Math.sin(radLat) * Math.sin(destLat)
    );

  return {
    latitude: (destLat * 180.0) / Math.PI,
    longitude: (destLng * 180.0) / Math.PI,
  };
}

/**
 * 按地点聚合状态：若同一个地点发布的状态太多（相距35米内），
 * 聚合为一个标记，展示第一个人发的照片，并展示该地点共有多少条状态；
 * 支持点击后在抽屉中查看该地点的所有状态，或一键跳转至朋友圈模块查看。
 */
export function clusterStatusesByLocation(
  statuses: StatusItem[],
  thresholdMeters = 35
): import("../types").LocationCluster[] {
  const clusters: import("../types").LocationCluster[] = [];

  statuses.forEach((item) => {
    // 寻找相距在 thresholdMeters 范围内的聚类中心
    const match = clusters.find(
      (c) => calculateDistance(c.latitude, c.longitude, item.latitude, item.longitude) <= thresholdMeters
    );

    if (match) {
      match.statuses.push(item);
      match.count = match.statuses.length;
      // 保持 firstStatus 为第一个人发布的状态 (按创建时间较早者)
      if (item.createdAt < match.firstStatus.createdAt) {
        match.firstStatus = item;
      }
    } else {
      clusters.push({
        id: "cluster_" + item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        count: 1,
        firstStatus: item,
        statuses: [item],
        distance: item.distance,
      });
    }
  });

  return clusters;
}

