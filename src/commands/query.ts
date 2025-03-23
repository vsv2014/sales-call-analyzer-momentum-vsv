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
  .name('query-transcript')
  .description('Ask questions about a sales call transcript and get AI-powered answers')
  .requiredOption('-f, --file <file>', 'Path to the transcript JSON file')
  .requiredOption('-q, --question <question>', 'Question to ask about the transcript')
  .option('--mock', 'Force using mock service instead of OpenAI')
  .action(async (options) => {
    try {
      // Validate input file
      if (!options.file.endsWith('.json')) {
        throw new Error('Input file must be a .json file');
      }

      // Validate question length
      if (options.question.length < 5) {
        throw new Error('Question must be at least 5 characters long');
      }

      console.log(chalk.blue('Reading transcript...'));
      const filePath = path.resolve(process.cwd(), options.file);
      const transcript = JSON.parse(readFileSync(filePath, 'utf-8'));

      // Set language for mock service if present in transcript
      if (transcript.language) {
        mockService.setLanguage(transcript.language);
      }

      console.log(chalk.blue(`Answering question: "${options.question}"`));
      let answer;

      if (options.mock || !process.env.OPENAI_API_KEY) {
        if (!process.env.OPENAI_API_KEY) {
          console.log(chalk.yellow('No OpenAI API key found. Using mock service...'));
        } else if (options.mock) {
          console.log(chalk.yellow('Mock mode enabled. Using mock service...'));
        }
        answer = await mockService.answerQuestion(transcript.lines, options.question);
      } else {
        try {
          answer = await openAIService.answerQuestion(transcript.lines, options.question);
        } catch (error: any) {
          console.log(chalk.yellow(`OpenAI service error: ${error.message}`));
          console.log(chalk.yellow('Falling back to mock service...'));
          answer = await mockService.answerQuestion(transcript.lines, options.question);
        }
      }

      console.log(chalk.green('\nAnswer:'));
      console.log(answer);
    } catch (error: any) {
      console.error(chalk.red('Error querying transcript:'), error.message);
      process.exit(1);
    }
  });

program.parse();
