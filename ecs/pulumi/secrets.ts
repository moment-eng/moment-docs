type Env = {
  name: string;
  value: string;
};

const secretsToEnv = (secrets: { [s: string]: string }): Env[] => {
  const results: Env[] = [];

  Object.entries(secrets).forEach(([k, v]) => {
    results.push({ name: k, value: v });
  });

  return results;
};

const fetchEnvTokens = (keys: string[]): Env[] => {
  const results: Env[] = [];

  keys.forEach((k) => {
    const value = process.env[k];
    if (!value) {
      throw new Error(`Missing ${k} environment variable`);
    }

    results.push({ name: k, value: value });
  });

  return results;
};

export { fetchEnvTokens, secretsToEnv, Env };
