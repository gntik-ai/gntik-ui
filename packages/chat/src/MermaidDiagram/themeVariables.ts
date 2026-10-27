import { tokenHex } from '@gntik-ai/tokens/runtime';

/** Pair foreground text with neutral surfaces in every theme, including high contrast. */
export function themeVariables(): Record<string, string> {
  const surface = tokenHex('secondary');
  const text = tokenHex('foreground');
  const background = tokenHex('background');
  const border = tokenHex('border');
  return {
    background,
    primaryColor: surface,
    primaryTextColor: text,
    primaryBorderColor: border,
    secondaryColor: surface,
    secondaryTextColor: text,
    secondaryBorderColor: border,
    tertiaryColor: background,
    tertiaryTextColor: text,
    tertiaryBorderColor: border,
    textColor: text,
    lineColor: text,
    mainBkg: surface,
    nodeBorder: border,
    clusterBkg: background,
    clusterBorder: border,
    edgeLabelBackground: background,
    actorBkg: surface,
    actorBorder: border,
    actorTextColor: text,
    signalColor: text,
    signalTextColor: text,
    labelBoxBkgColor: surface,
    labelBoxBorderColor: border,
    labelTextColor: text,
    loopTextColor: text,
    noteBkgColor: surface,
    noteTextColor: text,
    noteBorderColor: border,
    activationBkgColor: surface,
    activationBorderColor: border,
  };
}
