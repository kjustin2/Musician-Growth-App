// Utility type to extract TypeScript interface from field definitions
// Converts from DB type to TypeScript item type.
export type ExtractFieldType<T> = T extends { type: 'string'; required: true }
  ? string
  : T extends { type: 'string'; required?: false }
    ? string | undefined
    : T extends { type: 'number'; required: true }
      ? number
      : T extends { type: 'number'; required?: false }
        ? number | undefined
        : T extends { type: 'boolean'; required: true }
          ? boolean
          : T extends { type: 'boolean'; required?: false }
            ? boolean | undefined
            : T extends { type: 'date'; required: true }
              ? Date
              : T extends { type: 'date'; required?: false }
                ? Date | undefined
                : unknown;

export type ExtractFieldsFromDefinitions<T extends Record<string, unknown>> = {
  [K in keyof T]: ExtractFieldType<T[K]>;
};
