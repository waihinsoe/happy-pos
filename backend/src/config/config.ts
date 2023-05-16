interface Config {
  jwtSecret: string;
  spaceAccessKeyId: string;
  spaceSecretAccessKey: string;
  spaceEndPoint: string;
}
export const config: Config = {
  jwtSecret: process.env.JWT_SECRET || "",
  spaceAccessKeyId: process.env.SPACE_ACCESS_KEY_ID || "",
  spaceSecretAccessKey: process.env.SPACE_SECRET_ACCESS_KEY || "",
  spaceEndPoint: process.env.SPACE_ENDPOINT || "",
};
