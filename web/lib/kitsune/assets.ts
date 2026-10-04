export const poses = {
  welcome: '/kitsune/poses/P01_salom.webp',
  studying: '/kitsune/poses/P02_oqish.webp',
  thinking: '/kitsune/poses/P03_fikrlash.webp',
  celebrating: '/kitsune/poses/P04_tabriklash.webp',
  encouraging: '/kitsune/poses/P05_ragbat.webp',
  testing: '/kitsune/poses/P06_test.webp',
  resting: '/kitsune/poses/P07_dam_olish.webp',
} as const;

export const expressions = {
  welcome: poses.welcome,
  excited: '/kitsune/expressions/M02_hayajon.webp',
  studying: '/kitsune/expressions/M03_diqqat.webp',
  thinking: '/kitsune/expressions/M04_fikr.webp',
  celebrating: '/kitsune/expressions/M05_gurur.webp',
  encouraging: '/kitsune/expressions/M06_ragbat.webp',
  surprised: '/kitsune/expressions/M07_hayrat.webp',
  sleepy: '/kitsune/expressions/M08_uyqu.webp',
} as const;

export const levels = {
  KANA: '/kitsune/levels/L01_kana.webp',
  N5: '/kitsune/levels/L02_N5.webp',
  N4: '/kitsune/levels/L03_N4.webp',
  N3: '/kitsune/levels/L04_N3.webp',
  N2: '/kitsune/levels/L05_N2_N1.webp',
  N1: '/kitsune/levels/L05_N2_N1.webp',
} as const;

export type KitsuneState = keyof typeof poses | keyof typeof expressions;
export type KitsuneVariant = 'pose' | 'expression' | 'level';

export function getKitsuneAsset(
  state: KitsuneState = 'welcome',
  variant: KitsuneVariant = 'pose',
  level?: string | null,
): string {
  if (variant === 'level') {
    return level && Object.hasOwn(levels, level)
      ? levels[level as keyof typeof levels]
      : poses.welcome;
  }
  const library = variant === 'expression' ? expressions : poses;
  if (Object.hasOwn(library, state)) return library[state as keyof typeof library];
  if (Object.hasOwn(expressions, state)) return expressions[state as keyof typeof expressions];
  return poses.welcome;
}

export const kitusune_png_poses = {
  welcome: '/kitusune_png/poses/P01_salom.webp',
  studying: '/kitusune_png/poses/P02_oqish.webp',
  thinking: '/kitusune_png/poses/P03_fikrlash.webp',
  celebrating: '/kitusune_png/poses/P04_tabriklash.webp',
  encouraging: '/kitusune_png/poses/P05_ragbat.webp',
  testing: '/kitusune_png/poses/P06_test.webp',
  resting: '/kitusune_png/poses/P07_dam_olish.webp',
} as const;

export const kitusune_png_expressions = {
  welcome: kitusune_png_poses.welcome,
  excited: '/kitusune_png/expressions/M02_hayajon.webp',
  studying: '/kitusune_png/expressions/M03_diqqat.webp',
  thinking: '/kitusune_png/expressions/M04_fikr.webp',
  celebrating: '/kitusune_png/expressions/M05_gurur.webp',
  encouraging: '/kitusune_png/expressions/M06_ragbat.webp',
  surprised: '/kitusune_png/expressions/M07_hayrat.webp',
  sleepy: '/kitusune_png/expressions/M08_uyqu.webp',
} as const;

export const kitusune_png_levels = {
  KANA: '/kitusune_png/levels/L01_kana.webp',
  N5: '/kitusune_png/levels/L02_N5.webp',
  N4: '/kitusune_png/levels/L03_N4.webp',
  N3: '/kitusune_png/levels/L04_N3.webp',
  N2: '/kitusune_png/levels/L05_N2_N1.webp',
  N1: '/kitusune_png/levels/L05_N2_N1.webp',
} as const;

export type KitsunePngState = keyof typeof kitusune_png_poses | keyof typeof kitusune_png_expressions;
export type KitsunePngVariant = 'pose' | 'expression' | 'level';

export function getKitsunePngAsset(
  state: KitsunePngState = 'welcome',
  variant: KitsunePngVariant = 'pose',
  level?: string | null,
): string {
  if (variant === 'level') {
    return level && Object.hasOwn(kitusune_png_levels, level)
      ? kitusune_png_levels[level as keyof typeof kitusune_png_levels]
      : kitusune_png_poses.welcome;
  }
  const library = variant === 'expression' ? kitusune_png_expressions : kitusune_png_poses;
  if (Object.hasOwn(library, state)) return library[state as keyof typeof library];
  if (Object.hasOwn(kitusune_png_expressions, state)) return kitusune_png_expressions[state as keyof typeof kitusune_png_expressions];
  return kitusune_png_poses.welcome;
}
