const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

async function listZipContents(zipPath) {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();
  
  console.log(`\n=== Contents of ${path.basename(zipPath)} ===`);
  entries.forEach(entry => {
    if (!entry.isDirectory) {
      console.log(`  ${entry.entryName} (${entry.header.size} bytes)`);
    }
  });
  
  return entries;
}

async function extractZip(zipPath, outputDir) {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(outputDir, true);
  console.log(`\nExtracted ${path.basename(zipPath)} to ${outputDir}`);
}

async function main() {
  const zip1 = 'attached_assets/Documentos_Parcerias_Bureau_Social_1760220433965.zip';
  const zip2 = 'attached_assets/Bureau_Social_Documentos_Word_1760220433966.zip';
  const outputDir = 'attached_assets/extracted';
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // List contents first
  await listZipContents(zip1);
  await listZipContents(zip2);
  
  // Extract both ZIPs
  await extractZip(zip1, outputDir);
  await extractZip(zip2, outputDir);
  
  console.log('\n✅ All files extracted successfully!');
}

main().catch(console.error);
