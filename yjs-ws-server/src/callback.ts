import http from 'http';
import { WSSharedDoc } from './utils.js';
import y, {Array as YArray, XmlFragment, XmlElement} from 'yjs'


const CALLBACK_URL: URL | null = process.env.CALLBACK_URL ? new URL(process.env.CALLBACK_URL) : null
const CALLBACK_TIMEOUT = Number(process.env.CALLBACK_TIMEOUT) || 5000
const CALLBACK_OBJECTS = process.env.CALLBACK_OBJECTS ? JSON.parse(process.env.CALLBACK_OBJECTS) : {}

export const isCallbackSet = !!CALLBACK_URL

interface IDataToSend {
  room: string;
  data: {
    [index:string]: {}
  };
}

/**
 * @param {Uint8Array} update
 * @param {any} origin
 * @param {WSSharedDoc} doc
 */
export const callbackHandler = (update: Uint8Array, origin: any, doc: WSSharedDoc) => {
  const room = doc.name
  let dataToSend: IDataToSend = {
    room: room,
    data: {
      
    }
  }
  const sharedObjectList = Object.keys(CALLBACK_OBJECTS)
  sharedObjectList.forEach(sharedObjectName => {
    const sharedObjectType = CALLBACK_OBJECTS[sharedObjectName]
    dataToSend.data[sharedObjectName] = {
      type: sharedObjectType,
      content: getContent(sharedObjectName, sharedObjectType, doc).toJSON()
    }
  })

  if (isCallbackSet) {
    callbackRequest(CALLBACK_URL, CALLBACK_TIMEOUT, dataToSend)
  } else {
    throw "CALLBACK_URL env var is null!"
  }
}

/**
 * @param {URL} url
 * @param {number} timeout
 * @param {Object} data
 */
const callbackRequest = (url: URL | null, timeout: number, data: any) => {
  if (url==null) throw "URL param is null"
  data = JSON.stringify(data)
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    timeout: timeout,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }
  const req = http.request(options)
  req.on('timeout', () => {
    console.warn('Callback request timed out.')
    req.abort()
  })
  req.on('error', (e) => {
    console.error('Callback request error.', e)
    req.abort()
  })
  req.write(data)
  req.end()
}

/**
 * @param {string} objName
 * @param {string} objType
 * @param {WSSharedDoc} doc
 */
const getContent = (objName: string, objType: string, doc: WSSharedDoc): any => {
  switch (objType) {
    case 'Array': return doc.getArray(objName)
    case 'Map': return doc.getMap(objName)
    case 'Text': return doc.getText(objName)
    case 'XmlFragment': return doc.getXmlFragment(objName)
    //FIXME: case 'XmlElement': return doc.getXmlElement(objName)
    default : return {}
  }
}