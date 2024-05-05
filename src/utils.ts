export const generateNewFileName = (uuid: string, file: File) =>
  `${uuid}.${file.name.split(".").pop()}`;
