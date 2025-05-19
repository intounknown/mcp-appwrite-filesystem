# MCP-Appwrite-Storage

A Model Context Protocol (MCP) server based on Appwrite Storage, providing file storage and processing capabilities for AI agents.

## Introduction

MCP-Appwrite-Storage is a tool that exposes Appwrite Storage functionality through the Model Context Protocol. It allows AI assistants to programmatically read and write files, while supporting the processing of various file formats, including images, audio, text documents, Excel spreadsheets, PowerPoint presentations, PDFs, and mind maps.

## Tool List

| Tool Name                               | Description                               | Parameters                                           |
| --------------------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| `mcp-appwrite-storage_read`             | Read file from Appwrite Storage by fileId | `fileId`: The ID of the file to read                 |
| `mcp-appwrite-storage_write_by_content` | Write file to Appwrite Storage by content | `filename`: File name<br>`content`: File content     |
| `mcp-appwrite-storage_write_by_path`    | Write file to Appwrite Storage by path    | `filename`: File name<br>`path`: File path           |
| `mcp-appwrite-storage_write_by_base64`  | Write file to Appwrite Storage by base64  | `filename`: File name<br>`data`: Base64 encoded data |

## Usage

```json
{
  "mcpServers": {
    "mcp-appwrite-storage": {
      "command": "npx",
      "args": ["-y", "@humansean/mcp-appwrite-storage"],
      "env": {
        "ENDPOINT": "YOUR_APPWRITE_ENDPOINT",
        "PROJECT_ID": "YOUR_APPWRITE_PROJECT_ID",
        "API_KEY": "YOUR_APPWRITE_API_KEY",
        "BUCKET_ID": "YOUR_APPWRITE_STORAGE_BUCKET_ID"
      }
    }
  }
}
```

## License

Apache-2.0 license
