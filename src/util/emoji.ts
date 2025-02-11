export const ABCEmojiIndex = 0x1f1e6
export function getABCEmoji(i: number) {
  return String.fromCodePoint(ABCEmojiIndex + i)
}
