// controllers/uploadController.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { sendErrorResponse,sendSuccessResponse } from "../utils/helper.js";
import { fromIni } from "@aws-sdk/credential-providers";
import dotenv, { parse } from 'dotenv'
dotenv.config()



let awsOptions = { region: process.env.AWS_REGION }
if (process.env.STAGE != 'production') {
  awsOptions['credentials'] = fromIni({ profile: 'uade' })
  console.log("ACA:",awsOptions)
}
const s3 = new S3Client(awsOptions );


export const uploadImage = async (req, res) => {
    const { fileContent, fileType } = req.body;

    if (!fileContent || !fileType) {
        return sendErrorResponse({  res, message: "Missing fileContent or fileType", statusCode: 400 });
    }

    const fileName = `${uuidv4()}.${fileType.split('/')[1]}`;
    const base64Data = fileContent.replace(/^data:image\/\w+;base64,/, '');
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `uploads/${fileName}`,
        Body: Buffer.from(base64Data, 'base64'),
        ContentType: fileType,
    };

    try {
        const command = new PutObjectCommand(params);
        const data = await s3.send(command);
        const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${fileName}`;
        return sendSuccessResponse({ res, data: { imageUrl }, message: "File uploaded successfully", statusCode: 200 });
    } catch (error) {
        console.error('Error uploading file:', error);
        return sendErrorResponse({ res, error, message: 'Failed to upload file', statusCode: 500 });
    }
};