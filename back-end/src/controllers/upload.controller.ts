import { UploadService } from "@/services/upload.service";
import { NextFunction, Request, Response } from "express";
import fs, { statSync } from 'fs';
import path from 'path';
import { BaseController } from "./base.controller";
import busboy from 'busboy';

const UPLOAD_FOLDER = path.join(process.cwd(), "uploads")
const ASSET_PATH = path.join(process.cwd(), "src", "assets")

interface UploadState {
    filename: string;
    totalChunks: number;
    uploadedChunks: number[];
    failedChunks: number[];
}

interface UploadSession {
  id: string;
  filename: string;
  filePath: string;
  writeable: fs.WriteStream | null;
  isPaused: boolean;
  uploadedBytes: number;
  totalBytes?: number;
  uploadedChunks: number[];
  failedChunks: number[];   
  totalChunks: number;
}

export class UploadController extends BaseController {
    private uploadSessions: Map<string, UploadSession> = new Map();
    constructor(private uploadService: UploadService) {
        super()
    }

    uploadFileLarge = (req: Request, res: Response, next: NextFunction) => {
        // console.log("helo")
        // req.busboy.on('field', (name, val, info) => {
        //     console.log(`Field: ${name}=${val}`);
        // });
        // req.busboy.on('file', (fieldname, uploadingFile, fileInfo) => {
        //     console.log(`Saving ${fileInfo.filename}`);
        //     const targetPath = path.join(UPLOAD_FOLDER, fileInfo.filename);
        //     console.log(`Target path: ${targetPath}`);

        //     const fileStream = fs.createWriteStream(targetPath);
        //     fileStream.on('error', (err) => {
        //         console.error(`Error saving file ${fileInfo.filename}:`, err);
        //         res.status(500).send('Error saving file');
        //     });

        //     uploadingFile.pipe(fileStream);
        //     fileStream.on('close', () => {
        //         console.log(`Completed upload ${fileInfo.filename}`);
        //         res.status(200).send('File uploaded successfully'); // Gửi response khi file lưu xong
        //     });
        // });
        // req.busboy.on('error', (err) => {
        //     console.error(`Busboy error: ${err}`);
        //     res.status(500).send('Error processing upload');
        // });

        // req.busboy.on('finish', () => {
        //     console.log('Busboy finished processing');
        //     res.status(200).send('No file uploaded');
        // });
        // req.pipe(req.busboy);
    }

    uploadFileLarge1 = (req: Request, res: Response, next: NextFunction) => {
        this.handleRequest(req, res, next, async () => {
           
        })
    }

    getVideo = (req: Request, res: Response, next: NextFunction) => {
        // this.handleRequest(req, res, next, async () => {
        const id = req.query.id
        console.log(ASSET_PATH)
        const chunkSize = 500 * 1e3
        const filePath = path.join(ASSET_PATH, "video-music.mp4")
        const range = req.headers.range || "0"
        const videoSize = statSync(filePath).size

        const start = Number(range.replace(/\D/g, ""))
        const end = Math.min(start + chunkSize, videoSize - 1)
        const contentLength = end - start + 1;

        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
            "Transfer-Encoding": "chunked",
        }

        res.writeHead(206, headers)
        const fileStream = fs.createReadStream(filePath, { start, end })
        fileStream.pipe(res)
        // })
    }

    getAudio = (req: Request, res: Response, next: NextFunction) => {
        const id = req.query.id
        const chunkSize = 500 * 1e3
        const filePath = path.join(ASSET_PATH, "video-music.mp3")
        const range = req.headers.range || "0"
        const audioSize = statSync(filePath).size

        const start = Number(range.replace(/\D/g, ""))
        const end = Math.min(start + chunkSize, audioSize - 1)
        const contentLength = end - start + 1;

        const headers = {
            "Content-Range": `bytes ${start}-${end}/${audioSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "audio/mpeg",
            "Transfer-Encoding": "chunked",
        }

        res.writeHead(206, headers)
        const fileStream = fs.createReadStream(filePath, { start, end })
        fileStream.pipe(res)
    }

    uploadTrunkFile = (req: Request, res: Response, next: NextFunction) => {
        this.handleRequest(req, res, next, async () => {
            return new Promise((res,rej) => {
                const sessionId = req.headers['session-id'] as string || this.generateSessionId()
                const bb = busboy({
                    headers: req.headers
                })
                let currentSession: UploadSession;
                if (this.uploadSessions.has(sessionId)) {
                    currentSession = this.uploadSessions.get(sessionId)!;
                } else {
                    currentSession = {
                        id: sessionId,
                        filename: '',
                        filePath: '',
                        writeable: null,
                        isPaused: false,
                        uploadedBytes: 0,
                        uploadedChunks: [],
                        failedChunks: [],
                        totalChunks: 0,
                    };
                    this.uploadSessions.set(sessionId, currentSession);
                }
                bb.on("field", (fieldname, val) => {
                    switch (fieldname) {
                        case 'filename':
                            currentSession.filename = val;
                            break;
                        case 'totalChunks':
                            currentSession.totalChunks = parseInt(val);
                            break;
                        case 'currentChunk':
                            currentSession.uploadedChunks.push(parseInt(val));
                            break;
                        case 'failedChunks':
                            currentSession.failedChunks.push(parseInt(val));
                            break;
                    }
                });
                
                bb.on("file",(name,stream,info) => {
                    if (currentSession.isPaused) {
                        console.log(`Upload session ${sessionId} is paused, skipping file processing`);
                        return;
                    }
                    const filename = `${Date.now()}-${info.filename || 'unknown'}`;
                    if (!currentSession.writeable) {
                        const filePath = path.join(UPLOAD_FOLDER, filename);
                        // const writeable = fs.createWriteStream(filePath);
                        currentSession.filePath = filePath;
                        currentSession.writeable = fs.createWriteStream(currentSession.filePath, {
                            flags: 'a' 
                        });
                    }
                    const writeable = currentSession.writeable;
                    // Create a unique filename using timestamp and original filename
                    stream.on("data", (chunk) => {
                        // writeable.write(chunk);
                        if (currentSession.isPaused) {
                            stream.pause(); // Tạm dừng read stream
                            console.log(`Stream paused for session ${sessionId}`);
                        } else {
                            writeable.write(chunk);
                            currentSession.uploadedBytes += chunk.length;
                        }
                    });
                    
                    stream.on("end", () => {
                        if (!currentSession.isPaused) {
                            console.log(`File chunk for session ${sessionId} processed`);
                        }
                    });
                    
                    writeable.on("error", (err) => {
                        console.error(`Error saving file ${filename}:`, err);
                        rej('Error saving file');
                    });
                })
                bb.on("close", () => {
                    if (!currentSession.isPaused) {
                        if (currentSession.writeable) {
                        currentSession.writeable.end();
                        }
                        this.uploadSessions.delete(sessionId); // Cleanup session
                        console.log(`Upload completed for session ${sessionId}`);
                        res({
                        message: "uploadTrunkFile completed",
                        sessionId: sessionId,
                        uploadedBytes: currentSession.uploadedBytes
                        });
                    } else {
                        console.log(`Upload paused for session ${sessionId}`);
                        res({
                        message: "uploadTrunkFile paused",
                        sessionId: sessionId,
                        uploadedBytes: currentSession.uploadedBytes,
                        status: "paused"
                        });
                    }
                })
                req.pipe(bb)
            })
        })
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    pauseUpload = (req: Request, res: Response, next: NextFunction) => {
        this.handleRequest(req, res, next, async () => {
            const sessionId = req.params.sessionId;
            const session = this.uploadSessions.get(sessionId);

            if (!session) {
                throw new Error('Upload session not found');
            }

            session.isPaused = true;
            console.log(`Upload session ${sessionId} paused`);

            return {
                message: "Upload paused",
                sessionId: sessionId,
                uploadedBytes: session.uploadedBytes
            };
        });
    }

    resumeUpload = (req: Request, res: Response, next: NextFunction) => {
        this.handleRequest(req, res, next, async () => {
        const sessionId = req.params.sessionId;
        const session = this.uploadSessions.get(sessionId);

        if (!session) {
            throw new Error('Upload session not found');
        }

        session.isPaused = false;
        console.log(`Upload session ${sessionId} resumed`);

        // Ở đây bạn cần tiếp tục stream từ client
        // Thường client sẽ gửi lại request upload với range header

        return {
            message: "Upload resumed",
            sessionId: sessionId,
            uploadedBytes: session.uploadedBytes
        };
        });
    }

}