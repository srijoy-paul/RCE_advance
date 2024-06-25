import { useEffect, useMemo } from "react";
import { Socket } from "socket.io-client";
import { RemoteFile, File, buildFileTree } from "../../utils/filesManager";
import { FileTree } from "../FileTree/Filetree";
import CodeEditor from "./CodeEditor";

type Props = {
  files: RemoteFile[];
  onSelect: (file: File) => void;
  selectedFile: File | undefined;
  socket: Socket;
};

function Editor({ files, onSelect, selectedFile, socket }: Props) {
  const rootDir = useMemo(() => {
    return buildFileTree(files);
  }, [files]);

  useEffect(() => {
    if (!selectedFile) {
      onSelect(rootDir.files[0]);
    }
  }, [selectedFile]);

  return (
    <div className="flex">
      <aside id="sidebar" className="w-[250px]">
        <FileTree
          rootDir={rootDir}
          selectedFile={selectedFile}
          onSelect={onSelect}
        />
        FileTree
      </aside>
      <CodeEditor socket={socket} selectedFile={selectedFile} />
      code
    </div>
  );
}

export default Editor;
