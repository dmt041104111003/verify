export interface Certificate {
  policyId: string;
  assetName: string;
  courseTitle: string;
  metadata: {
    [key: string]: any;
  };
  mintTransaction: {
    [key: string]: any;
  };
}

export interface ApiResponse {
  success: boolean;
  policyId?: string;
  assetName?: string;
  courseTitle?: string;
  metadata?: {
    [key: string]: any;
  };
  mintTransaction?: {
    [key: string]: any;
  };
  error?: string;
}
