declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// next-intl type safety
type Messages = typeof import("./translations/uz.json");
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
declare interface IntlMessages extends Messages {}
