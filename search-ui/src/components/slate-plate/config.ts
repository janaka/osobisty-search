
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_TODO_LI,
  ELEMENT_PARAGRAPH,
  ELEMENT_CODE_BLOCK,
  ELEMENT_TD,
  KEYS_HEADING,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
} from '@udecode/plate'
const resetBlockTypesCommonRule = {
  types: [ELEMENT_BLOCKQUOTE, ELEMENT_TODO_LI],
  defaultType: ELEMENT_PARAGRAPH
}

export const CONFIG = {
  resetBlockType: {
    rules: [
      {
        ...resetBlockTypesCommonRule,
        hotkey: 'Enter',
        predicate: isBlockAboveEmpty
      },
      {
        ...resetBlockTypesCommonRule,
        hotkey: 'Backspace',
        predicate: isSelectionAtBlockStart
      }
    ]
  },
  softBreak: {
    rules: [
      { hotkey: 'shift+enter' },
      {
        hotkey: 'enter',
        query: {
          allow: [ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD]
        }
      }
    ]
  },
  exitBreak: {
    rules: [
      {
        hotkey: 'mod+enter'
      },
      {
        hotkey: 'mod+shift+enter',
        before: true
      },
      {
        hotkey: 'enter',
        query: {
          start: true,
          end: true,
          allow: KEYS_HEADING
        }
      }
    ]
  }
}