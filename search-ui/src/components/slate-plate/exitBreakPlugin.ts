import { ExitBreakPlugin, KEYS_HEADING, PlateEditor, PlatePlugin, PluginOptions } from '@udecode/plate';
import { MyPlatePlugin } from './plateTypes';





export const exitBreakPlugin: Partial<MyPlatePlugin<ExitBreakPlugin>> = {
  options: {
    rules: [
      {
        hotkey: 'mod+enter',
      },
      {
        hotkey: 'mod+shift+enter',
        before: true,
      },
      {
        hotkey: 'enter',
        query: {
          start: true,
          end: true,
          allow: KEYS_HEADING,
        },
      },
    ],
  },
};
