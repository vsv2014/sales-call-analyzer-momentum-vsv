#!/usr/bin/env node
import { program } from 'commander';
import { OpenAIService } from '../services/openai';
import { MockService } from '../services/mock';
import { writeFileSync } from 'fs';
import chalk from 'chalk';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const openAIService = new OpenAIService();
const mockService = new MockService();

program
  .name('generate-transcript')
  .description('Generate a sales call transcript with specified parameters')
  .requiredOption('-t, --topic <topic>', 'Topic of the sales call (e.g., "CRM software", "cloud hosting")')
  .option('-d, --duration <minutes>', 'Duration of the call in minutes (0.5-30)', '5')
  .option('-o, --output <file>', 'Output JSON file name', 'transcript.json')
  .option('-l, --language <code>', 'Language code (en, es, fr)', 'en')
  .option('--mock', 'Force using mock service instead of OpenAI')
  .action(async (options) => {
    try {
      // Validate duration
      const duration = parseFloat(options.duration);
      if (isNaN(duration) || duration < 0.5 || duration > 30) {
        throw new Error('Duration must be between 0.5 and 30 minutes');
      }

      // Validate output file
      if (!options.output.endsWith('.json')) {
        throw new Error('Output file must have .json extension');
      }

      console.log(chalk.blue('Generating transcript...'));

      let transcript;
      if (options.mock || !process.env.OPENAI_API_KEY) {
        if (!process.env.OPENAI_API_KEY) {
          console.log(chalk.yellow('No OpenAI API key found. Using mock service...'));
        } else if (options.mock) {
          console.log(chalk.yellow('Mock mode enabled. Using mock service...'));
        }

        mockService.setLanguage(options.language);
        transcript = await mockService.generateTranscript(options.topic, duration);
      } else {
        try {
          transcript = await openAIService.generateTranscript(options.topic, duration);
        } catch (error: any) {
          console.log(chalk.yellow(`OpenAI service error: ${error.message}`));
          console.log(chalk.yellow('Falling back to mock service...'));
          mockService.setLanguage(options.language);
          transcript = await mockService.generateTranscript(options.topic, duration);
        }
      }

      const outputPath = path.resolve(process.cwd(), options.output);
      const transcriptData = {
        topic: options.topic,
        duration: duration,
        language: options.language,
        lines: transcript,
        metadata: {
          generated: new Date().toISOString(),
          service: options.mock ? 'mock' : 'openai'
        }
      };

      writeFileSync(outputPath, JSON.stringify(transcriptData, null, 2));

      console.log(chalk.green('\nTranscript generated successfully!\n'));
      console.log('Transcript content:');
      transcript.forEach(line => {
        console.log(`${chalk.gray(line.timestamp)} ${chalk.cyan(line.speaker.name)}(${chalk.blue(line.speaker.company)}): ${line.text}`);
      });
      console.log(chalk.green(`\nSaved to: ${outputPath}`));

    } catch (error: any) {
      console.error(chalk.red('Error generating transcript:'), error.message);
      process.exit(1);
    }
  });

program.parse();
