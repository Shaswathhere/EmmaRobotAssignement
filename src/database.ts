import fs from 'fs';
import csv from 'csv-parser';
import AdmZip from 'adm-zip';
import { Sequelize, DataTypes } from 'sequelize';

interface BabyNameRecord {
  Name: string;
  Sex: string;
}

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!, {
    host: process.env.DB_HOST!,
    dialect: 'mysql'
  }
);

const BabyName = sequelize.define('BabyName', {
  Name: { type: DataTypes.STRING, allowNull: false },
  Sex: { type: DataTypes.STRING, allowNull: false }
}, {timestamps: false});

export async function processCsvAndStore(zipFilePath: string): Promise<BabyNameRecord[]> {
  console.log('🔄 Unzipping file and processing CSV data...');
  const records: BabyNameRecord[] = [];
  
  const zip = new AdmZip(zipFilePath);
  const csvEntry = zip.getEntries().find(entry => entry.entryName.endsWith('.csv'));

  if (!csvEntry) {
    throw new Error('Could not find a .csv file inside the downloaded zip archive.');
  }
  
  console.log(`Found CSV file in zip: ${csvEntry.entryName}`);
  const csvData = zip.readAsText(csvEntry);

  return new Promise((resolve, reject) => {
    const stream = require('stream');
    const readableStream = new stream.Readable();
    readableStream._read = () => {};
    readableStream.push(csvData);
    readableStream.push(null);

    readableStream
      .pipe(csv())
      .on('data', (row: { Name: any; Sex: any; }) => {
        if (row.Name && row.Sex) {
          records.push({ Name: row.Name, Sex: row.Sex });
        }
      })
      .on('end', async () => {
        try {
          console.log(`Found ${records.length} records in CSV. Inserting into database in batches...`);
          await BabyName.destroy({ where: {}, truncate: true });

          const batchSize = 5000;
          for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            await BabyName.bulkCreate(batch as any[]);
            console.log(`Inserted batch ${i / batchSize + 1}...`);
          }
          
          console.log('✅ Database populated successfully.');
          resolve(records);
        } catch (error) {
          console.error('Error storing data in database:', error);
          reject(error);
        }
      })
      .on('error', (error: any) => {
        reject(error);
      });
  });
}

export { BabyName, BabyNameRecord };