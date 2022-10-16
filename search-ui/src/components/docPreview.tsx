import { Plate, PlateProvider } from '@udecode/plate';
import React, { useEffect, useState } from 'react';
import { addHightlightMarkup } from '../utils/addHighlightMarkup';
import { addHtmlFormatting } from '../utils/addHtmlFormatting';
import EditView from './editView';
import { TEditMode } from "../types/TEditMode";
import { MyEditor, MyValue } from './slate-plate/plateTypes';
import { PLUGINS } from './slate-plate/plugins';

export function DocPreview({ isAuthenticated, wsAuthToken, editMode, hitData, setSelectedHitFunc }: { isAuthenticated: boolean, wsAuthToken: string, editMode: TEditMode, hitData:any, setSelectedHitFunc: React.Dispatch<React.SetStateAction<{} | null | undefined>> }) {

  const [editMode1, setEditMode1] = useState<TEditMode>(TEditMode.ReadOnly)

  useEffect(() => {
    if (editMode) setEditMode1(editMode)
  }, [editMode])

  return (
    <div>
      {hitData &&
        <div className="doc-preview">
          <div className="doc-preview-buttons">

            <button
              title="Close preview"
              className="button doc-preview-close"
              onClick={() => (setSelectedHitFunc(null))}
            >
              ×
            </button>
            {hitData.document.link && <a
              title="Open on new page"
              href={hitData.document.type.startsWith("zettle-") ? "vscode://file/Users/janakaabeywardhana/code-projects/zettelkasten" + hitData.document.link : hitData.document.link}
              // eslint-disable-next-line react/jsx-no-target-blank
              target="_blank"
              className="button doc-preview-open" rel="noreferrer"
            >
              <span className="desktop">open </span>→
            </a>}
            <button
              title="Read Only"
              className="button"
              onClick={() => (setEditMode1(TEditMode.ReadOnly))}
            >
              Read Only
            </button>
            <button
              title="Edit MD"
              className="button"
              onClick={() => (setEditMode1(TEditMode.EditMd))}
            >
              Edit MD
            </button>
            <button
              title="Edit Raw"
              className="button"
              onClick={() => (setEditMode1(TEditMode.EditRaw))}
            >
              Edit Raw
            </button>
            <div className="doc-preview-title" dangerouslySetInnerHTML={{ __html: addHightlightMarkup(hitData, "title") }}>
            </div>
          </div>

          {editMode == TEditMode.ReadOnly ?
            <ReadonlyView hitData={hitData} />

            :

            editMode == TEditMode.EditRaw ?

              <Plate<MyValue, MyEditor >
                id="raweditortest"
                plugins={PLUGINS.allNodes}
                //editor={editor}
                //editableProps={{ ...editableProps }}
                //initialValue={value}
                //value={value} //{[{ children: [{ text: '' }] }]}
                //plugins={plugins} // when the `editor` instance is provided this doesn't apply
                onChange={(newValue) => {
                  console.log("PlateRaw onChange() fired")
                  //setValue(newValue)
                  // console.log("`sharedRoot` onChange():", editor.sharedRoot.toDelta())
                  // console.log("`newValue` onChange():", newValue)
                }}

              />

              :

              // <EditView className="doc-preview-content" id={props.hitData.document.id} collectionName={props.hitData.document.collectionName} editMode={editMode} />

            // <PlateProvider<MyValue, MyEditor> id={props.hitData.document.id} >
            //   {/* need <PlateProvider> for the state handling to work properly */}
             <EditView editMode={editMode} isAuthenticated={isAuthenticated} wsAuthToken={wsAuthToken} />
            // </PlateProvider>

          }

        </div>
      }
    </div>
  )
}


function ReadonlyView(props: any) {

  return (
    <>
      <div className="doc-preview-data">
        <div className="data-row"><span className="field-heading">Id:</span><span className="field-value">{props.hitData.document.id} </span></div>
        <div className="data-row"><span className="field-heading">Type:</span><span className="field-value">{props.hitData.document.type} </span></div>
        {props.hitData.document.authors && <div className="data-row"><span className="field-heading">Authors:</span><span className="field-value">{props.hitData.document.authors}</span></div>}
        <div className="data-row"><span className="field-heading">Date:</span><span className="field-value">{props.hitData.document.date} </span></div>
        <div className="data-row"><span className="field-heading">Tags:</span><span className="field-value" dangerouslySetInnerHTML={{ __html: addHightlightMarkup(props.hitData, "tags") }}></span></div>
        {props.hitData.document.link && <div className="data-row"><span className="field-heading">Link:</span><span className="field-value">{props.hitData.document.type.toString().startsWith("zettle") ? "vscode://file/Users/janakaabeywardhana/code-projects/zettelkasten" + props.hitData.document.link : props.hitData.document.link}</span></div>}

      </div>
      {props.hitData.document.note_content && <div className="doc-preview-content" dangerouslySetInnerHTML={{ __html: addHtmlFormatting(addHightlightMarkup(props.hitData, "note_content")) }}></div>}
      {props.hitData.document.source_content && <div className="doc-preview-content" dangerouslySetInnerHTML={{ __html: addHtmlFormatting(addHightlightMarkup(props.hitData, "source_content")) }}></div>}
      {/* {props.hitData.document.type=="Twitter-bm" && <EmbedTweet tweetUrl={props.hitData.document.link} /> } */}

    </>
  );
}

