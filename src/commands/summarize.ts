#!/usr/bin/env node
import { program } from 'commander';
import { OpenAIService } from '../services/openai';
import { MockService } from '../services/mock';
import { readFileSync } from 'fs';
import chalk from 'chalk';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const openAIService = new OpenAIService();
const mockService = new MockService();

program
  .name('summarize-transcript')
  .description('Generate a summary of key points from a sales call transcript')
  .requiredOption('-f, --file <file>', 'Path to the transcript JSON file')
  .option('--mock', 'Force using mock service instead of OpenAI')
  .action(async (options) => {
    try {
      // Validate input file
      if (!options.file.endsWith('.json')) {
        throw new Error('Input file must be a .json file');
      }

      console.log(chalk.blue('Reading transcript...'));
      const filePath = path.resolve(process.cwd(), options.file);
      const transcript = JSON.parse(readFileSync(filePath, 'utf-8'));

      // Set language for mock service if present in transcript
      if (transcript.language) {
        mockService.setLanguage(transcript.language);
      }

      console.log(chalk.blue('Generating summary...'));
      let summary;

      if (options.mock || !process.env.OPENAI_API_KEY) {
        if (!process.env.OPENAI_API_KEY) {
          console.log(chalk.yellow('No OpenAI API key found. Using mock service...'));
        } else if (options.mock) {
          console.log(chalk.yellow('Mock mode enabled. Using mock service...'));
        }
        summary = await mockService.summarizeTranscript(transcript.lines);
      } else {
        try {
          summary = await openAIService.summarizeTranscript(transcript.lines);
        } catch (error: any) {
          console.log(chalk.yellow(`OpenAI service error: ${error.message}`));
          console.log(chalk.yellow('Falling back to mock service...'));
          summary = await mockService.summarizeTranscript(transcript.lines);
        }
      }

      console.log(chalk.green('\nSummary:'));
      console.log(summary);
    } catch (error: any) {
      console.error(chalk.red('Error summarizing transcript:'), error.message);
      process.exit(1);
    }
  });

program.parse();
