#!/bin/bash

# WebOS Build Package Generator
# This script generates an LG WebOS build package (.ipk file) from a given directory

# Function to display usage information
usage() {
    echo "Usage: $0 <source_directory> [output_directory]"
    echo "  <source_directory>: The directory containing your WebOS app source code"
    echo "  [output_directory]: Optional. The directory where the .ipk file will be saved. Defaults to current directory."
    exit 1
}

# Check if at least one argument is provided
if [ "$#" -lt 1 ]; then
    usage
fi

# Assign arguments to variables
SOURCE_DIR="$1"
OUTPUT_DIR="../${2:-.}"  # Use second argument if provided, otherwise use current directory

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory does not exist."
    exit 1
fi

# Check if output directory exists, create if it doesn't
if [ ! -d "$OUTPUT_DIR" ]; then
    mkdir -p "$OUTPUT_DIR"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create output directory."
        exit 1
    fi
fi

# Navigate to the source directory
cd "$SOURCE_DIR" || exit 1

# Check if appinfo.json exists
if [ ! -f "appinfo.json" ]; then
    echo "Error: appinfo.json not found in the source directory."
    exit 1
fi

# Extract app ID and version from appinfo.json
APP_ID=$(sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\).*/\1/p' appinfo.json)
VERSION=$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\).*/\1/p' appinfo.json)

if [ -z "$APP_ID" ] || [ -z "$VERSION" ]; then
    echo "Error: Unable to extract app ID or version from appinfo.json."
    exit 1
fi

# Build the package
echo "Building WebOS package..."
ares-package . --outdir="$OUTPUT_DIR" -v

if [ $? -ne 0 ]; then
    echo "Error: Package build failed."
    exit 1
fi

# Check if the .ipk file was created
IPK_FILE="$OUTPUT_DIR/${APP_ID}_${VERSION}_all.ipk"
if [ ! -f "$IPK_FILE" ]; then
    echo "Error: .ipk file was not created."
    exit 1
fi

echo "Build successful! Package created: $IPK_FILE"
exit 0