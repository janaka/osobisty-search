import { PlateProvider, Toolbar, LinkToolbarButton, Plate, TEditableProps, withTReact, PlateEditor, setPlatePlugins, TEditor, Value, WithPlateOptions, PlatePlugin, AnyObject, WithPlatePlugin, withPlate } from "@udecode/plate";
import { PLUGINS } from "./components/slate-plate/plugins";
import { Link } from "react-router-dom";
import { createMyEditor, MyEditor, MyValue } from "./components/slate-plate/plateTypes";
import { ReactNode, useMemo } from "react";
import { withTYjs } from "./components/slate-plate/withTYjs";
import * as Y from 'yjs';

const editableProps: TEditableProps<MyValue> = {
  autoFocus: false,
  spellCheck: false,
  placeholder: "Type…",
  className: "plateEditor",
};

//let sharedRoot




export function Testeditor1(props: any) {

  const docName = "sfsdfsdf";

  const editor = useMemo(() => {


    // define top level type as yXmlText
    const ydoc = new Y.Doc() //wsProvider.doc.get(docName, Y.XmlText) as Y.XmlText //getXmlText(yDoc, docId);
    const sharedRoot = ydoc.get('my xmltext type', Y.XmlText) as Y.XmlText


    //return withPlate<MyValue, MyEditor>(createMyEditor(), { id: "testeditor1", plugins: PLUGINS.allNodes })

    //the order below is important
    return withTReact(
      withTYjs(
        withPlate<MyValue, MyEditor>(
          createMyEditor(),
          { id: docName, plugins: PLUGINS.allNodes }
        ),
        sharedRoot,
        { autoConnect: false }
      )
    );
  }, [])



  return (

    <Plate<MyValue, MyEditor>
    id="sdfsdfs"
    //editor={editor} 
    editableProps={{ ...editableProps }} 
    plugins={PLUGINS.allNodes} />
  );
};


