
module.exports = {
  /**
   * Use JavaScript Standard Style.
   * See https://standardjs.com
   */
  'extends': 'standard',
  
  

  /**
   * Ignore global variables.
   * See https://eslint.org/docs/user-guide/configuring#specifying-globals
   */
  // 'globals': []

  'rules': {
    'global-require': ['error'],
    'brace-style': ['error', 'stroustrup', { 'allowSingleLine': true }],
    'newline-per-chained-call': ['error', { 'ignoreChainWithDepth': 2 }],
    'require-jsdoc': ['error', {
      'require': {
          'FunctionDeclaration': true,
          'ClassDeclaration': true,
          'MethodDefinition': true
      }
    }]
  }
}
