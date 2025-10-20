import 'dotenv/config';
import { downloadKaggleCsv } from './scraper';
import { processCsvAndStore } from './database';
import { syncToHubspot } from './hubspot';

async function main() {
  console.log('--- Starting Kaggle to HubSpot Data Pipeline ---');
  try {
    const csvFilePath = await downloadKaggleCsv();
    const records = await processCsvAndStore(csvFilePath);
    
    const recordsToSync = records.slice(0, 250);
    console.log(`Selected ${recordsToSync.length} records to sync to HubSpot.`);
    await syncToHubspot(recordsToSync);

    console.log('--- ✅ Pipeline finished successfully! ---');
  } catch (error) {
    console.error('--- ❌ An error occurred during the pipeline execution: ---', error);
    process.exit(1);
  }
}

main();