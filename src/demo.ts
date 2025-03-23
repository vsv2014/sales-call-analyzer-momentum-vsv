#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import { TranscriptLine } from './types';
import * as fs from 'fs';
import * as path from 'path';

async function loadSampleTranscript(): Promise<TranscriptLine[]> {
  const filePath = path.join(__dirname, 'samples', 'sample-transcript.json');
  const data = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

function generateSummary(transcript: TranscriptLine[]): string {
  // Mock summary generation without API
  return "Key points from the call:\n" +
    "1. Customer is interested in cloud cost optimization\n" +
    "2. Sales rep offered potential 30% cost reduction\n" +
    "3. Flexible terms starting from 6 months with annual commitment discounts";
}

function answerQuestion(transcript: TranscriptLine[], question: string): string {
  // Mock question answering without API
  const questionLower = question.toLowerCase();
  if (questionLower.includes('cost') || questionLower.includes('price')) {
    return "The sales rep mentioned a potential 30% cost reduction with their new pricing model.";
  }
  if (questionLower.includes('commitment') || questionLower.includes('term')) {
    return "They offer flexible terms starting from 6 months, with additional discounts for annual commitments.";
  }
  return "I don't have enough context to answer that specific question based on the transcript.";
}

async function runDemo() {
  console.log(chalk.blue('\n🚀 Starting Sales Call Analyzer Demo\n'));

  try {
    // Load sample transcript
    console.log(chalk.yellow('📝 Loading sample transcript...'));
    const transcript = await loadSampleTranscript();
    console.log(chalk.green('Sample transcript loaded successfully!\n'));

    // Display transcript
    console.log(chalk.yellow('Transcript content:'));
    transcript.forEach(line => {
      console.log(`${line.timestamp} ${line.speaker.name}(${line.speaker.company}): ${line.text}`);
    });
    console.log();

    // Generate summary
    console.log(chalk.yellow('📊 Generating summary...'));
    const summary = generateSummary(transcript);
    console.log(chalk.green('Summary generated successfully!\n'));
    console.log(summary);
    console.log();

    // Answer questions
    console.log(chalk.yellow('❓ Answering sample questions...\n'));
    const questions = [
      "What cost savings were mentioned?",
      "What are the commitment terms?",
      "Who initiated the call?"
    ];

    questions.forEach(question => {
      console.log(chalk.blue(`Q: ${question}`));
      console.log(chalk.green(`A: ${answerQuestion(transcript, question)}\n`));
    });

    console.log(chalk.blue('🎉 Demo completed successfully!\n'));
    console.log(chalk.yellow('Note: This demo uses mock data and responses. In production,'));
    console.log(chalk.yellow('the application will use OpenAI API for more sophisticated analysis.\n'));

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
