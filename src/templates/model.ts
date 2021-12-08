export const MODEL_TEMPLATE = (
  CLASSNAME: string,
  FIELDS: string,
  CUSTOMFIELDS: string = '  // skip overwrite 👇',
  EXTENDS: string = ''
) => {
  return `export class ${CLASSNAME}${EXTENDS} {
${FIELDS}
${CUSTOMFIELDS}
}`
}
