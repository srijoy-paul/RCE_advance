const { S3 } = require("aws-sdk");
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
});

export async function copyS3Folder(
  sourcePrefix: string,
  destinationPrefix: string,
  continuationToken?: string
): Promise<void> {
  try {
    console.log("inside copys3foler method");

    const listParams = {
      Bucket: process.env.S3_BUCKET ?? "",
      Prefix: sourcePrefix,
      continuationToken: continuationToken,
    };

    const allObjects = await s3.listObjectsV2(listParams).promise();
    console.log("Copys3foler all objects", allObjects);

    if (!allObjects.Contents || allObjects.Contents.length === 0) return;

    await Promise.all(
      allObjects.Contents.map(async (object: any) => {
        if (!object.Key) return;

        let destinationKey = object.Key.replace(
          sourcePrefix,
          destinationPrefix
        );

        let copyParams = {
          Bucket: process.env.S3_BUCKET ?? "",
          CopySource: `${process.env.S3_BUCKET}/${object.Key}`,
          Key: destinationKey,
        };

        await s3.copyObject(copyParams).promise();
        console.log(`Copied ${object.Key} to ${destinationKey}`);
      })
    );
  } catch (error) {
    console.log("Error copying folder: ", error);
  }
}
