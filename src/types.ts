export type Namespace =
  | "React Client"
  | "Xamarin Client"
  | "Digital Door Sign"
  | "Digital Whiteboard"
  | "My Stay Mobile";

export interface LocalizationRow {
  id: string;
  phraseKey: string;
  defaultTranslation: string;
  description?: string;
  screenshot?: string;
  translations: { [language: string]: string };
  namespace: Namespace | null;
}
