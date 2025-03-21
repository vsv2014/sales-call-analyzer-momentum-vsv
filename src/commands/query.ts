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
  .name('query-transcript')
  .description('Query a sales call transcript')
  .requiredOption('-f, --file <filename>', 'Transcript file to query')
  .requiredOption('-q, --question <question>', 'Question to ask about the transcript')
  .action(async (options) => {
    try {
      console.log(chalk.blue('Reading transcript...'));
      
      const filePath = path.resolve(process.cwd(), options.file);
      const fileContent = readFileSync(filePath, 'utf-8');
      const transcript: Transcript = JSON.parse(fileContent);

      console.log(chalk.blue('Processing question...'));
      const answer = await openAIService.answerQuestion(transcript.lines, options.question);

      console.log(chalk.yellow('\nQuestion:'), chalk.white(options.question));
      console.log(chalk.yellow('Answer:'), chalk.white(answer));
    } catch (error) {
      console.error(chalk.red('Error querying transcript:'), error);
      process.exit(1);
    }
  });

program.parse();
