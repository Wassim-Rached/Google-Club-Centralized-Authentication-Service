export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  dependencies: {
    [key: string]: {
      status: "healthy" | "unhealthy";
      code: number;
      body?: any;
      error?: string;
    };
  };
}
