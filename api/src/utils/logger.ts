import { config } from 'dotenv';

// import * as l from '@google-cloud/logging';
// import { LogEntry } from "@google-cloud/logging/build/src/entry";


export type logLevel = "debug" | "info" | "warn" | "error" | "fatal" ;

config();


// const firebaseProjectId = process.env.FI_FIREBASE_PROJECT_ID;
// const isLocalMode = process.env.FI_RUNNING_MODE === 'local';

//if (!firebaseProjectId) throw new Error("logger(): Firebase Project ID must be defined.")

//const logging = new l.Logging({projectId: firebaseProjectId});

//const logResourceName = "fi-runner-alpha"

//const log = logging.log(logResourceName);

/**
 * A simpe wrapper function for logging so we can switch out eaily in the future. 
 * We should worry more about the structure of logs at this points.
 * @param level 
 * @param message 
 */
export const logger = (level: logLevel, message: string) => {
  const logLevels = {

    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  };


  const logLevel: number = process.env.LOG_LEVEL ? logLevels[process.env.LOG_LEVEL as logLevel] : logLevels.info;
  const now = new Date();

  const ts = `${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()} UTC`

  // const metadata:LogEntry = {
  //   resource: { type: 'global' },
  //   labels:{
  //     appName: "fi-runner",
  //     localMode: String(isLocalMode),
  //   },
  //   // See: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
  //   severity: level.toUpperCase(),
    
  // };

  // function convertLogSeverity(loglevel: logLevel): l.Severity {
  //   switch (loglevel) {
  //     case 'info':
  //       return l.Severity.info
  //     case 'warn':
  //       return l.Severity.warning
  //     case 'error':
  //       return l.Severity.error
  //     case 'debug':
  //         return l.Severity.debug
  //     case 'fatal':
  //       return l.Severity.critical

  //   }
  // }
  // // Prepares a log entry
  // const entry = log.entry(metadata, message);

  async function writeLog() {
    
    // NOTE: we are intentionally writing directly to the GCP log service to keep it simple for now. 
    //       We'll switch to the local log file + collector pattern we need more reliability.
    //await log.write(entry); 

    if (logLevels[level] >= logLevel) {
      switch (level) {
        // case 'debug':
        //   console.log(`${ts} \x1b[32m${level.toUpperCase()}\x1b[0m ${message}`);
        //   break;
        // case 'info':
        //   console.log(`${ts} \x1b[32m${level.toUpperCase()}\x1b[0m ${message}`);
        //   break;
        case 'warn':
          console.log(`${ts} \x1b[33m${level.toUpperCase()}\x1b[0m ${message}`);
          break;
        case 'error':
          console.log(`${ts} \x1b[31m${level.toUpperCase()}\x1b[0m ${message}`);
          break;
        case 'fatal':
          console.log(`${ts} \x1b[31m${level.toUpperCase()}\x1b[0m ${message}`);
          break;  
        default:
          console.log(`${ts} \x1b[32m${level.toUpperCase()}\x1b[0m ${message}`);
          break;
      }
    }

  }

  writeLog();
}

