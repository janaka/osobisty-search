import { WebClippingData } from "../client-libs/osobisty-client";

export interface WebClippingDataExtended extends WebClippingData {
  totalClips: number 
  numberClipsHighlighted: number
  numberClipsNotHighlighted: number
}