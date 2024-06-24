export enum Type {
  FILE,
  DIRECTORY,
}

type CommonProps = {
  id: string;
  type: Type;
  name: string;
  content?: string;
  path: string;
  parentId: string | undefined;
  depth: number;
};

export interface File extends CommonProps {}

export type RemoteFile = {
  type: "file" | "dir";
  name: string;
  path: string;
};

export interface Directory extends CommonProps {
  files: File[];
  dirs: Directory[];
}

export function buildFileTree(data: RemoteFile[]) {
  const dirs = data.filter((x) => x.type === "dir");
  const files = data.filter((x) => x.type === "file");
  const cache = new Map<string, Directory | File>();

  let rootDir: Directory = {
    id: "root",
    name: "root",
    parentId: undefined,
    type: Type.DIRECTORY,
    path: "",
    depth: 0,
    dirs: [],
    files: [],
  };

  dirs.forEach((item) => {
    let dir: Directory = {
      id: item.path,
      name: item.name,
      path: item.path,
      parentId:
        item.path.split("/").length === 2
          ? "0"
          : dirs.find(
              (x) => x.path === item.path.split("/").slice(0, -1).join("/")
            )?.path,
      type: Type.DIRECTORY,
      depth: 0,
      dirs: [],
      files: [],
    };

    cache.set(dir.id, dir);
  });

  files.forEach((item) => {
    let file: File = {
      id: item.path,
      name: item.name,
      path: item.path,
      parentId:
        item.path.split("/").length === 2
          ? "0"
          : dirs.find(
              (x) => x.path === item.path.split("/").slice(0, -1).join("/")
            )?.path,
      type: Type.FILE,
      depth: 0,
    };
    cache.set(file.id, file);
  });
  cache.forEach((value, key) => {
    if (value.parentId === "0") {
      if ((value.type = Type.DIRECTORY)) rootDir.dirs.push(value as Directory);
      else rootDir.files.push(value as File);
    } else {
      const parentDir = cache.get(value.parentId as string) as Directory;

      if (value.type === Type.DIRECTORY)
        parentDir.dirs.push(value as Directory);
      else parentDir.files.push(value as File);
    }
  });

  getDepth(rootDir, 0);
  return rootDir;
}

export function sortDir(l: Directory, r: Directory) {
  return l.name.localeCompare(r.name);
}

export function sortFile(l: File, r: File) {
  return l.name.localeCompare(r.name);
}

function getDepth(rootDir: Directory, currDepth: number) {
  rootDir.files.forEach((file) => {
    file.depth = currDepth + 1;
  });
  rootDir.dirs.forEach((dir) => {
    dir.depth = currDepth + 1;
    getDepth(dir, currDepth + 1);
  });
}

export function findFileByName(
  rootDir: Directory,
  filename: string
): File | undefined {
  let targetFile: File | undefined = undefined;
  function findFile(rootDir: Directory, filename: string) {
    rootDir.files.forEach((file) => {
      if (file.name === filename) {
        targetFile = file;
        return;
      }
    });
    rootDir.dirs.forEach((dir) => {
      findFile(dir, filename);
    });
  }
  findFile(rootDir, filename);
  return targetFile;
}
