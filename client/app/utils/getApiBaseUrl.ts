const getApiBaseUrl = async (apiUrlFromEnv: string | undefined): Promise<string> => {
  // 1. Try the URL from the environment variable first
  if (apiUrlFromEnv) {
    try {
      const response = await fetch(`${apiUrlFromEnv}/health`);
      if (response.ok) {
        console.log(`Backend found at ${apiUrlFromEnv}`);
        return apiUrlFromEnv;
      }
    } catch (error) {
      console.error(`Failed to connect to backend at ${apiUrlFromEnv}.`, error);
    }
  }

  // 2. If the environment variable URL fails or is not defined, try auto-detection
  if (typeof window !== "undefined") {
    const autoDetectedUrl = `${window.location.protocol}//${window.location.hostname}:8000`;
    try {
      const response = await fetch(`${autoDetectedUrl}/health`);
      if (response.ok) {
        console.log(`Backend found at ${autoDetectedUrl}`);
        return autoDetectedUrl;
      }
    } catch (error) {
      console.error(`Failed to connect to backend at ${autoDetectedUrl}.`, error);
    }
  }

  // 3. If both fail, fall back to localhost
  const fallbackUrl = "http://localhost:8000";
  console.log(`Falling back to ${fallbackUrl}`);
  return fallbackUrl;
};

export default getApiBaseUrl;
