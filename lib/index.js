"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const expectedFileExtensions = [".ts", ".tsx", ".js", ".css", ".scss"];
function getCurrentDirectoryPath() {
    var _a;
    const workingDirectory = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri.fsPath;
    if (!workingDirectory) {
        return null;
    }
    return path.dirname(workingDirectory);
}
function getFileDirectoryPath(imported) {
    const workingDirectory = getCurrentDirectoryPath();
    if (!workingDirectory) {
        return null;
    }
    return path.dirname(path.join(workingDirectory, imported.moduleName));
}
function getFileExtension(imported) {
    const targetDirectoryPath = getFileDirectoryPath(imported);
    if (!targetDirectoryPath) {
        return null;
    }
    const files = fs.readdirSync(targetDirectoryPath);
    const moduleFileName = path.basename(imported.moduleName);
    const matches = files.filter((file) => file.startsWith(moduleFileName))
        .filter((file) => expectedFileExtensions.includes(file.replace(moduleFileName, "")));
    if (!matches.length) {
        return null;
    }
    if (matches.length === 1) {
        return path.extname(matches[0]);
    }
    return null;
}
function default_1(styleApi, file) {
    const { and, hasDefaultMember, hasNamedMembers, hasNamespaceMember, hasNoMember, hasOnlyDefaultMember, hasOnlyNamedMembers, hasOnlyNamespaceMember, isAbsoluteModule, isRelativeModule, member, name, not, startsWithAlphanumeric, startsWithLowerCase, startsWithUpperCase, unicode, } = styleApi;
    function isTSXFile(imported) {
        return getFileExtension(imported) === ".tsx";
    }
    function isFromTenforce(imported) {
        return imported.moduleName.startsWith("@tenforce");
    }
    function isWithinPage(imported) {
        var _a, _b;
        const importDirs = (_a = getFileDirectoryPath(imported)) === null || _a === void 0 ? void 0 : _a.split(path.sep).reverse();
        const currentDirs = (_b = getCurrentDirectoryPath()) === null || _b === void 0 ? void 0 : _b.split(path.sep).reverse();
        if (!importDirs || !currentDirs) {
            return false;
        }
        while (true) {
            const dirImport = importDirs.pop();
            const dirCurrent = currentDirs.pop();
            if (dirImport === dirCurrent) {
                if (dirImport === "pages") {
                    return importDirs.pop() === currentDirs.pop();
                }
                continue;
            }
            return false;
        }
    }
    return [
        {
            match: and(isAbsoluteModule, hasOnlyNamespaceMember, not(isFromTenforce)),
            sort: member(unicode),
        },
        {
            match: and(isAbsoluteModule, hasOnlyDefaultMember, not(isFromTenforce)),
            sort: member(unicode),
        },
        { match: and(isAbsoluteModule, not(isFromTenforce)), sort: member(unicode) },
        { separator: true },
        { match: isFromTenforce, sort: member(unicode) },
        { separator: true },
        { match: and(isRelativeModule, not(isTSXFile), not(isWithinPage)), sort: member(unicode) },
        { separator: true },
        { match: and(isRelativeModule, not(isTSXFile)), sort: member(unicode) },
        { separator: true },
        { match: and(isRelativeModule, isTSXFile, not(isWithinPage)), sort: member(unicode) },
        { separator: true },
        { match: and(isRelativeModule, isTSXFile), sort: member(unicode) },
        { separator: true },
    ];
}
exports.default = default_1;
