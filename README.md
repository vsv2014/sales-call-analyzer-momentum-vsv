# Sales Call Transcript Generator and Analyzer

A CLI tool for generating and analyzing sales call transcripts. Supports both OpenAI GPT models and a mock service for demonstration purposes.

## Features

- Generate sales call transcripts (using OpenAI or mock data)
- Summarize call transcripts
- Answer questions about call content
- Support for saving transcripts to files
- Colorful CLI output

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key (optional)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. (Optional) Create a `.env` file in the root directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```
4. Build the TypeScript code:
```bash
npm run build
```

## Usage

### Demo Mode (No API Key Required)

To try out the application without an OpenAI API key:

```bash
npm run demo
```

This will use mock data to demonstrate the application's features.

### Using OpenAI (API Key Required)

If you have an OpenAI API key with chat completion permissions:

#### Generate a Transcript

```bash
npm run generate -- -t "cloud computing services" -d 5 -o transcript.json
```

Options:
- `-t, --topic`: Topic of the sales call (required)
- `-d, --duration`: Duration in minutes (default: 5)
- `-o, --output`: Output file name (default: transcript.json)

#### Summarize a Transcript

```bash
npm run summarize -- -f transcript.json
```

Options:
- `-f, --file`: Path to the transcript file (required)

#### Query a Transcript

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
  - `/services`: Core business logic (OpenAI and mock services)
  - `/types`: TypeScript type definitions
  - `/samples`: Sample transcript data
  - `/__tests__`: Test files

## Implementation Details

The project provides two service implementations:

1. **OpenAI Service**: Uses OpenAI's GPT models for generating and analyzing transcripts. Requires an API key with chat completion permissions.

2. **Mock Service**: Provides pre-defined responses for demonstration purposes. No API key required.

The application automatically falls back to the mock service if:
- No OpenAI API key is provided
- The API key is invalid
- API rate limits are exceeded
- API quota is exceeded

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
