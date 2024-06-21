import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

function useSocket(replId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(`ws://${replId}.rce-runner.duckdns.org`);
  });
}
