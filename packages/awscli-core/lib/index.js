"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("@actions/core");
var exec = require("@actions/exec");
var io = require("@actions/io");
var tc = require("@actions/tool-cache");
var process = require("process");
var AwsCli = /** @class */ (function () {
    function AwsCli(exePath) {
        this.path = exePath;
    }
    AwsCli.getOrInstall = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, AwsCli.get()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        core.debug("Unable to find \"awscli\" executable, installing it now. Reason: ".concat(error_1));
                        return [4 /*yield*/, AwsCli.install()];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Will throw an error if `aws` is not installed.
    AwsCli.get = function () {
        return __awaiter(this, void 0, void 0, function () {
            var exePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(process.platform === 'win32')) return [3 /*break*/, 2];
                        // Comes on windows runner provided by GitHub so remove
                        return [4 /*yield*/, exec.exec('rmdir', ['/Q', '/S', '"C:/Program Files/Amazon"'])];
                    case 1:
                        // Comes on windows runner provided by GitHub so remove
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, io.which('aws', true)];
                    case 3:
                        exePath = _a.sent();
                        return [2 /*return*/, new AwsCli(exePath)];
                }
            });
        });
    };
    AwsCli.install = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, AwsCliPath, AwsCliExtractedDir, AwsCliMsiPath;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = process.platform;
                        switch (_a) {
                            case 'darwin': return [3 /*break*/, 1];
                            case 'linux': return [3 /*break*/, 1];
                            case 'win32': return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, tc.downloadTool('https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip')];
                    case 2:
                        AwsCliPath = _b.sent();
                        return [4 /*yield*/, tc.extractZip(AwsCliPath)];
                    case 3:
                        AwsCliExtractedDir = _b.sent();
                        core.addPath(AwsCliExtractedDir + '/aws/dist');
                        return [3 /*break*/, 8];
                    case 4: return [4 /*yield*/, tc.downloadTool('https://awscli.amazonaws.com/AWSCLIV2.msi')];
                    case 5:
                        AwsCliMsiPath = _b.sent();
                        return [4 /*yield*/, exec.exec('msiexec.exe', ['/i', AwsCliMsiPath, '/quiet'])];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7: throw new Error("Unknown platform ".concat(process.platform, ", can't install awscli"));
                    case 8: 
                    // Assuming it is in the $PATH already
                    return [2 /*return*/, new AwsCli('aws')];
                }
            });
        });
    };
    AwsCli.prototype.version = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.callStdout(['--version'])];
                    case 1:
                        stdout = _a.sent();
                        return [2 /*return*/, stdout.split(' ')[1]];
                }
            });
        });
    };
    // awscli which `program`
    AwsCli.prototype.which = function (program) {
        return __awaiter(this, void 0, void 0, function () {
            var stdout;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.callStdout(['which', program])];
                    case 1:
                        stdout = _a.sent();
                        if (stdout) {
                            return [2 /*return*/, stdout];
                        }
                        else {
                            throw new Error("Unable to find the ".concat(program));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AwsCli.prototype.call = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, exec.exec(this.path, args, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Call the `awscli` and return stdout
    AwsCli.prototype.callStdout = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, resOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stdout = '';
                        resOptions = Object.assign({}, options, {
                            listeners: {
                                stdout: function (buffer) {
                                    stdout += buffer.toString();
                                },
                            },
                        });
                        return [4 /*yield*/, this.call(args, resOptions)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, stdout];
                }
            });
        });
    };
    return AwsCli;
}());
exports.default = AwsCli;
