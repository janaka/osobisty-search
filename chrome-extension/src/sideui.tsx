import React from 'react';
import ReactDOM from 'react-dom';
import './sideui.css';
//import reportWebVitals from './reportWebVitals';


function SideUI() {
  // const [title, setTitle] = React.useState('');
  // const [headlines, setHeadlines] = React.useState<string[]>([]);
  // const [selectedHit, setSelectedHit] = useState(null);
  // const [clipData, setClipData] = React.useState<WebClippingDataExtended>();

  // useEffect(() => {

  //   });
    // chrome.runtime.onMessage.addListener(
    //   function(request, sender, sendResponse) {
    //     console.log("command message received at extensions")
        
    //     if (request.command === "updateHighlightInfo") {

    //     }
    //   }
    // );
  // },[]);
  return (
    <div className="osobisty-side-ui-container">
      <header className="App-header">
        Osobisty
      </header>
      <div>
                
      </div>
    </div>
  );
}



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();

export default SideUI;