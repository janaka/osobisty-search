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
import * as awarenessProtocol from 'y-protocols/awareness'
import * as random from 'lib0/random'
import * as math from 'lib0/math'



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
    
    const webrtcprovider = new WebrtcProvider("osobisty"+docId, yDoc,{
      // Specify signaling servers. The client will connect to every signaling server concurrently to find other peers as fast as possible.
      signaling: ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com'],
      // If password is a string, it will be used to encrypt all communication over the signaling servers.
      // No sensitive information (WebRTC connection info, shared data) will be shared over the signaling servers.
      // The main objective is to prevent man-in-the-middle attacks and to allow you to securely use public / untrusted signaling instances.
      password: 'lksjdf8743$£%£$%£%£4safasdf892834ASFDSDFjlkasdflsdf"3?',
      // Specify an existing Awareness instance - see https://github.com/yjs/y-protocols
      awareness: new awarenessProtocol.Awareness(yDoc),
      // Maximal number of WebRTC connections.
      // A random factor is recommended, because it reduces the chance that n clients form a cluster.
      maxConns: 20 + math.floor(random.rand() * 15),
      // Whether to disable WebRTC connections to other tabs in the same browser.
      // Tabs within the same browser share document updates using BroadcastChannels.
      // WebRTC connections within the same browser are therefore only necessary if you want to share video information too.
      filterBcConns: true,
      // simple-peer options. See https://github.com/feross/simple-peer#peer--new-peeropts for available options.
      // y-webrtc uses simple-peer internally as a library to create WebRTC connections.
      peerOpts: {}
    });
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