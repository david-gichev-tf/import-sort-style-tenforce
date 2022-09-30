import * as fs from "fs";
import * as path from "path";

import { IImport } from "import-sort-parser";
import {IStyleAPI, IStyleItem} from "import-sort-style";

const expectedFileExtensions = ["", ".ts", ".tsx", ".js", ".css", ".scss"]

function getCurrentDirectoryPath(file: string): string | null {
  return path.dirname(file)
}

function getImportedDirectoryPath(file: string, imported: IImport): (string | null) {
  const workingDirectory = getCurrentDirectoryPath(file)
  if(!workingDirectory) {
    return null
  }
  const resolved = path.join(workingDirectory, imported.moduleName)
  if(fs.existsSync(resolved) && fs.lstatSync(resolved).isDirectory()) {
    return resolved
  }
  return path.dirname(resolved)
}

function getImportedExtension(file: string, imported: IImport): (string | null) {
  const targetDirectoryPath = getImportedDirectoryPath(file, imported)
  if(!targetDirectoryPath) {
    return null
  }
  const files = fs.readdirSync(targetDirectoryPath)
  const moduleFileName = path.basename(imported.moduleName)
  const matches = files.filter((match) => match.startsWith(moduleFileName))
                       .filter((match) => expectedFileExtensions.includes(match.replace(moduleFileName, "")));

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
    return getImportedExtension(file, imported) === ".tsx"
  }

  function isFromTenforce(imported: IImport) {
    return imported.moduleName.startsWith("@tenforce")
  }

  function isWithinPage(imported: IImport) {
    const importDirs = getImportedDirectoryPath(file, imported)?.split(path.sep).reverse()
    const currentDirs = getCurrentDirectoryPath(file)?.split(path.sep).reverse()
    if(!importDirs || !currentDirs) {
      return false
    }
    while(importDirs.length && currentDirs.length) {
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
    return false
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
