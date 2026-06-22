const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workspaceDir = __dirname;
const stagingDir = path.join(workspaceDir, 'AcademixIQ_Staging');
const zipFile = path.join(workspaceDir, 'AcademixIQ_Submission_Package.zip');

console.log('========================================================');
console.log('      AcademixIQ Submission Package Builder (Windows)   ');
console.log('========================================================\n');

try {
  // 1. Clean up old runs
  if (fs.existsSync(stagingDir)) {
    console.log('[-] Cleaning old staging directory...');
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  if (fs.existsSync(zipFile)) {
    console.log('[-] Cleaning old ZIP package...');
    fs.rmSync(zipFile, { force: true });
  }

  // 2. Create staging directory
  console.log('[+] Creating staging area: ./AcademixIQ_Staging');
  fs.mkdirSync(stagingDir, { recursive: true });

  // 3. Define copying logic with strict inclusions for root and exclusions for nested
  const allowedRootItems = [
    'backend',
    'frontend',
    'TECHNICAL_DOCUMENTATION.pdf',
    'TECHNICAL_DOCUMENTATION.md',
    'AcademixIQ_Pitch_Deck.pptx',
    'DEMO_VIDEO_LINK.txt',
    'README.md'
  ];

  const excludePatterns = [
    'node_modules',
    'dist',
    '.git',
    '.env',
    '.gemini',
    'temp'
  ];

  function shouldCopy(src) {
    const relative = path.relative(workspaceDir, src);
    if (!relative) return true;
    
    const parts = relative.split(path.sep);
    const rootItem = parts[0];
    
    // Strict root level inclusion check
    if (!allowedRootItems.includes(rootItem)) {
      return false;
    }
    
    // Nested exclusion check
    return !excludePatterns.some(pat => {
      return parts.includes(pat) || parts.some(p => p.startsWith(pat));
    });
  }

  console.log('[+] Staging project source files...');
  
  // Recursively copy files
  function copyRecursive(srcDir, destDir) {
    const items = fs.readdirSync(srcDir);
    for (const item of items) {
      const srcPath = path.join(srcDir, item);
      const destPath = path.join(destDir, item);
      
      if (!shouldCopy(srcPath)) {
        continue;
      }
      
      const stat = fs.statSync(srcPath);
      if (stat.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyRecursive(workspaceDir, stagingDir);

  // 4. Compress staging folder using native PowerShell command Compress-Archive
  console.log('[+] Packaging into ZIP using Windows Compress-Archive...');
  
  // Using powershell commands
  const command = `powershell -Command "Compress-Archive -Path '${stagingDir}\\*' -DestinationPath '${zipFile}' -Force"`;
  execSync(command, { stdio: 'inherit' });

  // 5. Clean staging directory
  console.log('[+] Cleaning up temporary staging files...');
  fs.rmSync(stagingDir, { recursive: true, force: true });

  console.log('\n========================================================');
  console.log('   SUCCESS: AcademixIQ_Submission_Package.zip Created!  ');
  console.log('========================================================');
  console.log(`Package location: ${zipFile}`);
  console.log(`Size: ${(fs.statSync(zipFile).size / (1024 * 1024)).toFixed(2)} MB\n`);
  
  console.log('Package contents checklist:');
  console.log('  [x] Frontend Source Code (Vite/React/TS)');
  console.log('  [x] Backend Source Code (Express/Node.js)');
  console.log('  [x] Technical Documentation (TECHNICAL_DOCUMENTATION.pdf & .md)');
  console.log('  [x] Presentation Pitch Deck (AcademixIQ_Pitch_Deck.pptx)');
  console.log('  [x] Project Demo Video Link (DEMO_VIDEO_LINK.txt)');
  console.log('========================================================');

} catch (error) {
  console.error('\n[!] Packaging failed:', error.message);
  
  // Attempt fallback cleanup
  try {
    if (fs.existsSync(stagingDir)) {
      fs.rmSync(stagingDir, { recursive: true, force: true });
    }
  } catch (cleanupErr) {}
  
  process.exit(1);
}
