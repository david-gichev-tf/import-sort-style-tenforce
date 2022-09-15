import * as fs from "fs";
import * as path from "path";

import { IImport } from "import-sort-parser";
import {IStyleAPI, IStyleItem} from "import-sort-style";
import * as vscode from 'vscode';

const expectedFileExtensions = [".ts", ".tsx", ".js", ".css", ".scss"]

function getCurrentDirectoryPath(): string | null {
  const workingDirectory = vscode.window.activeTextEditor?.document.uri.fsPath
  if(!workingDirectory) {
    return null
  }
  return path.dirname(workingDirectory)
}

function getFileDirectoryPath(imported: IImport): (string | null) {
  const workingDirectory = getCurrentDirectoryPath()
  if(!workingDirectory) {
    return null
  }
  return path.dirname(path.join(workingDirectory, imported.moduleName))
}

function getFileExtension(imported: IImport): (string | null) {
  const targetDirectoryPath = getFileDirectoryPath(imported)
  if(!targetDirectoryPath) {
    return null
  }
  const files = fs.readdirSync(targetDirectoryPath)
  const moduleFileName = path.basename(imported.moduleName)
  const matches = files.filter((file) => file.startsWith(moduleFileName))
                       .filter((file) => expectedFileExtensions.includes(file.replace(moduleFileName, "")));

  if(!matches.length) {
    return null
  }

  if(matches.length === 1) {
    return path.extname(matches[0])
  }

  return null
}

export default function(styleApi: IStyleAPI, file: string): IStyleItem[] {
  const {
    and,
    hasDefaultMember,
    hasNamedMembers,
    hasNamespaceMember,
    hasNoMember,
    hasOnlyDefaultMember,
    hasOnlyNamedMembers,
    hasOnlyNamespaceMember,
    isAbsoluteModule,
    isRelativeModule,
    member,
    name,
    not,
    startsWithAlphanumeric,
    startsWithLowerCase,
    startsWithUpperCase,
    unicode,
  } = styleApi;

  function isTSXFile(imported: IImport) {
    return getFileExtension(imported) === ".tsx"
  }

  function isFromTenforce(imported: IImport) {
    return imported.moduleName.startsWith("@tenforce")
  }

  function isWithinPage(imported: IImport) {
    const importDirs = getFileDirectoryPath(imported)?.split(path.sep).reverse()
    const currentDirs = getCurrentDirectoryPath()?.split(path.sep).reverse()
    if(!importDirs || !currentDirs) {
      return false
    }
    while(true) {
      const dirImport = importDirs.pop()
      const dirCurrent = currentDirs.pop()
      if(dirImport === dirCurrent) {
        if(dirImport === "pages") {
          return importDirs.pop() === currentDirs.pop()
        }
        continue
      }
      return false
    }
  }

  return [
    {
      match: and(
          isAbsoluteModule,
          hasOnlyNamespaceMember,
          not(isFromTenforce),
      ),
      sort: member(unicode),
    },
    {
      match: and(
          isAbsoluteModule,
          hasOnlyDefaultMember,
          not(isFromTenforce),
      ),
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
