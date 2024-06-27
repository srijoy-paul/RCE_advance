import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";
import { SiStreamrunners } from "react-icons/si";

import { IoLogoNodejs } from "react-icons/io5";
import Editor from "../Editor/Editor";
import { RemoteFile, File, Type } from "../../utils/filesManager";

function useSocket(replId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(`ws://${replId}.srijoy-paul.online`);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [replId]);

  return socket;
}

export default function CodingPage() {
  const [podCreated, setPodCreated] = useState(false);
  const [searchParams] = useSearchParams();
  const replId = searchParams.get("replId") ?? "";
  console.log("replId from coding page", replId);

  useEffect(() => {
    (async () => {
      if (replId) {
        const response = await fetch("http://localhost:3002/api/v1/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ replId }),
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
}

export const CodingPagePostPodCreation = () => {
  const [searchParams] = useSearchParams();
  const replId = searchParams.get("replId") ?? "";
  const [loaded, setLoaded] = useState(true);
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
    console.log("file from codingpage", file);

    if (file?.type === Type.DIRECTORY) {
      socket?.emit("fetchDir", file.path, (data: RemoteFile[]) => {
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
    <section className=" h-screen">
      <div className="flex justify-between px-5 h-[5%] ">
        <span className="flex items-center gap-1 cursor-pointer border-2 border-slate-300 px-3">
          <IoLogoNodejs className="text-green-700" />
          {replId}
        </span>
        <button className="border-2 px-5 rounded-lg hover:bg-slate-100 border-slate-500 flex items-center gap-2">
          Run <SiStreamrunners size={20} />
        </button>
      </div>
      <div id="workspace" className="flex border-2 border-red-200 h-[95%]">
        <div id="leftpanel" className="w-[60%] border-2 border-red-100 h-full">
          <Editor
            socket={socket}
            selectedFile={selectedFile}
            onSelect={onSelect}
            files={fileStructure}
          />
        </div>
        <div id="rightpanel" className="w-[40%]">
          {/* {showOutput && <Output />} */}
          {/* <Terminal socket={socket} /> */}Terminal
        </div>
      </div>
    </section>
  );
};
