import { Client } from '@hubspot/api-client';
import { SimplePublicObjectInput } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { BabyNameRecord } from './database';
import dotenv from 'dotenv';
dotenv.config();

export async function syncToHubspot(records: BabyNameRecord[]) {
  console.log(' HubSpot Sync: Initializing...');
  if (!process.env.HUBSPOT_API_KEY) {
    throw new Error('HubSpot API key not found in .env file.');
  }

  const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_API_KEY });
  const contactsToCreate: SimplePublicObjectInput[] = [];

  for (const record of records) {
    const emailSafeName = record.Name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    contactsToCreate.push({
      properties: {
        firstname: record.Name,
        email: `${emailSafeName}@example.com`,
        gender: record.Sex 
      }
    });
  }

  const batchSize = 100;
  console.log(` HubSpot Sync: Preparing to create ${contactsToCreate.length} contacts in batches of ${batchSize}...`);

  for (let i = 0; i < contactsToCreate.length; i += batchSize) {
    const batch = contactsToCreate.slice(i, i + batchSize);
    try {
      await hubspotClient.crm.contacts.batchApi.create({ inputs: batch });
      console.log(`✅ HubSpot Sync: Successfully created batch starting at index ${i}.`);
    } catch (error) {
      console.error(`❌ HubSpot Sync: Error creating batch at index ${i}.`, error);
    }
  }
  
  console.log('✅ HubSpot sync complete.');
}