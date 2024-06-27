import { IPty } from "node-pty";

const { fork, IPty } = require("node-pty");
const os = require("os");
const path = require("path");

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

export class TerminalManager {
  private sessions: { [id: string]: { terminal: IPty; replId: string } } = {};

  createPty(
    id: string,
    replId: string,
    onData: (data: string, id: number) => void
  ) {
    let term = fork(shell, [], {
      name: "xterm-color",
      cols: 100,
      cwd: `/workspace`,
    });

    term.on("data", (data: string) => onData(data, term.pid));
    this.sessions[id] = {
      terminal: term,
      replId,
    };
    term.on("exit", () => {
      delete this.sessions[term.pid];
    });

    return term;
  }

  writePty(terminalId: string, data: string) {
    this.sessions[terminalId]?.terminal.write(data);
  }

  clearPty(terminalId: string) {
    this.sessions[terminalId].terminal.kill();
    delete this.sessions[terminalId];
  }
}
