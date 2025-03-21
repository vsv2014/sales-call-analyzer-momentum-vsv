#!/usr/bin/env node
import { program } from 'commander';
import { OpenAIService } from '../services/openai';
import { writeFileSync } from 'fs';
import chalk from 'chalk';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const openAIService = new OpenAIService();

program
  .name('generate-transcript')
  .description('Generate a sales call transcript')
  .requiredOption('-t, --topic <topic>', 'Topic of the sales call')
  .option('-d, --duration <minutes>', 'Duration of the call in minutes', '5')
  .option('-o, --output <filename>', 'Output file name', 'transcript.json')
  .action(async (options) => {
    try {
      console.log(chalk.blue('Generating transcript...'));
      
      const transcript = await openAIService.generateTranscript(
        options.topic,
        parseInt(options.duration)
      );

      const outputPath = path.resolve(process.cwd(), options.output);
      const transcriptData = {
        lines: transcript,
        metadata: {
          date: new Date().toISOString(),
          duration: `${options.duration} minutes`,
        },
      };

      writeFileSync(outputPath, JSON.stringify(transcriptData, null, 2));

      console.log(chalk.green('\nTranscript generated successfully!'));
      console.log(chalk.yellow('\nTranscript content:'));
      transcript.forEach(line => {
        console.log(
          `${chalk.gray(line.timestamp)} ${chalk.cyan(line.speaker.name)}(${chalk.blue(line.speaker.company)}): ${line.text}`
        );
      });
      console.log(chalk.green(`\nSaved to: ${outputPath}`));
    } catch (error) {
      console.error(chalk.red('Error generating transcript:'), error);
      process.exit(1);
    }
  });

program.parse();
