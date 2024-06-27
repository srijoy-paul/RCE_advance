"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyS3Folder = copyS3Folder;
exports.fetchS3Folder = fetchS3Folder;
const path = require("path");
const fs = require("fs");
const { S3 } = require("aws-sdk");
const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT,
});
function copyS3Folder(sourcePrefix, destinationPrefix, continuationToken) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            console.log("inside copys3foler method");
            const listParams = {
                Bucket: (_a = process.env.S3_BUCKET) !== null && _a !== void 0 ? _a : "",
                Prefix: sourcePrefix,
                continuationToken: continuationToken,
            };
            const allObjects = yield s3.listObjectsV2(listParams).promise();
            console.log("Copys3foler all objects", allObjects);
            if (!allObjects.Contents || allObjects.Contents.length === 0)
                return;
            yield Promise.all(allObjects.Contents.map((object) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (!object.Key)
                    return;
                let destinationKey = object.Key.replace(sourcePrefix, destinationPrefix);
                let copyParams = {
                    Bucket: (_a = process.env.S3_BUCKET) !== null && _a !== void 0 ? _a : "",
                    CopySource: `${process.env.S3_BUCKET}/${object.Key}`,
                    Key: destinationKey,
                };
                yield s3.copyObject(copyParams).promise();
                console.log(`Copied ${object.Key} to ${destinationKey}`);
            })));
        }
        catch (error) {
            console.log("Error copying folder: ", error);
        }
    });
}
function fetchS3Folder(key, localPath) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const params = {
                Bucket: (_a = process.env.S3_BUCKET) !== null && _a !== void 0 ? _a : "",
                Prefix: key,
            };
            console.log("current folder content fetch params", params);
            const response = yield s3.listObjectsV2(params).promise();
            console.log("fetch response", response);
            if (response.Contents) {
                yield Promise.all(response.Contents.map((file) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const fileKey = file.Key;
                    if (fileKey) {
                        const getObjectParams = {
                            Bucket: (_a = process.env.S3_BUCKET) !== null && _a !== void 0 ? _a : "",
                            Key: fileKey,
                        };
                        const data = yield s3.getObject(getObjectParams).promise();
                        console.log("fetched object data", data);
                        if (data.Body) {
                            const fileData = data.Body;
                            // console.log(fileData);
                            const filePath = `${localPath}${fileKey.replace(key, "")}`;
                            console.log("local filepath from aws.ts", filePath);
                            console.log("-->before write file");
                            yield writeFile(filePath, fileData);
                            console.log("-->after write file");
                            console.log(`Downloaded ${fileKey} to ${filePath}`);
                        }
                    }
                })));
            }
        }
        catch (error) {
            console.log("Error occured while fetching the folder", error);
        }
    });
}
function writeFile(filePath, fileData) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        yield createFolder(path.dirname(filePath));
        fs.writeFile(filePath, fileData, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    }));
}
function createFolder(dirName) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        fs.mkdir(dirName, { recursive: true }, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    }));
}
