import Editor from "@monaco-editor/react";
import { Socket } from "socket.io-client";
import { File } from "../../utils/filesManager";

type Props = {
  selectedFile: File | undefined;
  socket: Socket | null;
};

function CodeEditor({ selectedFile, socket }: Props) {
  if (!selectedFile) return null;

  const code = selectedFile.content;
  let extension = selectedFile.name.split(".").pop();
  let language;

  if (extension === "js" || extension === "jsx") language = "javascript";
  else if (extension === "ts" || extension === "tsx") language = "typescript";
  else if (extension === "py") language = "python";

  function debounce(func: (value: string) => void, wait: number) {
    let timeout: number;
    return (value: string | undefined) => {
      if (value !== undefined) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          func(value);
        }, wait);
      }
    };
  }

  return (
    <Editor
      height="100vh"
      language={language}
      value={code}
      theme="vs-dark"
      options={{
        lineNumbers: "on",
      }}
      onChange={debounce((value: string) => {
        socket?.emit("updateContent", {
          path: selectedFile.path,
          content: value,
        });
      }, 1000)}
    />
  );
}

export default CodeEditor;
