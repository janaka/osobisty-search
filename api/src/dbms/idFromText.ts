import fletcher16 from "./flecher16.js";
/**
 * Generate an ID from some text using a checksum algo. Givem the same text the same ID will be generated.
 * @param text any chunk of text to generate an ID from
 * @returns Id generated using the Flecher16 checksum algo
 */
//TODO: - verify the regeneration and uniqueness assumption
export function generateIdFromText(text: string): string {
  const b: Buffer = Buffer.from(text, 'utf-8')

  const id = fletcher16(b)

  return id.toString();
}