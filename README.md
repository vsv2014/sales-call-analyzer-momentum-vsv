# Sales Call Transcript Generator and Analyzer

A CLI tool for generating and analyzing sales call transcripts using OpenAI's GPT models.

## Features

- Generate realistic sales call transcripts
- Summarize call transcripts
- Answer questions about call content
- Support for saving transcripts to files
- Colorful CLI output

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file in the root directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```
4. Build the TypeScript code:
```bash
npm run build
```

## Usage

### Generate a Transcript

```bash
npm run generate -- -t "cloud computing services" -d 5 -o transcript.json
```

Options:
- `-t, --topic`: Topic of the sales call (required)
- `-d, --duration`: Duration in minutes (default: 5)
- `-o, --output`: Output file name (default: transcript.json)

### Summarize a Transcript

```bash
npm run summarize -- -f transcript.json
```

Options:
- `-f, --file`: Path to the transcript file (required)

### Query a Transcript

```bash
npm run query -- -f transcript.json -q "What product was discussed?"
```

Options:
- `-f, --file`: Path to the transcript file (required)
- `-q, --question`: Question about the transcript (required)

## Running Tests

```bash
npm test
```

## Project Structure

- `/src`
  - `/commands`: CLI command implementations
  - `/services`: Core business logic
  - `/types`: TypeScript type definitions
  - `/__tests__`: Test files

## AI Usage Transparency

This project uses AI-generated code in the following ways:

1. Initial project structure and boilerplate setup
2. Basic TypeScript interfaces and types
3. OpenAI service implementation
4. CLI command structure

All AI-generated code has been reviewed, tested, and modified to ensure:
- Proper error handling
- Type safety
- Best practices in code organization
- Comprehensive documentation

## License

ISC
