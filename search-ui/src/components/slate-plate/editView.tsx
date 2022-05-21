// @refresh reset
import React, { useState, useMemo, useEffect } from 'react'
// Import the core binding
import { withYjs, slateNodesToInsertDelta, YjsEditor } from '@slate-yjs/core';
import * as Y from 'yjs';
// Import the Slate editor factory.
import { BaseEditor } from 'slate';
import { HistoryEditor } from 'slate-history';
// Import the Slate components and React plugin.
import { ReactEditor, withReact } from 'slate-react';
import {
  Plate,
  PlateEditor,
  withPlate,
  createTEditor,
  withTReact,
  TElement,
  TEditableProps,
  AutoformatBlockRule,
  unwrapList,

} from '@udecode/plate'
import { createMDPreviewPlugin } from './createMDPreviewPlugin'
import { PLUGINS } from './plugins';
import { EditableProps } from 'slate-react/dist/components/editable';
import markdown from 'remark-parse';
import slate from 'remark-slate';
import unified from 'unified';
import { withTYjs } from './withTYjs';
import { plateNodeTypes } from './remarkslate-nodetypes';
import { link } from 'fs';
import { autoformatRules } from './autoformat/autoformatRules';



// - formatting plugins default `type` names don't match the slate-remark mappings ones
// - autoformat plugin needs rules hooking up

export type MyEditor = PlateEditor<TElement[]> & { typescript: boolean };

const EditView = ({ id, editContent }: { id: string, editContent: string }) => {


  const docId = id;
  const docEditContent = editContent;
  // Create a yjs document and get the shared type
  console.log("docId=" + docId);

  const editableProps: TEditableProps<TElement[]> = {
    autoFocus: false,
    spellCheck: false,
    placeholder: "Type…",
    className: "doc-preview-content",
  };

  //use remark-slate to de/serialise MD https://github.com/hanford/remark-slate


  let initialValue: any = [];
  useMemo(
    async () => {

      await unified()
        .use(markdown)
        .use(slate, { nodeTypes: plateNodeTypes })
        .process(docEditContent, (_, nodes) => {
          initialValue = nodes.result
        });

      console.log("remark-slate `result`:", initialValue)
      //console.log("remark-slate `value`:", value)

    }, [docId]
  );

  const [value, setValue] = useState<TElement[]>(initialValue);

  const editor = useMemo(() => {
    const yDoc = new Y.Doc();
    const sharedRoot = yDoc.get(docId, Y.XmlText) as Y.XmlText //getXmlText(yDoc, docId);

    //console.log("remark-slate `value`:", value)
    // Load the initial value into the yjs document      
    sharedRoot.applyDelta(slateNodesToInsertDelta(value));
    //console.log("reset `editor` for docId=" + docId)
    //console.log("`sharedRoot` init value:", sharedRoot)



    // the order below is important
    return withTReact(
      withTYjs(
        withPlate(
          createTEditor(),
          { id: docId, plugins: PLUGINS.allNodes, disableCorePlugins: false }
        ),
        sharedRoot,
        { autoConnect: false }
      )
    );

    // withTYjs(
    //   withTReact(
    //     withPlate(
    //       createTEditor(),
    //       { id: docId, disableCorePlugins: true }
    //     )),
    //   sharedRoot,
    //   { autoConnect: false }
    // );
  }, [docId])


  //https://signaling.simplewebrtc.com:443/

  // Connect editor in useEffect to comply with concurrent mode requirements.

  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return (

    <Plate
      id={docId}
      editor={editor}
      editableProps={{ ...editableProps }}
      initialValue={value}
      //value={initialValue} //{[{ children: [{ text: '' }] }]}
      //plugins={plugins} // when the `editor` instance is provided this doesn't apply
      onChange={(newValue) => {
        //setValue(newValue)
        console.log("`sharedRoot` onChange():", editor.sharedRoot.toDelta())
        console.log("`newValue` onChange():", newValue)
      }}

    />
  );
};

export default EditView;