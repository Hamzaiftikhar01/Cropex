// Matches one or more emoji (including ZWJ sequences, skin-tone modifiers,
// variation selectors and flag pairs) at the start of a string, plus any
// surrounding whitespace. Requires a real emoji, so plain strings are untouched.
const LEADING_EMOJI =
  /^\s*(?:(?:\p{Extended_Pictographic}|\p{Regional_Indicator})[\p{Emoji_Modifier}\uFE0F\u20E3]*(?:\u200D(?:\p{Extended_Pictographic}|\p{Regional_Indicator})[\p{Emoji_Modifier}\uFE0F\u20E3]*)*\s*)+/u;

export function stripLeadingEmoji(value) {
  if (typeof value !== 'string') return value;
  return value.replace(LEADING_EMOJI, '');
}
