export default class AwsCli {
    private readonly path;
    private constructor();
    static getOrInstall(): Promise<AwsCli>;
    static get(): Promise<AwsCli>;
    private static install;
    version(): Promise<string>;
    which(program: string): Promise<string>;
    call(args: string[], options?: unknown): Promise<number>;
    callStdout(args: string[], options?: unknown): Promise<string>;
}
