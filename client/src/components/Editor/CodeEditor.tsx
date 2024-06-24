import Editor from "@monaco-editor/react";
import { Socket } from "socket.io-client";
import { File } from "../../utils/filesManager";

type Props = {
  selectedFile: File | undefined;
  socket: Socket;
};

function CodeEditor({ selectedFile, socket }: Props) {
  if (!selectedFile) return null;

  const code = selectedFile.content;
  let language = selectedFile.name.split(".").pop();

  if (language === "js" || language === "jsx") language = "javascript";
  else if (language === "ts" || language === "tsx") language = "typescript";
  else if (language === "py") language = "python";

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
        socket.emit("updateContent", {
          path: selectedFile.path,
          content: value,
        });
      }, 1000)}
    />
  );
}

export default CodeEditor;
