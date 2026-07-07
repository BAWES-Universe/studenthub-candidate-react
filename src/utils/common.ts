import { RootState, store, useAppSelector } from "@/store/store";
//import { Filesystem, Directory } from '@capacitor/filesystem';

import { enUS, ar } from "date-fns/locale";
import i18n from "@/18n";
import { format } from "date-fns";

// A custom hook that builds on useLocation to parse
// the query string for you.
export function useQuery() {
  // Get the query string from the URL
  let queryString = window.location.search;

  // Create a new URLSearchParams object
  return new URLSearchParams(queryString);
}

export function dateTimeFormat(value: string, dateFormat: string): string {
  return format(toDate(value) as Date, dateFormat, { locale: i18n.language == 'en' ? enUS : ar })
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);
}

/**
 * Make date readable by Safari
 * @param date
 */
export function toDate(date: string | null | undefined | Date) {
  
  if (date && typeof date == 'string') {
    return new Date(date.replace(/-/g, '/'));
  }

  return date;
}

// Helper function to convert seconds to time format
export const secondsToTime = (value: number) => {
  /*const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;*/

  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;

  const hoursString = hours.toString().padStart(2, '0');
  const minutesString = minutes.toString().padStart(2, '0');
  const secondsString = seconds.toString().padStart(2, '0');

  return `${hoursString}:${minutesString}:${secondsString}`;
};

/**
 * Return content based on language selected
 * @param enContent
 * @param arContent
 */
export function langContent(enContent: string = "", arContent: string = "") {

  const state = store.getState(); // Get the state directly from the store

  const { language } = state.app;  
   
  if (language == 'ar' && arContent) {
    return arContent;
  }

  return enContent ? enContent : arContent;
}

export function isString(x: any) {
  return Object.prototype.toString.call(x) === "[object String]"
}

/**
 * json to string error message
 * @param message
 */
export function errorMessage(message: string | any): string {

  if (isString(message)) {
    return message + '';
  }

  const a: string[] = [];

  for (const i in message) {

    if (!Array.isArray(message[i])) {
      a.push(message[i]);
      continue;
    }

    for (const j of message[i]) {
      a.push(j);
    }
  }

  return a.join('<br />');
}

export async function convertBlobToBase64(blob: Blob) { // blob data
  return await blobToBase64(blob);
}

export function blobToBase64(blob: Blob) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    if (blob instanceof Blob) {
      const realFileReader = (reader as any)._realReader;
      if (realFileReader) {
        reader = realFileReader;
      }
    }

    reader.readAsDataURL(blob);
    reader.onload = async (data) => {
      resolve(reader.result);
    }
    reader.onerror = error => {
      reject(error);
    }
  });
}

  /**
   * @param name
   * @private
   */
  export function getMimeType(name: string) {
    if (name.indexOf('pdf') >= 0) {
      return 'application/pdf';
    } else if (name.indexOf('png') >= 0) {
      return 'image/png';
    } else if (name.indexOf('mp4') >= 0) {
      return 'video/mp4';
    }
  }


  export function detectBrowserName() {
    const agent = window.navigator.userAgent.toLowerCase();
    switch (true) {
      case agent.indexOf('edge') > -1:
        return 'edge';
      case agent.indexOf('opr') > -1:
        return 'opera';
      case agent.indexOf('chrome') > -1:
        return 'chrome';
      case agent.indexOf('trident') > -1:
        return 'ie';
      case agent.indexOf('firefox') > -1:
        return 'firefox';
      case agent.indexOf('safari') > -1:
        return 'safari';
      default:
        return 'other';
    }
  } 

  
/*
export async function fileWrite(blob: Blob, filename: string) {
    try {
      const saveFile = await Filesystem.writeFile({
        path: filename,
        data: blob,
        directory: Directory.Documents,
      })
      const path = saveFile.uri;
      const mimeType = getMimeType(filename);
      
      fileOpener.open(path, mimeType)
        .then(() => console.log('file is opened'))
        .catch(err => console.error(err));

    } catch(e) {
      console.error('Unable to write file', e);
    }
}*/
