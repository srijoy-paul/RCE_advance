const express = require("express");
const fs = require("fs");
const yaml = require("yaml");
const cors = require("cors");
const { KubeConfig } = require("@kubernetes/client-node");

const app = express();
app.use(express.json());
app.use(cors());

const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();
