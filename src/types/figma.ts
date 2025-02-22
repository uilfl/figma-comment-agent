export interface FigmaComment {
  id: string;
  message: string;
  created_at: string;
  resolved_at?: string;
  user: {
    id: string;
    handle: string;
    name: string;
  };
  client_meta?: {
    x: number;
    y: number;
    node_id?: string;
  };
}

export class FigmaApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "FigmaApiError";
  }
}

export interface FigmaApiResponse<T> {
  status: number;
  data: T;
}
