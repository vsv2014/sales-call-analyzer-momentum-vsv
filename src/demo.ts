#!/usr/bin/env node
import { program } from 'commander';
import { OpenAIService } from './services/openai';
import { readFileSync } from 'fs';
import chalk from 'chalk';
import path from 'path';
import dotenv from 'dotenv';
import { Transcript, TranscriptLine } from './types';

dotenv.config();

const openAIService = new OpenAIService();

async function runDemo() {
  console.log(chalk.blue('🚀 Starting Sales Call Analyzer Demo'));
  
  try {
    // 1. Load sample transcript
    console.log(chalk.yellow('\n📝 Loading sample transcript...'));
    const samplePath = path.join(__dirname, 'samples', 'sample-transcript.json');
    const sampleData: Transcript = JSON.parse(readFileSync(samplePath, 'utf-8'));
    
    console.log(chalk.green('Sample transcript loaded successfully!'));
    console.log(chalk.white('\nTranscript content:'));
    sampleData.lines.forEach((line: TranscriptLine) => {
      console.log(
        `${chalk.gray(line.timestamp)} ${chalk.cyan(line.speaker.name)}(${chalk.blue(line.speaker.company)}): ${line.text}`
      );
    });

    // 2. Generate summary
    console.log(chalk.yellow('\n📊 Generating summary...'));
    const summary = await openAIService.summarizeTranscript(sampleData.lines);
    console.log(chalk.green('Summary:'));
    console.log(chalk.white(summary));

    // 3. Answer questions
    const questions = [
      'What was the main topic discussed?',
      'What pricing information was mentioned?',
      'What was the commitment period discussed?'
    ];

    console.log(chalk.yellow('\n❓ Answering sample questions...'));
    for (const question of questions) {
      console.log(chalk.cyan(`\nQuestion: ${question}`));
      const answer = await openAIService.answerQuestion(sampleData.lines, question);
      console.log(chalk.green('Answer:'), chalk.white(answer));
    }

    console.log(chalk.blue('\n✨ Demo completed successfully!'));
    console.log(chalk.gray('\nNote: This demo used a sample transcript. In production, you can:'));
    console.log(chalk.gray('1. Generate new transcripts: npm run generate -- -t "your topic" -d 5'));
    console.log(chalk.gray('2. Summarize transcripts: npm run summarize -- -f your-transcript.json'));
    console.log(chalk.gray('3. Query transcripts: npm run query -- -f your-transcript.json -q "your question"'));

  } catch (error) {
    console.error(chalk.red('Error during demo:'), error);
    process.exit(1);
  }
}

program
  .name('sales-call-analyzer-demo')
  .description('Demonstrates the features of the Sales Call Analyzer')
  .action(runDemo);

program.parse();
