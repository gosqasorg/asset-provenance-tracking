import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

function incrementVersion(version: string): string {
    // Increment the patch version by 1
    const versionArr = version.split('.');
    
    if (versionArr.length !== 3) throw new Error(`Invalid version format: ${version}. Expected format is x.y.z`);
    
    const [majorStr, minorStr, patchRaw] = versionArr;

    const major = parseInt(majorStr);
    const minor = parseInt(minorStr);
    // Strip off any non-digit suffix from the patch version
    const patch = parseInt(patchRaw.replace(/\D.*$/, ''));

    if ([major, minor, patch].some(isNaN)) {
        throw new Error(`Invalid version numbers in: ${version}`);
    }
    
    const newPatch = patch + 1;
    return `${major}.${minor}.${newPatch}`;
}

function getCurrentVersion(): string {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        throw new Error(`package.json not found at expected path: ${packageJsonPath}`);
    }
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version || '0.0.0';
}

function isAzureEnvironment(): boolean {
    // Check if we're in Azure production or staging environment
    return process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ||
           process.env.WEBSITE_SITE_NAME !== undefined || // Azure App Service
           process.env.FUNCTIONS_WORKER_RUNTIME !== undefined || // Azure Functions
           !fs.existsSync(path.resolve(process.cwd(), '.env')); // No .env file available
}

export function updateVersion(): { newVersion: string; buildDate: string; gitCommit: string } {
    const currentVersion = getCurrentVersion();
    const newVersion = incrementVersion(currentVersion);
    const buildDate = new Date().toISOString();
    const gitCommit = execSync('git rev-parse --short HEAD').toString().trim();

    // Update package.json - use the same path resolution as getCurrentVersion()
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    
    if (!isAzureEnvironment()) {
        const envPath = path.resolve(process.cwd(), '.env');
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
        
        // Update BUILD_VERSION, GIT_COMMIT and BUILD_DATE in .env
        const newEnvContent = envContent
          .replace(
            /BUILD_VERSION=.*/,
            `BUILD_VERSION=${newVersion}`
          )
          .replace(
            /GIT_COMMIT=.*/,
            `GIT_COMMIT=${gitCommit}`
          )
          .replace(
            /BUILD_DATE=.*/,
            `BUILD_DATE=${buildDate}`
          );
          
        // Add missing variables if they don't exist
        let finalEnv = newEnvContent;
        if (!finalEnv.includes('BUILD_VERSION=')) finalEnv += `\nBUILD_VERSION=${newVersion}`;
        if (!finalEnv.includes('GIT_COMMIT=')) finalEnv += `\nGIT_COMMIT=${gitCommit}`;
        if (!finalEnv.includes('BUILD_DATE=')) finalEnv += `\nBUILD_DATE=${buildDate}`;
        
        try {
            fs.writeFileSync(envPath, finalEnv.trim());
            console.log(`Updated .env with:\nBUILD_VERSION=${newVersion}\nGIT_COMMIT=${gitCommit}\nBUILD_DATE=${buildDate}`);
        } catch (error) {
            console.warn('Could not write to .env file (this is normal in production):', error);
        }
    } else {
        console.log(`Production environment detected. Set these in Azure Configuration:\nBUILD_VERSION=${newVersion}\nGIT_COMMIT=${gitCommit}\nBUILD_DATE=${buildDate}`);
        
        // Set process.env for the current build process
        process.env.BUILD_VERSION = newVersion;
        process.env.GIT_COMMIT = gitCommit;
        process.env.BUILD_DATE = buildDate;
    }
    return { newVersion, buildDate, gitCommit };
}

if (process.argv[1] && (process.argv[1].endsWith('updateVersion.ts') || process.argv[1].endsWith('updateVersion.js'))) {
    updateVersion();
}