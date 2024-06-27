import { AppsV1Api, CoreV1Api, NetworkingV1Api } from "@kubernetes/client-node";

const express = require("express");
const fs = require("fs");
const path = require("path");
const yaml = require("yaml");
const cors = require("cors");
const { KubeConfig } = require("@kubernetes/client-node");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();
const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);

const readAndParseKubeYaml = (filePath: string, replId: string): Array<any> => {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const docs = yaml.parseAllDocuments(fileContent).map((doc: any) => {
    let docString = doc.toString();
    const regex = new RegExp(`service_name`, "g");
    docString = docString.replace(regex, replId);
    console.log("docstring from orchestrator", docString);
    return yaml.parse(docString);
  });

  return docs;
};

app.post("/api/v1/start", async (req: any, res: any) => {
  const { replId } = req.body;
  const namespace = "default";
  console.log("from orchestrator service", replId);

  try {
    const kubeManifests = readAndParseKubeYaml(
      path.join(__dirname, "./service.yaml"),
      replId
    );
    for (const manifest of kubeManifests) {
      switch (manifest.kind) {
        case "Deployment":
          await appsV1Api.createNamespacedDeployment(namespace, manifest);
          break;
        case "Service":
          await coreV1Api.createNamespacedService(namespace, manifest);
          break;
        case "Ingress":
          await networkingV1Api.createNamespacedIngress(namespace, manifest);
          break;
        default:
          console.log(`Unsupported kind: ${manifest.kind}`);
      }
    }
    console.log("Resources created");

    res.status(200).send({ message: "Resources created successfully" });
  } catch (error: any) {
    console.error("failed to create resources", error.body);
    res.status(500).send({ message: "Failed to create resources" });
  }
});

const port = 3002;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
