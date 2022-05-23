// @refresh reset
import React, { useState, useMemo, useEffect } from 'react'
// Import the core binding
import { withYjs, slateNodesToInsertDelta, YjsEditor } from '@slate-yjs/core';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc'
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
import { PLUGINS } from './slate-plate/plugins';
import markdown from 'remark-parse';
import slate from 'remark-slate';
import unified from 'unified';
import { withTYjs } from './slate-plate/withTYjs';
import { plateNodeTypes } from './slate-plate/remarkslate-nodetypes';

export enum TEditMode {
  ReadOnly = "readonly",
  EditMd = "editmd",
  EditRaw = "editraw",
}

export type MyEditor = PlateEditor<TElement[]> & { typescript: boolean };

const EditView = ({ id, editContent, editMode }: { id: string, editContent: string, editMode: TEditMode}) => {


  const docId = id;
  const docEditContent = editContent;

  // TODO: handle loading and saving the zettle document from file via the API


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
        .use(slate, { nodeTypes: plateNodeTypes }) // map remark-slate to Plate node `type`
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
    //const provider = new WebrtcProvider("osobisty"+docId, yDoc, { signaling: ['ws://localhost:4444'], password: null , awareness: null, maxConns: null, filterBcConns: null, peerOpts: null})
    const provider = new WebrtcProvider("osobisty"+docId, yDoc);
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

    // withTYjs(s
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