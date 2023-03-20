
type typeDes="bool"|"date"|"dateTime"|"email"|"url"|"id"| "string" | "number" | "boolean"|"array"|"int"|"json"|"object";
type childDes={
  type:typeDes,
  itemType:typeDes,
  required:boolean,
  rule:Plaint,
  min?:number,
  allowEmpty?:boolean,
  format:RegExp,
  values?:string[]
}
type Plaint = { //|typeof T[U]<T>|Plaint<T[U]>
  [u :string]:any[]|childDes|typeDes |childDes//{message:string }
 };
