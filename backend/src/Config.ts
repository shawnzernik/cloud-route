import { LogLevels } from "./tre/Logger";

export class Config {
    public static appName = Config.setString(process.env.APP_NAME, "TS React Express");
    public static appVersion = Config.setString(process.env.APP_VERSION, "0.0.2");
    public static appCopyright = Config.setString(process.env.APP_COPYRIGHT, "© Copyright 2024 Shawn Zernik");
    public static appUrl = Config.setString(process.env.APP_URL, "https://localhost:4433");
    public static dbHost = Config.setString(process.env.DB_HOST, "localhost");
    public static dbName = Config.setString(process.env.DB_NAME, "ts-react-express");
    public static dbPassword = Config.setString(process.env.DB_PASSWORD, "postgres");
    public static dbPort = Config.setInt(process.env.DB_PORT, "5432");
    public static dbUsername = Config.setString(process.env.DB_USERNAME, "postgres");
    public static httpsCertPath = Config.setString(process.env.HTTPS_CERT_PATH, "./server.cert");
    public static httpsDefaultPage = Config.setString(process.env.HTTPS_DEFAULT_PAGE, "/static/tre/pages/login.html");
    public static httpsKeyPath = Config.setString(process.env.HTTPS_CERT_KEY, "./server.key");
    public static httpsLimit = Config.setString(process.env.HTTPS_LIMIT, "1024mb");
    public static httpsPort = Config.setInt(process.env.HTTPS_PORT, "4433");
    public static javascriptDirectory = Config.setString(process.env.JAVASCRIPT_DIR, "../frontend/scripts");
    public static jestTimeoutSeconds = Config.setInt(process.env.JEST_TIMEOUT_SECONDS, "300");
    public static jwtPrivateKeyFile = Config.setString(process.env.JWT_PRIVATE_KEY_FILE, "./private.key");
    public static jwtPublicKeyFile = Config.setString(process.env.JWT_PUBLIC_KEY_FILE, "./public.key");
    public static logIndent = Config.setInt(process.env.LOG_INDENT, "0");
    public static logLevel = Config.setString(process.env.LOG_LEVEL, "trace") as LogLevels;
    public static staticDirectory = Config.setString(process.env.STATIC_DIR, "../frontend/static");
    public static tempDirectory = Config.setString(process.env.TEMP_DIRECTORY, "../temp");

    // DO NOT CHANGE THESE FUNCTIONS
    private static setInt(env: string | undefined, dev: string): number {
        return env ? Number.parseInt(env) : Number.parseInt(dev);
    }
    private static setString(env: string | undefined, dev: string): string {
        return env || dev;
    }
    private static setFloat(env: string | undefined, dev: string): number {
        return env ? Number.parseFloat(env) : Number.parseFloat(dev);
    }
}