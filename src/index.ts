#!/usr/bin/env node

import { FastMCP, imageContent, audioContent } from "fastmcp";
import { Client, ID, Storage } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { z } from "zod";
import mammoth from "mammoth";
import html2md from "html-to-md";
import * as xlsx from "xlsx";
import { parse as pptx2json } from "pptx2json-ts";
// @ts-expect-error no types provided
import xmindparser from "xmindparser";
import pdf2md from "@opendocsg/pdf2md";
import fs from "fs";
const xmindParser = new xmindparser();

const server = new FastMCP({
  name: "mcp-appwrite-filesystem",
  version: "1.0.1",
});

const endpoint = process.env.ENDPOINT || "";
const projectId = process.env.PROJECT_ID || "";
const apiKey = process.env.API_KEY || "";
const bucketId = process.env.BUCKET_ID || "";

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const storage = new Storage(client);

// Read a file from Appwrite Storage by fileId
server.addTool({
  name: "mcp-appwrite-filesystem_read",
  description: "Read a file from Appwrite Storage by fileId",
  parameters: z.object({
    fileId: z.string(),
  }),
  execute: async ({ fileId }) => {
    const fileMetadata = await storage.getFile(bucketId, fileId);
    const fileObject = await storage.getFileView(bucketId, fileId);

    // 1. image => image
    if (fileMetadata.mimeType.startsWith("image/")) {
      const imageFileObject = await storage.getFilePreview(
        bucketId,
        fileId,
        512,
        0,
        undefined,
        60
      );
      return imageContent({
        buffer: Buffer.from(imageFileObject),
      });
    }
    // 2. audio => audio
    else if (fileMetadata.mimeType.startsWith("audio/")) {
      return audioContent({
        buffer: Buffer.from(fileObject),
      });
    }
    // 3. plain text => plain text
    else if (
      fileMetadata.mimeType === "text/plain" ||
      fileMetadata.mimeType.startsWith("text/") ||
      fileMetadata.name.endsWith(".md")
    ) {
      return Buffer.from(fileObject).toString("utf-8");
    }
    // 4. word (doc/docx) => plain text(markdown)
    else if (
      fileMetadata.mimeType === "application/msword" ||
      fileMetadata.mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.convertToHtml({
        buffer: Buffer.from(fileObject),
      });
      // @ts-expect-error error types provided
      return html2md(result.value);
    }
    // 5. excel (xls/xlsx) => plain text(json)
    else if (
      fileMetadata.mimeType === "application/vnd.ms-excel" ||
      fileMetadata.mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const workbook = xlsx.read(fileObject, { type: "binary" });
      const sheetNames = workbook.SheetNames;
      const result: Record<string, any> = {};
      for (const sheetName of sheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        if (jsonData.length > 0) {
          result[sheetName] = jsonData;
        }
      }
      return JSON.stringify(result);
    }
    // 6. ppt (ppt/pptx) => plain text(json)
    else if (
      fileMetadata.mimeType === "application/vnd.ms-powerpoint" ||
      fileMetadata.mimeType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      const result = await pptx2json(Buffer.from(fileObject));
      return JSON.stringify(result);
    }
    // 7. pdf => plain text | image
    else if (fileMetadata.mimeType === "application/pdf") {
      // 1. text based pdf使用相关库直接转文本
      // @ts-expect-error error types provided
      const result = await pdf2md(fileObject);
      // 2. image based pdf
      if (result.replaceAll("\n", "").length === 0) {
        return "Please convert the pdf to a word document or image format first";
      }
      return JSON.stringify(result);
    }
    // 8. xmind => plain text(json)
    else if (
      fileMetadata.mimeType === "application/vnd.xmind.workbook" ||
      fileMetadata.name.endsWith(".xmind")
    ) {
      const result = await xmindParser.xmindToJSON(fileObject);
      return JSON.stringify(result);
    } else if (fileMetadata.mimeType.startsWith("")) {
      return "";
    } else {
      return "Unsupported file type";
    }
  },
});

server.addTool({
  name: "mcp-appwrite-filesystem_write_by_content",
  description: "Write a file to Appwrite Storage by content",
  parameters: z.object({
    filename: z.string(),
    content: z.string(),
  }),
  execute: async ({ filename, content }) => {
    const file = InputFile.fromPlainText(content, filename);
    const fileId = ID.unique();
    await storage.createFile(bucketId, fileId, file);
    return fileId;
  },
});

server.addTool({
  name: "mcp-appwrite-filesystem_write_by_path",
  description: "Write a file to Appwrite Storage by path",
  parameters: z.object({
    filename: z.string(),
    path: z.string(),
  }),
  execute: async ({ filename, path }) => {
    const file = InputFile.fromPath(path, filename);
    const fileId = ID.unique();
    await storage.createFile(bucketId, fileId, file);
    fs.unlinkSync(path);
    return fileId;
  },
});

server.addTool({
  name: "mcp-appwrite-filesystem_write_by_base64",
  description: "Write a file to Appwrite Storage by base64",
  parameters: z.object({
    filename: z.string(),
    data: z.string(),
  }),
  execute: async ({ filename, data }) => {
    const file = InputFile.fromBuffer(Buffer.from(data, "base64"), filename);
    const fileId = ID.unique();
    await storage.createFile(bucketId, fileId, file);
    return fileId;
  },
});

server.addTool({
  name: "mcp-appwrite-filesystem_delete",
  description: "Delete a file from Appwrite Storage",
  parameters: z.object({
    fileId: z.string(),
  }),
  execute: async ({ fileId }) => {
    await storage.deleteFile(bucketId, fileId);
    return "Deleted file successfully";
  },
});

server.addTool({
  name: "mcp-appwrite-filesystem_list",
  description: "List all files in Appwrite Storage",
  execute: async () => {
    const files = await storage.listFiles(bucketId);
    return JSON.stringify({
      total: files.total,
      ...files.files.map((file) => ({
        fileId: file.$id,
        name: file.name,
        signature: file.signature,
        size: file.sizeOriginal,
        mimeType: file.mimeType,
      })),
    });
  },
});

server.addTool({
  name: "mcp-appwrite-filesystem_get_file_metadata",
  description: "Get the metadata of a file in Appwrite Storage",
  parameters: z.object({
    fileId: z.string(),
  }),
  execute: async ({ fileId }) => {
    const fileMetadata = await storage.getFile(bucketId, fileId);
    return JSON.stringify({
      fileId,
      name: fileMetadata.name,
      signature: fileMetadata.signature,
      size: fileMetadata.sizeOriginal,
      mimeType: fileMetadata.mimeType,
    });
  },
});

server.start({
  transportType: "stdio",
});
