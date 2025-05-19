# MCP-Appwrite-Filesystem

A Model Context Protocol (MCP) server based on Appwrite Storage, providing file storage and processing capabilities for AI agents.

## Introduction

MCP-Appwrite-Filesystem is a tool that exposes Appwrite Storage functionality through the Model Context Protocol. It allows AI assistants to programmatically read and write files, while supporting the processing of various file formats, including images, audio, text documents, Excel spreadsheets, PowerPoint presentations, PDFs, and mind maps.

## Tool List

| Tool Name                                  | Description                                   | Parameters                                           |
| ------------------------------------------ | --------------------------------------------- | ---------------------------------------------------- |
| `mcp-appwrite-filesystem_read`                | Read file from Appwrite Storage by fileId     | `fileId`: The ID of the file to read                 |
| `mcp-appwrite-filesystem_write_by_content`    | Write file to Appwrite Storage by content     | `filename`: File name<br>`content`: File content     |
| `mcp-appwrite-filesystem_write_by_path`       | Write file to Appwrite Storage by path        | `filename`: File name<br>`path`: File path           |
| `mcp-appwrite-filesystem_write_by_base64`     | Write file to Appwrite Storage by base64      | `filename`: File name<br>`data`: Base64 encoded data |
| `mcp-appwrite-filesystem_delete`              | Delete a file from Appwrite Storage           | `fileId`: The ID of the file to delete               |
| `mcp-appwrite-filesystem_list`                | List all files in Appwrite Storage            | No parameters                                         |
| `mcp-appwrite-filesystem_get_file_metadata`   | Get the metadata of a file in Appwrite Storage| `fileId`: The ID of the file to get metadata for     |

## Supported File Formats

- Images - Returned as image content
- Audio - Returned as audio content
- Plain text and markdown - Returned as text
- Word documents (doc/docx) - Converted to markdown text
- Excel spreadsheets (xls/xlsx) - Converted to JSON
- PowerPoint presentations (ppt/pptx) - Converted to JSON
- PDF documents - Converted to text (text-based PDFs only)
- XMind mind maps - Converted to JSON

## Usage

```json
{
  "mcpServers": {
    "mcp-appwrite-filesystem": {
      "command": "npx",
      "args": ["-y", "@humansean/mcp-appwrite-filesystem"],
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
