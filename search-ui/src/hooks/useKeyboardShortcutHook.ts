import { useEffect, useCallback, useReducer } from "react";

const blacklistedTargets = ["INPUT", "TEXTAREA"];

const keysReducer = (state:any, action:any) => {
  switch (action.type) {
    case "set-key-down":
      const keydownState = { ...state, [action.key]: true };
      return keydownState;
    case "set-key-up":
      const keyUpState = { ...state, [action.key]: false };
      return keyUpState;
    case "reset-keys":
      const resetState = { ...action.data };
      return resetState;
    default:
      return state;
  }
};

const useKeyboardShortcut = (shortcutKeys:any, callback:any, options:any) => {
  if (!Array.isArray(shortcutKeys))
    throw new Error(
      "The first parameter to `useKeyboardShortcut` must be an ordered array of `KeyboardEvent.key` strings."
    );

  if (!shortcutKeys.length)
    throw new Error(
      "The first parameter to `useKeyboardShortcut` must contain atleast one `KeyboardEvent.key` string."
    );

  if (!callback || typeof callback !== "function")
    throw new Error(
      "The second parameter to `useKeyboardShortcut` must be a function that will be envoked when the keys are pressed."
    );

  const { overrideSystem } = options || {}
  const initalKeyMapping = shortcutKeys.reduce((currentKeys, key) => {
    currentKeys[key.toLowerCase()] = false;
    return currentKeys;
  }, {});

  const [keys, setKeys] = useReducer(keysReducer, initalKeyMapping);

  const keydownListener = useCallback(
    (    assignedKey: string) => (keydownEvent:any) => {
      const loweredKey = assignedKey.toLowerCase();
      
      if (keydownEvent.repeat) return
      if (blacklistedTargets.includes(keydownEvent.target.tagName)) return;
      if (loweredKey !== keydownEvent.key.toLowerCase()) return;
      if (keys[loweredKey] === undefined) return;

      if (overrideSystem) {
        keydownEvent.preventDefault();
        disabledEventPropagation(keydownEvent);
      }

      setKeys({ type: "set-key-down", key: loweredKey });
      return false;
    },
    [keys, overrideSystem]
  );

  const keyupListener = useCallback(
    (    assignedKey: string) => (keyupEvent:any) => {
      const raisedKey = assignedKey.toLowerCase();

      if (blacklistedTargets.includes(keyupEvent.target.tagName)) return;
      if (keyupEvent.key.toLowerCase() !== raisedKey) return;
      if (keys[raisedKey] === undefined) return;

      if (overrideSystem) {
        keyupEvent.preventDefault();
        disabledEventPropagation(keyupEvent);
      }

      setKeys({ type: "set-key-up", key: raisedKey });
      return false;
    },
    [keys, overrideSystem]
  );

  useEffect(() => {
    if (!Object.values(keys).filter(value => !value).length) {
      callback(keys);
      setKeys({ type: "reset-keys", data: initalKeyMapping });
    } else {
      setKeys({ type: null })
    }
  }, [callback, keys]);

  useEffect(() => {
    shortcutKeys.forEach(k => window.addEventListener("keydown", keydownListener(k)));
    return () => shortcutKeys.forEach(k => window.removeEventListener("keydown", keydownListener(k)));
  }, []);

  useEffect(() => {
    shortcutKeys.forEach(k => window.addEventListener("keyup", keyupListener(k)));
    return () => shortcutKeys.forEach(k => window.removeEventListener("keyup", keyupListener(k)));
  }, []);
};

function disabledEventPropagation(e:any){
  if(e){
    if(e.stopPropagation){
      e.stopPropagation();
    } else if(window.event){
      window.event.cancelBubble = true;
    }
  }
}


export default useKeyboardShortcut;



// import { useState, useEffect } from "react";

// // Hook
// function useKeyPress(targetKey: string ) {
//   // State for keeping track of whether key is pressed
//   const [keyPressed, setKeyPressed] = useState<boolean>(false);
//   // If pressed key is our target key then set to true
//   function downHandler(e:any) {
//     console.log("key press hook " + e.key)
//     if (e.key === targetKey) {
//       setKeyPressed(true);
//     }
//   }
//   // If released key is our target key then set to false
//   const upHandler = (e:any) => {
//     if (e.key === targetKey) {
//       setKeyPressed(false);
//     }
//   };
//   // Add event listeners
//   useEffect(() => { 
//     window.addEventListener("keydown", downHandler);
//     window.addEventListener("keyup", upHandler);
//     // Remove event listeners on cleanup
//     return () => {
//       window.removeEventListener("keydown", downHandler);
//       window.removeEventListener("keyup", upHandler);
//     };
//   }, []); // Empty array ensures that effect is only run on mount and unmount
//   return keyPressed;
// }

// export default useKeyPress;