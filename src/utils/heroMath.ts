export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export function easeInOutCubic(t: number): number {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export interface WipeMaskState {
  opaqueStopPct: number;
  midStopPct: number;
  transparentStopPct: number;
  mistOpacity: number;
  mistCenterFromRightPct: number;
  incomingScale: number;
  incomingOffsetPct: number;
  outgoingScale: number;
  outgoingOffsetPct: number;
}

export function computeWipeState(rawT: number): WipeMaskState {
  const t = clamp(rawT, 0, 1);
  const p = easeInOutCubic(t);

  // Soft edge about 35% wide moving right-to-left:
  // fully opaque up to p*135 - 35 % from the right edge,
  // 60% at midpoint, transparent at p*135 %
  const transparentStopPct = p * 135;
  const opaqueStopPct = p * 135 - 35;
  const midStopPct = (opaqueStopPct + transparentStopPct) / 2;

  const mistOpacity = Math.sin(Math.PI * t) * 0.95;
  const mistCenterFromRightPct = midStopPct;

  const incomingScale = 1.12 - 0.08 * p; // 1.12 -> 1.04
  const incomingOffsetPct = 2 * (1 - p); // +2% -> 0%
  const outgoingScale = 1.04 + 0.05 * p; // 1.04 -> 1.09
  const outgoingOffsetPct = -2 * p; // 0% -> -2%

  return {
    opaqueStopPct,
    midStopPct,
    transparentStopPct,
    mistOpacity,
    mistCenterFromRightPct,
    incomingScale,
    incomingOffsetPct,
    outgoingScale,
    outgoingOffsetPct,
  };
}

export interface RailItemLayout {
  index: number;
  size: number;
  top: number;
  left: number;
  isActive: boolean;
}

export interface RailLayout {
  centerX: number;
  activeSize: number;
  inactiveSize: number;
  gap: number;
  innerRingRadius: number;
  outerRingRadius: number;
  activeCenterY: number;
  connectorWidth: number;
  connectorLeft: number;
  connectorTop: number;
  captionRight: number;
  barHeight: number;
  items: RailItemLayout[];
}

export function computeRailLayout(
  viewportWidth: number,
  viewportHeight: number,
  activeOrderIndex: number
): RailLayout {
  const activeSize = clamp(viewportWidth * 0.113, 96, 190);
  const inactiveSize = clamp(viewportWidth * 0.054, 46, 92);
  const gap = Math.max(8, viewportWidth * 0.009);

  const heroHeight = Math.max(680, viewportHeight);
  const startTop = 74 + heroHeight * 0.085;
  const centerX = viewportWidth * 0.855;

  const items: RailItemLayout[] = [];
  let cursorTop = startTop;

  for (let i = 0; i < 3; i++) {
    const isActive = i === activeOrderIndex;
    const size = isActive ? activeSize : inactiveSize;
    items.push({
      index: i,
      size,
      top: cursorTop,
      left: centerX - size / 2,
      isActive,
    });
    cursorTop += size + gap;
  }

  const activeItem = items[activeOrderIndex] ?? items[2];
  const activeCenterY = activeItem.top + activeItem.size / 2;

  const innerRingRadius = activeSize / 2 + viewportWidth * 0.05;
  const outerRingRadius = activeSize / 2 + viewportWidth * 0.108;

  const connectorWidth = Math.max(40, viewportWidth * 0.047);
  const connectorOffset = viewportWidth * 0.008;
  const connectorRight = activeItem.left - connectorOffset;
  const connectorLeft = connectorRight - connectorWidth;
  const connectorTop = activeCenterY - 1.5;

  const captionRight = Math.min(connectorLeft - 16, viewportWidth - (connectorLeft - 16) > 0 ? connectorLeft - 16 : connectorLeft - 16);
  const barHeight = Math.max(84, viewportWidth * 0.065);

  return {
    centerX,
    activeSize,
    inactiveSize,
    gap,
    innerRingRadius,
    outerRingRadius,
    activeCenterY,
    connectorWidth,
    connectorLeft,
    connectorTop,
    captionRight: connectorLeft - 16,
    barHeight,
    items,
  };
}

export interface ScrollChoreography {
  slideTranslateY: number;
  bottomCloudTranslateY: number;
  bottomCloudScale: number;
  topCloudOpacity: number;
  topCloudTranslateY: number;
  railTranslateY: number;
  railOpacity: number;
  navSolid: boolean;
}

export function computeScrollChoreography(
  scrollY: number,
  viewportHeight: number
): ScrollChoreography {
  const vh = Math.max(1, viewportHeight);
  const s = Math.max(0, scrollY);

  return {
    slideTranslateY: 0.42 * s,
    bottomCloudTranslateY: -0.38 * s,
    bottomCloudScale: 1 + (0.35 * s) / vh,
    topCloudOpacity: clamp(s / (0.45 * vh), 0, 1),
    topCloudTranslateY: -0.18 * s,
    railTranslateY: 0.2 * s,
    railOpacity: clamp(1 - s / (0.5 * vh), 0, 1),
    navSolid: s > 0.3 * vh,
  };
}
