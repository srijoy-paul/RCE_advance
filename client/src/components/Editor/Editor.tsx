import { useMemo } from "react";
import { Socket } from "socket.io-client";

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
  return (
    <div className="flex">
      <aside id="sidebar" className="w-[250px]">
        <FileTree
          rootDir={rootDir}
          selectedFile={selectedFile}
          onSelect={onSelect}
        />
      </aside>
      <Code socket={socket} selectedFile={selectedFile} />
    </div>
  );
}

export default Editor;
