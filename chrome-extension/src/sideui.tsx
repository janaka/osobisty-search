import React, { useState, useEffect } from 'react';
import './sideui.css';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/solid'
import ClipsList from './sideui-components/clip-list';

function SideUI(props: any) {
  const [isOpen, setIsOpen] = useState(false);
  // const [title, setTitle] = React.useState('');
  // const [headlines, setHeadlines] = React.useState<string[]>([]);
  // const [selectedHit, setSelectedHit] = useState(null);
  // const [clipData, setClipData] = React.useState<WebClippingDataExtended>();

  useEffect(() => {

    // local storage is per origin i.e. scoped to a domian + protocol
    const isOpenKey = localStorage.getItem('isOpen');
    console.log("useeffects " + isOpenKey)

    if (isOpenKey && JSON.parse(isOpenKey).isOpen !== isOpen) {
      setIsOpen(JSON.parse(isOpenKey).isOpen)
    }

  }, [props.isOpen, isOpen]);

  const clickHandler = (event: any) => {
    console.log("onclick " + isOpen)
    if (isOpen) {
      localStorage.setItem('isOpen', JSON.stringify({ 'isOpen': false }));
      setIsOpen(false)
    } else {
      localStorage.setItem('isOpen', JSON.stringify({ 'isOpen': true }));
      setIsOpen(true)
    }

  }

  return (
    <div className={isOpen ? 'min-h-500 w-400 min-w-400 max-w-600 p-2 pb-3 top-0 right-0 rounded-sm z-top fixed float-right antialiased font-mono text-sm text-primary-300 bg-primary-700 osobisty-side-ui-container open' : 'h-50 w-30 pt-2 top-0 right-0 fixed float-right z-top closed'}>
      <div className="mb-3">
      <button id="expandcollaps-button" className="group relative h-6 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-300 bg-primary-600 hover:bg-primary-700" onClick={clickHandler}>
        <span className="absolute left-0 inset-y-0 flex items-center">
          {isOpen
            ? <ChevronDoubleRightIcon className="h-8 w-8 text-primary-500 group-hover:text-secondary-300" aria-hidden="true" />
            : <ChevronDoubleLeftIcon className="h-8 w-8 text-primary-500 group-hover:text-secondary-300" aria-hidden="true" />}
        </span>
      </button>
      </div>
      
      <div className="overflow-y-auto h-500">{isOpen && <ClipsList />}</div>
    </div>
  );
}


export default SideUI;