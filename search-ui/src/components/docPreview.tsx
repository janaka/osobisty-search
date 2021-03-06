import { PlateProvider } from '@udecode/plate';
import React, { useState } from 'react';
import { addHightlightMarkup } from '../utils/addHighlightMarkup';
import { addHtmlFormatting } from '../utils/addHtmlFormatting';
import EditView, { TEditMode } from './editView';

export function DocPreview(props: any) {

  const [editMode, setEditMode] = useState<TEditMode>(TEditMode.ReadOnly)

  return (
    <div>
      {props.hitData &&
        <div className="doc-preview">
          <div className="doc-preview-buttons">

            <button
              title="Close preview"
              className="button doc-preview-close"
              onClick={() => (props.setSelectedHit(null))}
            >
              ×
            </button>
            {props.hitData.document.link && <a
              title="Open on new page"
              href={props.hitData.document.type.startsWith("zettle-") ? "vscode://file/Users/janakaabeywardhana/code-projects/zettelkasten" + props.hitData.document.link : props.hitData.document.link}
              // eslint-disable-next-line react/jsx-no-target-blank
              target="_blank"
              className="button doc-preview-open" rel="noreferrer"
            >
              <span className="desktop">open </span>→
            </a>}
            <button
              title="Read Only"
              className="button"
              onClick={() => (setEditMode(TEditMode.ReadOnly))}
            >
              Read Only
            </button>
            <button
              title="Edit MD"
              className="button"
              onClick={() => (setEditMode(TEditMode.EditMd))}
            >
              Edit MD
            </button>
            <button
              title="Edit Raw"
              className="button"
              onClick={() => (setEditMode(TEditMode.EditRaw))}
            >
              Edit Raw
            </button>
            <div className="doc-preview-title" dangerouslySetInnerHTML={{ __html: addHightlightMarkup(props.hitData, "title") }}>
            </div>
          </div>

          {editMode == TEditMode.ReadOnly ?
            <ReadonlyView hitData={props.hitData} />

            : 
            
            <PlateProvider id={props.hitData.document.id} >
              {/* need <PlateProvider> for the state handling to work properly */}
              <EditView id={props.hitData.document.id} editContent={props.hitData.document.note_content} editMode={editMode} />
            </PlateProvider>
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

