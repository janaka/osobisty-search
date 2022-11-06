import { TEditor, Value } from '@udecode/plate';
import { withYjs, WithYjsOptions } from '@slate-yjs/core';
import { TYjsEditor } from './TYjsEditor';
import * as Y from 'yjs';

// Implements type for withYjs https://docs.slate-yjs.dev/api/slate-yjs-core/yjs-plugin#withyjs

export const withTYjs = <V extends Value, E extends TEditor<V>>(editor: E, sharedRoot: Y.XmlText, options: WithYjsOptions) =>
  (withYjs(editor as any, sharedRoot as Y.XmlText,
    options as WithYjsOptions) as any) as E & TYjsEditor<V>;