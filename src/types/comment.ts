export interface FigmaComment {
  id: string;
  file_key: string;
  parent_id: string;
  user: {
    id: string;
    handle: string;
    name: string;
  };
  message: string;
  created_at: string;
  resolved_at?: string;
  client_meta?: {
    x: number;
    y: number;
    node_id?: string;
  };
}

export interface ProcessedComment {
  id: string;
  author: string;
  message: string;
  timestamp: Date;
  isResolved: boolean;
  location?: {
    x: number;
    y: number;
    nodeId?: string;
  };
}
