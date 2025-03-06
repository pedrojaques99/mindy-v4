import fs from 'fs';
import { createReadStream } from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csv-parser';

// Input and output file paths
const inputFile = 'database-content.csv';
const outputFile = 'database-content-formatted.csv';

// Array to store the processed rows
const processedRows = [];

// Read the CSV file
createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    // Process the tags column
    if (row.tags) {
      // Remove any surrounding quotes, split by commas, and trim whitespace
      const tagsArray = row.tags.replace(/"/g, '').split(',').map(tag => tag.trim());
      
      // Format as PostgreSQL array: {"tag1","tag2","tag3"}
      row.tags = `{${tagsArray.map(tag => `"${tag}"`).join(',')}}`;
    } else {
      // If no tags, use empty array
      row.tags = '{}';
    }
    
    processedRows.push(row);
  })
  .on('end', () => {
    // Get headers from the first row
    const headers = Object.keys(processedRows[0]).map(header => ({
      id: header,
      title: header
    }));
    
    // Write the processed data to a new CSV file
    const csvWriter = createObjectCsvWriter({
      path: outputFile,
      header: headers
    });
    
    csvWriter.writeRecords(processedRows)
      .then(() => {
        console.log(`CSV file has been processed and saved to ${outputFile}`);
      });
  });
