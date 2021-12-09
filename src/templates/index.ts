export const INDEX_TEMPLATE = (
  classes: string,
  importStatements: string = '',
  moduleLocals: string = ''
) => `${importStatements}
${moduleLocals}
${classes}`
