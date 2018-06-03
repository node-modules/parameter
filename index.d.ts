declare module "parameter" {
  export class Parameter {
    validate<T>(rule: Plaint<T>, o: T): any;
  }
  type Plaint<T> = { [u in keyof T]: "string" | "number" | "boolean" };
}
