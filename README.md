# Sales Call Transcript Generator and Analyzer

A CLI tool for generating and analyzing sales call transcripts. Built with TypeScript and designed to work with both OpenAI GPT models and a built-in mock service.

## Features

- Generate realistic sales call transcripts
- Summarize call transcripts
- Answer questions about call content
- Support for saving transcripts to files
- Colorful CLI output
- Works with or without OpenAI API key

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Quick Start

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Build the TypeScript code:
```bash
npm run build
```

## Running the Application

The application can run in two modes:

### 1. Mock Mode (No API Key Required)

By default, if no OpenAI API key is provided, the application automatically uses the mock service. This is perfect for:
- Testing and development
- Demonstrations
- Understanding the application flow
- Interviews and code reviews

To run in mock mode, simply use any of the commands without setting up an API key:

```bash
# Generate a mock transcript
npm run generate -- -t "cloud computing services" -d 5

# Summarize the transcript
npm run summarize -- -f transcript.json

# Ask questions about the transcript
npm run query -- -f transcript.json -q "What product was discussed?"
```

### 2. OpenAI Mode (API Key Required)

To use OpenAI's GPT models for more dynamic and context-aware responses:

1. Create a `.env` file in the root directory:
```
OPENAI_API_KEY=your_api_key_here
```

2. Use the same commands as above - they'll automatically use OpenAI when an API key is present:
```bash
# Generate using OpenAI
npm run generate -- -t "cloud computing services" -d 5 -o transcript.json
```

## Command Options

### Generate Transcript
```bash
npm run generate -- -t <topic> -d <duration> -o <output>
```
- `-t, --topic`: Topic of the sales call (required)
- `-d, --duration`: Duration in minutes (default: 5)
- `-o, --output`: Output file name (default: transcript.json)

### Summarize Transcript
```bash
npm run summarize -- -f <file>
```
- `-f, --file`: Path to the transcript file (required)

### Query Transcript
```bash
npm run query -- -f <file> -q <question>
```
- `-f, --file`: Path to the transcript file (required)
- `-q, --question`: Question about the transcript (required)

## Running Tests

```bash
npm test
```

The test suite includes comprehensive tests for both the OpenAI service and the mock service.

## Project Structure

```
/src
├── /commands         # CLI command implementations
├── /services        # Core business logic
│   ├── openai.ts    # OpenAI service implementation
│   └── mock.ts      # Mock service for testing/demo
├── /types           # TypeScript type definitions
├── /samples         # Sample transcript data
└── /tests          # Test files
```

## Implementation Details

The project uses a service-based architecture with two interchangeable implementations:

1. **Mock Service** (`mock.ts`):
   - No API key required
   - Pre-defined, realistic responses
   - Perfect for testing and demos
   - Zero external dependencies
   - Instant responses

2. **OpenAI Service** (`openai.ts`):
   - Requires API key
   - Dynamic, context-aware responses
   - Handles rate limiting and retries
   - Proper error handling
   - Type-safe implementation

The application automatically selects the appropriate service based on:
- Presence of OpenAI API key
- API key validity
- Rate limit status
- Error conditions

## License

ISC
