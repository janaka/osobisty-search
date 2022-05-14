
import { TEditor, Value } from '@udecode/plate';
import { YjsEditor } from '@slate-yjs/core';

//export type TYjsEditor<V extends Value> = TEditor<V> & YjsEditor;

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
