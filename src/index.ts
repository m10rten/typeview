export const version = {
  major: 0,
  minor: 0,
  patch: 0,
};
export const name = "typeview";
export class TypeView {
  public constructor() {
    throw new TypeError(
      `Oh no! Version ${version.major}.${version.minor}.${version.patch} of 'typeview' does not contain any functionality.`,
    );
  }
}

export default TypeView;
