const fs = require('fs');
const path = require('path');
const { createWriteStream, createReadStream } = fs;
const { pipeline } = require('stream/promises');

// Node.js built-in support for ZIP extraction (available in Node 16+)
async function extractZip(zipPath, outputDir) {
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(outputDir, true);
  console.log(`Extracted ${zipPath} to ${outputDir}`);
}

async function listZipContents(zipPath) {
  const AdmZip = require('adm-zip');
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

async function main() {
  const zip1 = 'attached_assets/Documentos_Parcerias_Bureau_Social_1760220433965.zip';
  const zip2 = 'attached_assets/Bureau_Social_Documentos_Word_1760220433966.zip';
  const outputDir = 'attached_assets/extracted';
  
  // First, try to list contents
  try {
    await listZipContents(zip1);
    await listZipContents(zip2);
  } catch (error) {
    console.log('adm-zip not available, will install it');
  }
}

main().catch(console.error);
