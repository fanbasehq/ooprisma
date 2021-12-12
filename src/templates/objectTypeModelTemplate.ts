export const MODEL_TEMPLATE = (
  className: string,
  fields: string,
  customFields: string = '  // skip overwrite 👇',
  extendsClause: string = ''
) => {
  return `@ObjectType()
  export class ${className}${extendsClause} {
${fields}
${customFields}
}`
}
