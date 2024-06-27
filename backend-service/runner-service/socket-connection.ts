import { Socket } from "socket.io";

const { Server, Socket: SocketType } = require("socket.io");
const { Server: HttpServer } = require("http");
const { saveToS3 } = require("./config/aws");
const { TerminalManager } = require("./manageTerminal");
const { fetchDir, fetchFileContent, saveFile } = require("./fs");

const path = require("path");

const terminalManager = new TerminalManager();

export function initWs(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket: any) => {
    const host = socket.handshake.headers.host;
    console.log(`host is ${host}`);

    const replId = host?.split(".")[0];
    if (!replId) {
      socket.disconnect();
      terminalManager.clear(socket.id);
      return;
    }

    socket.emit("loaded", {
      rootContent: await fetchDir("/workspace", ""),
    });

    initHandlers(socket, replId);
  });
}

function initHandlers(socket: Socket, replId: string) {
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("fetchDir", async (dir: string, callback) => {
    const dirPath = `/workspace/${dir}`;
    const contents = await fetchDir(dirPath, dir);
    callback(contents);
  });

  socket.on(
    "fetchContent",
    async ({ path: filePath }: { path: string }, callback) => {
      const fullPath = `/workspace/${filePath}`;
      const data = await fetchFileContent(fullPath);
      callback(data);
    }
  );

  socket.on(
    "updateContent",
    async ({ path: filePath, content }: { path: string; content: string }) => {
      const fullpath = `/workspace/${filePath}`;
      await saveFile(fullpath, content);
      await saveToS3(`code/${replId}`, filePath, content);
    }
  );

  socket.on("requestTerminal", async () => {
    terminalManager.createPty(socket.id, replId, (data: string, id: number) => {
      socket.emit("terminal", {
        data: Buffer.from(data, "utf-8"),
      });
    });
  });

  socket.on(
    "terminalData",
    async ({ data }: { data: string; terminalId: number }) => {
      terminalManager.write(socket.id, data);
    }
  );
}
