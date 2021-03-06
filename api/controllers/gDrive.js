import { google } from "googleapis";
import { PassThrough } from 'stream'
import dotenv from 'dotenv'
dotenv.config()

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
const drive = google.drive({
    version: 'v3',
    auth: oAuth2Client
})

const folderId = '1ZH6_mv_2a1Gn_dUnsLGdi8Dv9yGsDb5c';

export default {
    uploadFile: (req, res) => {
        try {
            const bufferStream = new PassThrough();
            var fileSize = req.file.size;

            bufferStream.end(req.file.buffer);
            const fileMetadata = {
                name: req.file.originalname,
                parents: [folderId]
            };
            const media = {
                mimeType: req.file.mimetype,
                body: bufferStream,
                resumable: true
            };
            drive.files.create(
                {
                    resource: fileMetadata,
                    media,
                    fields: "id",
                },
                {
                    maxRedirects: 0,
                    onUploadProgress: (evt) => {
                        const progress = (evt.bytesRead / fileSize) * 100;
                        console.log(`${Math.round(progress)}% complete`)
                    },

                },
            )
                .then((response) => {
                    //give public Permission
                    const fileId = response.data.id;
                    drive.permissions.create({
                        fileId,
                        requestBody: {
                            role: 'reader',
                            type: 'anyone'
                        }
                    })
                    return fileId;
                }).then((fileId) => {
                    //get public url
                    return drive.files.get({
                        fileId,
                        fields: 'webContentLink'
                    })
                }).then((response) => {
                    res.status(200).json({
                        link: response.data.webContentLink
                    })
                })
                .catch((error) => {
                    res.status(500).json({
                        error
                    })
                });
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },

    deleteFile: (fileId) => {
        try {
            drive.files.delete({
                fileId
            }).then((response) => {
                console.log(response.status)
                //should be 204 if succeeded
            })
        } catch (error) {
            console.log(error.message);
        }
    },

    createFolder: (folderName) => {
        var fileMetadata = {
            'name': folderName,
            'mimeType': 'application/vnd.google-apps.folder'
        };
        drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        }).then((response) => {
            res.status(200).json({
                folderID: response.data.id
            })
        });
    },

    getFolders: (req, res) => {
        const q = `mimeType = 'application/vnd.google-apps.folder'
                    and '${folderId}' in parents`;

        drive.files.list({ q }).then((response) => {
            res.json(response.data)
        })
    },
    checkFileSize: (req, res) => {
        console.log(req.body)
    }

}