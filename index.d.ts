// Type definitions for parameter 3.6.0
// Project: https://github.com/node-modules/parameter
// Definitions by: GHLandy <ghlandy@ghlandy.com>

export = Parameter

declare class Parameter {
  constructor(options?: {
    translate?: Function
    validateRoot?: boolean | false
    convert?: boolean | false
    widelyUndefined?: boolean | false
  })

  validate(
    rule: { [key: string]: string | string[] | object },
    value: object
  ): Array<{ code: string; field: string; message: string }> | void

  addRule(type: string, check?: Function | RegExp): void
}
