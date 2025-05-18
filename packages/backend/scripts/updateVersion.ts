import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { VersionInfo, VERSION_INFO } from '../src/version.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function incrementVersion(version: string): string {
    // Increment the patch version by 1
    const versionArr = version.split('.');
    
    if (versionArr.length !== 3) {
        throw new Error(`Invalid version format: ${version}. Expected format is x.y.z`);
    }
    
    // Clean up the patch version by removing any suffix
    const patchWithSuffix = versionArr[2];
    let patch = 0;
    if (versionArr[2].includes('-')){
        patch = parseInt(patchWithSuffix.split('-')[0]);
    }
    else{
        patch = parseInt(patchWithSuffix);
    }
    
    const patchNumber = patch
    const major = parseInt(versionArr[0]);
    const minor = parseInt(versionArr[1]);
    
    if (isNaN(major) || isNaN(minor) || isNaN(patchNumber)) {
        throw new Error(`Invalid version numbers: ${version}. Expected format is x.y.z`);
    }
    
    const newPatch = patchNumber + 1;
    return `${major}.${minor}.${newPatch}`;
}

function getCurrentVersion(): string {
    // Read the current version from package.json
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
    return packageJson.version || '0.0.0';
}

function getGitCommitHash(): string {
    // Get the short hash of the current git commit
    try {
        return execSync('git rev-parse --short HEAD').toString().trim();
    } catch (error) {
        console.warn('Unable to get git commit hash:', error);
        return 'unknown';
    }
}

function generateVersionInfo(): VersionInfo {
    // Get the current version from package.json
    // Return the updated version info object
    const currentVersion = getCurrentVersion();
    const newVersion = incrementVersion(currentVersion);
    const buildTime = new Date().toISOString();
    
    const versionInfo: VersionInfo = {
        version: newVersion,
        gitCommit: getGitCommitHash(),
        buildTime: buildTime
    };

    return versionInfo;
}

function updateVersion() {
    const versionInfo = generateVersionInfo();
    const versionPath = path.join(__dirname, '..', 'src', 'version.ts');
    
    // Read existing file content
    const existingContent = fs.readFileSync(versionPath, 'utf-8');
    
    // Replace only the VERSION_INFO constant while preserving interface
    const updatedContent = existingContent.replace(
        /export const VERSION_INFO: VersionInfo = {[\s\S]*?};/m,
        `export const VERSION_INFO: VersionInfo = ${JSON.stringify(versionInfo, null, 2)};`
    );
    
    // Write back to file
    fs.writeFileSync(versionPath, updatedContent, 'utf-8');
    
    // Update package.json version
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.version = versionInfo.version;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    console.log(`Version updated to ${versionInfo.version}`);
}

updateVersion();