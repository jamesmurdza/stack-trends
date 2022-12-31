# README

This tool scrapes current and historical data from StackShare to find trends in technology stack adoption.

## Setup:

Install dependencies:
```
npm install
```

## Usage:
This script can fetch data from any tool with a StackShare URL. The tool name for https://stackshare.io/python is **python**.
```
node fetch [tool]
node plot [tool]
```

## Example:
```
node fetch tensorflow scikit-learn keras
node plot tensorflow scikit-learn keras
```

Result:

<img src="./Example.png" width="547"/>

