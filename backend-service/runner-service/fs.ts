const fs = require("fs");

type File = {
  type: "file" | "dir";
  name: string;
};

export const fetchDir = (dir: string, baseDir: string): Promise<File[]> => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, { withFileTypes: true }, (err: Error, files: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(
          files.map((file: any) => ({
            type: file.isDirectory() ? "dir" : "file",
            name: file.name,
            path: `${baseDir}/${file.name}`,
          }))
        );
      }
    });
  });
};

export const fetchFileContent = (file: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf-8", (err: Error, data: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

export const saveFile = async (
  file: string,
  content: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, content, "utf-8", (err: Error) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};
