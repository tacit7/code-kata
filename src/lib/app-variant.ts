export const APP_VARIANT = {
  id: "com.code-kata.app",
  contextApp: "code-kata-python",
  productName: "Code Kata Python",
  primaryLanguage: "python",
  languages: [
    { id: "javascript", label: "JavaScript" },
    { id: "python", label: "Python" },
  ],
} as const;

export type AppLanguage = (typeof APP_VARIANT.languages)[number]["id"];
