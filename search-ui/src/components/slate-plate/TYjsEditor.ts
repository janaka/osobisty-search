
import { TEditor, Value } from '@udecode/plate';
import { YjsEditor } from '@slate-yjs/core';

// Implements type for YjsEditor https://docs.slate-yjs.dev/api/slate-yjs-core/yjs-plugin#yjseditor

export type TYjsEditor<V extends Value> = TEditor<V> & 
Pick<
YjsEditor,
| 'isInline'
| 'isVoid'
| 'normalizeNode'
| 'apply'
| 'insertFragment'
| 'insertNode'
| 'sharedRoot'
| 'localOrigin'
| 'positionStorageOrigin'
| 'applyRemoteEvents'
| 'storeLocalChange'
| 'flushLocalChanges'
| 'isLocalOrigin'
| 'connect'
| 'disconnect'
>;
