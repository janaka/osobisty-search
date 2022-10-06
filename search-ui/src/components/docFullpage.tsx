import React, { useEffect } from 'react';
import { useParams } from "react-router-dom";
import { DocPreview } from './docPreview';
import { TEditMode } from '../types/TEditMode';
import EditView from './editView';


export function DocFullpage() {

    

  
    const params = useParams();
    console.log("url param id: ", params.id);

    if (!params.collectionName) throw new Error("`collectionName` cannot be `" + params.collectionName+  "`");
    if (!params.id) throw new Error("`collectionName` cannot be `" + params.id+  "`");

    const id = params.id;
    const collectionName= params.collectionName;

  
  return (
    <div className="doc-preview">
    <EditView id={id} collectionName={collectionName} editMode={TEditMode.EditMd} />
    </div>
    );
  

}
