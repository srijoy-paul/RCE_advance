"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalManager = void 0;
const { fork, IPty } = require("node-pty");
const os = require("os");
const path = require("path");
const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
class TerminalManager {
    constructor() {
        this.sessions = {};
    }
    createPty(id, replId, onData) {
        let term = fork(shell, [], {
            name: "xterm-color",
            cols: 100,
            cwd: `/workspace`,
        });
        term.on("data", (data) => onData(data, term.pid));
        this.sessions[id] = {
            terminal: term,
            replId,
        };
        term.on("exit", () => {
            delete this.sessions[term.pid];
        });
        return term;
    }
    writePty(terminalId, data) {
        var _a;
        (_a = this.sessions[terminalId]) === null || _a === void 0 ? void 0 : _a.terminal.write(data);
    }
    clearPty(terminalId) {
        this.sessions[terminalId].terminal.kill();
        delete this.sessions[terminalId];
    }
}
exports.TerminalManager = TerminalManager;
