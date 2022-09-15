"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const expectedFileExtensions = ["", ".ts", ".tsx", ".js", ".css", ".scss"];
function getCurrentDirectoryPath(file) {
    return path.dirname(file);
}
function getImportedDirectoryPath(file, imported) {
    const workingDirectory = getCurrentDirectoryPath(file);
    if (!workingDirectory) {
        return null;
    }
    const resolved = path.join(workingDirectory, imported.moduleName);
    if (fs.existsSync(resolved) && fs.lstatSync(resolved).isDirectory()) {
        return resolved;
    }
    return path.dirname(resolved);
}
function getImportedExtension(file, imported) {
    const targetDirectoryPath = getImportedDirectoryPath(file, imported);
    if (!targetDirectoryPath) {
        return null;
    }
    const files = fs.readdirSync(targetDirectoryPath);
    const moduleFileName = path.basename(imported.moduleName);
    const matches = files.filter((match) => match.startsWith(moduleFileName))
        .filter((match) => expectedFileExtensions.includes(match.replace(moduleFileName, "")));
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
        return getImportedExtension(file, imported) === ".tsx";
    }
    function isFromTenforce(imported) {
        return imported.moduleName.startsWith("@tenforce");
    }
    function isWithinPage(imported) {
        var _a, _b;
        const importDirs = (_a = getImportedDirectoryPath(file, imported)) === null || _a === void 0 ? void 0 : _a.split(path.sep).reverse();
        const currentDirs = (_b = getCurrentDirectoryPath(file)) === null || _b === void 0 ? void 0 : _b.split(path.sep).reverse();
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
        { match: and(hasNoMember, isAbsoluteModule) },
        { separator: true },
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
        { match: and(not(hasNoMember), isFromTenforce), sort: member(unicode) },
        { separator: true },
        { match: and(hasNoMember, isRelativeModule, not(isTSXFile), not(isWithinPage)) },
        { match: and(isRelativeModule, not(isTSXFile), not(isWithinPage)), sort: member(unicode) },
        { separator: true },
        { match: and(hasNoMember, isRelativeModule, not(isTSXFile)) },
        { match: and(isRelativeModule, not(isTSXFile)), sort: member(unicode) },
        { separator: true },
        { match: and(isRelativeModule, isTSXFile, not(isWithinPage)), sort: member(unicode) },
        { separator: true },
        { match: and(isRelativeModule, isTSXFile), sort: member(unicode) },
        { separator: true },
    ];
}
exports.default = default_1;
