import * as fs from 'fs';
import * as xml2js from 'xml2js';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to Android XML file (relative to repo root)
const xmlPath = path.resolve(__dirname, '../../../app/src/main/res/values/array.xml');
const outputPath = path.resolve(__dirname, '../src/data/sentiment-words.json');

console.log('Reading XML file from:', xmlPath);

const xmlContent = fs.readFileSync(xmlPath, 'utf8');
const parser = new xml2js.Parser();

parser.parseString(xmlContent, (err, result) => {
  if (err) {
    console.error('Error parsing XML:', err);
    process.exit(1);
  }

  const vocabulary = {
    positive: {} as Record<string, string[]>,
    negative: {} as Record<string, string[]>
  };

  // Extract positive words
  for (let letter = 'a'.charCodeAt(0); letter <= 'z'.charCodeAt(0); letter++) {
    const letterStr = String.fromCharCode(letter);
    const arrayName = `positive_words_${letterStr}`;

    const stringArray = result.resources['string-array'];
    const matchingArray = stringArray?.find((arr: any) => arr.$.name === arrayName);
    const words = matchingArray?.item || [];

    vocabulary.positive[letterStr] = words.map((w: any) => {
      // Handle both string items and object items
      if (typeof w === 'string') {
        return w.trim();
      } else if (w._) {
        return w._.trim();
      }
      return '';
    }).filter((w: string) => w.length > 0);
  }

  // Extract negative words (same pattern)
  for (let letter = 'a'.charCodeAt(0); letter <= 'z'.charCodeAt(0); letter++) {
    const letterStr = String.fromCharCode(letter);
    const arrayName = `negative_words_${letterStr}`;

    const stringArray = result.resources['string-array'];
    const matchingArray = stringArray?.find((arr: any) => arr.$.name === arrayName);
    const words = matchingArray?.item || [];

    vocabulary.negative[letterStr] = words.map((w: any) => {
      // Handle both string items and object items
      if (typeof w === 'string') {
        return w.trim();
      } else if (w._) {
        return w._.trim();
      }
      return '';
    }).filter((w: string) => w.length > 0);
  }

  // Count total words
  const positiveCount = Object.values(vocabulary.positive).reduce((sum, arr) => sum + arr.length, 0);
  const negativeCount = Object.values(vocabulary.negative).reduce((sum, arr) => sum + arr.length, 0);

  console.log(`Extracted ${positiveCount} positive words and ${negativeCount} negative words`);

  // Write to JSON file
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(vocabulary, null, 2));
  console.log('Sentiment words extracted successfully to:', outputPath);
  console.log(`Total: ${positiveCount + negativeCount} words`);
});
