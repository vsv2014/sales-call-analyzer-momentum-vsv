#!/usr/bin/env node
import { program } from 'commander';
import { OpenAIService } from '../services/openai';
import { readFileSync } from 'fs';
import chalk from 'chalk';
import path from 'path';
import dotenv from 'dotenv';
import { Transcript } from '../types';

dotenv.config();

const openAIService = new OpenAIService();

program
  .name('summarize-transcript')
  .description('Summarize a sales call transcript')
  .requiredOption('-f, --file <filename>', 'Transcript file to summarize')
  .action(async (options) => {
    try {
      console.log(chalk.blue('Reading transcript...'));
      
      const filePath = path.resolve(process.cwd(), options.file);
      const fileContent = readFileSync(filePath, 'utf-8');
      const transcript: Transcript = JSON.parse(fileContent);

      console.log(chalk.blue('Generating summary...'));
      const summary = await openAIService.summarizeTranscript(transcript.lines);

      console.log(chalk.yellow('\nTranscript Summary:'));
      console.log(chalk.white(summary));
    } catch (error) {
      console.error(chalk.red('Error summarizing transcript:'), error);
      process.exit(1);
    }
  });

program.parse();
