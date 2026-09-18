/**
 * On-device OCR via ML Kit text recognition. This uses a native module
 * (`@react-native-ml-kit/text-recognition`) that requires a custom dev
 * client / prebuild — it is NOT available inside plain Expo Go. We feature
 * detect it at runtime and degrade gracefully: when it's unavailable (or a
 * recognition call fails), callers should fall back to the "type what's on
 * the label" manual entry flow, which always works. No data ever leaves the
 * device for either path.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let textRecognitionModule: any = null;
try {
  // Wrapped in try/catch: this throws (or resolves to a stub) when the
  // native module isn't linked, e.g. in Expo Go or before a dev client build.
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  textRecognitionModule = require('@react-native-ml-kit/text-recognition').default;
} catch {
  textRecognitionModule = null;
}

export class OcrUnavailableError extends Error {
  constructor(message = 'On-device text recognition is not available in this build.') {
    super(message);
    this.name = 'OcrUnavailableError';
  }
}

/** Whether the native ML Kit text recognizer is linked into this build. */
export function isOcrAvailable(): boolean {
  return textRecognitionModule !== null && typeof textRecognitionModule.recognize === 'function';
}

/**
 * Runs on-device text recognition on a captured photo and returns the raw
 * recognized text (label line breaks preserved where possible).
 * Throws OcrUnavailableError if the native module isn't present, or the
 * underlying error if recognition itself fails.
 */
export async function recognizeTextFromImage(imageUri: string): Promise<string> {
  if (!isOcrAvailable()) {
    throw new OcrUnavailableError();
  }
  try {
    const result = await textRecognitionModule.recognize(imageUri);
    if (typeof result === 'string') return result;
    if (result && typeof result.text === 'string') return result.text;
    return '';
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Text recognition failed.');
  }
}
