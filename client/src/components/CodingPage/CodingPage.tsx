import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

import { IoLogoNodejs } from "react-icons/io5";
import Editor from "../Editor/Editor";
import { Type } from "../../utils/filesManager";

function useSocket(replId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(`ws://${replId}.rce-runner.duckdns.org`);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [replId]);

  return socket;
}

export const CodingPage = () => {
  const [podCreated, setPodCreated] = useState(false);
  const [searchParams] = useSearchParams();
  const replId = searchParams.get("replId") ?? "";

  useEffect(() => {
    (async () => {
      if (replId) {
        const response = await fetch("http://localhost:3002/start", {
          method: "POST",
          headers: {
            Content: "application/json",
            body: JSON.stringify({ replId }),
          },
        });
        if (!response.ok) throw new Error("Error while booting your ground.");
        setPodCreated(true);
      }
    })();
  }, []);

  if (!podCreated) {
    return <>Booting...🤖</>;
  }

  return <CodingPagePostPodCreation />;
};

export const CodingPagePostPodCreation = () => {
  const [searchParams] = useSearchParams();
  const replId = searchParams.get("replId") ?? "";
  const [loaded, setLoaded] = useState(false);
  const socket = useSocket(replId);
  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on("loaded", ({ rootContent }: { rootContent: RemoteFile[] }) => {
        setLoaded(true);
        setFileStructure(rootContent);
      });
    }
  }, [socket]);

  const onSelect = (file: File) => {
    if (file.type === "DIRECTORY") {
      socket?.emit("fetchDir", file.path, (data: RemoteFle[]) => {
        setFileStructure((prev) => {
          const allFiles = [...prev, ...data];
          return allFiles.filter(
            (file, index, self) =>
              index === self.findIndex((idx) => idx.path === file.path)
          );
        });
      });
    } else {
      socket?.emit("fetchContent", { path: file.path }, (data: string) => {
        file.content = data;
        setSelectedFile(file);
      });
    }
  };

  if (!loaded) {
    return "Loading...🔃";
  }

  return (
    <>
      <div className="flex justify-around">
        <span className="flex">
          <IoLogoNodejs />
          {replId}
        </span>
        <button>▶️Run</button>
      </div>
      <div id="workspace" className="flex">
        <div id="leftpanel" className="w-[60%]">
          <Editor
            socket={socket}
            selectedFile={selectedFile}
            onSelect={onSelect}
            files={fileStructure}
          />
        </div>
        <div id="rightpanel" className="w-[40%]">
          {showOutput && <Output />}
          <Terminal socket={socket} />
        </div>
      </div>
    </>
  );
};
