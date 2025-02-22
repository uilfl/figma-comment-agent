export enum ExportFormat {
  CSV = "csv",
  JSON = "json",
  TXT = "txt",
}

export interface ExportOptions {
  format: ExportFormat;
  outputPath: string;
  includeMetadata?: boolean;
  dateFormat?: string;
}

export interface ExportResult {
  success: boolean;
  filePath: string;
  error?: string;
}
