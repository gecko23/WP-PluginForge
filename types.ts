export interface PluginFile {
  filename: string;
  content: string;
  type: 'php' | 'css' | 'js' | 'txt' | 'other';
}

export interface GeneratedPlugin {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  files: PluginFile[];
  createdAt: number;
}

export enum GeneratorStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface PluginRequest {
  name: string;
  description: string;
  features: string[];
}
