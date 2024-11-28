#!/bin/bash

# WebOS Package Sideloader
# This script installs a WebOS .ipk package to a connected LG TV and optionally launches with debugger

# Function to display usage information
usage() {
    echo "Usage: $0 <ipk_file> [device_name] [--debug] [--port <port>]"
    echo "  <ipk_file>: The .ipk file to install"
    echo "  [device_name]: Optional. The name of the target device (if multiple devices are configured)"
    echo "  --debug: Launch the app with inspector enabled"
    echo "  --port <port>: Specify debug port (default: 9998)"
    echo ""
    echo "Before using this script:"
    echo "1. Ensure your TV is in developer mode"
    echo "2. Make sure the TV is connected to the same network as your computer"
    echo "3. Run 'ares-setup-device' to configure your TV if you haven't already"
    exit 1
}

# Function to check if a device is connected
check_device() {
    local device_name=$1
    ares-device -D ${device_name:+--device "$device_name"} > /dev/null 2>&1
    return $?
}

# Function to list available devices
list_devices() {
    echo "Available devices:"
    ares-device -D
}

# Check if ares-cli is installed
if ! command -v ares-install &> /dev/null; then
    echo "Error: ares-cli is not installed or not in PATH"
    echo "Please install WebOS CLI tools first"
    exit 1
fi

# Default values
DEBUG_MODE=false
DEBUG_PORT=9998
DEVICE_NAME=""
IPK_FILE=""

# First argument must be the IPK file
if [ "$#" -lt 1 ]; then
    usage
fi

IPK_FILE="$1"
shift

# Second argument can be device name (for backward compatibility)
if [ "$#" -gt 0 ] && [[ "$1" != --* ]]; then
    DEVICE_NAME="$1"
    shift
fi

# Parse remaining arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --debug)
            DEBUG_MODE=true
            shift
            ;;
        --port)
            DEBUG_PORT="$2"
            shift 2
            ;;
        --help)
            usage
            ;;
        *)
            echo "Error: Unknown argument: $1"
            usage
            ;;
    esac
done

# Check if .ipk file exists
if [ ! -f "$IPK_FILE" ]; then
    echo "Error: IPK file does not exist: $IPK_FILE"
    exit 1
fi

# Verify file is an .ipk file
if [[ "$IPK_FILE" != *.ipk ]]; then
    echo "Error: File must be an .ipk package"
    exit 1
fi

# Check device connectivity
if [ -n "$DEVICE_NAME" ]; then
    # If device name provided, check that specific device
    if ! check_device "$DEVICE_NAME"; then
        echo "Error: Cannot connect to device '$DEVICE_NAME'"
        list_devices
        exit 1
    fi
else
    # If no device name provided, check for any available device
    if ! check_device; then
        echo "Error: No WebOS devices found or cannot connect to default device"
        list_devices
        exit 1
    fi
fi

# Install the package
echo "Installing package to ${DEVICE_NAME:-default device}..."
if [ -n "$DEVICE_NAME" ]; then
    ares-install --device "$DEVICE_NAME" "$IPK_FILE"
else
    ares-install "$IPK_FILE"
fi

if [ $? -ne 0 ]; then
    echo "Error: Package installation failed"
    exit 1
fi

# Launch the app
APP_ID=$(basename "$IPK_FILE" | cut -d'_' -f1)
echo "Installation successful! Launching app..."

# Construct launch command based on debug mode
if [ "$DEBUG_MODE" = true ]; then
    echo "Launching app in debug mode on port $DEBUG_PORT..."
    if [ -n "$DEVICE_NAME" ]; then
        ares-inspect --device "$DEVICE_NAME" --app "$APP_ID" --port "$DEBUG_PORT" &
        sleep 2  # Give inspector time to start
        ares-launch --device "$DEVICE_NAME" "$APP_ID"
    else
        ares-inspect --app "$APP_ID" --port "$DEBUG_PORT" &
        sleep 2  # Give inspector time to start
        ares-launch "$APP_ID"
    fi
    echo "Debug inspector started on port $DEBUG_PORT"
    echo "You can now connect to the debugger using Chrome DevTools at: chrome://inspect"
else
    if [ -n "$DEVICE_NAME" ]; then
        ares-launch --device "$DEVICE_NAME" "$APP_ID"
    else
        ares-launch "$APP_ID"
    fi
fi

if [ $? -ne 0 ]; then
    echo "Warning: Failed to launch app automatically"
    echo "You can launch it manually using: ares-launch $APP_ID"
    if [ "$DEBUG_MODE" = true ]; then
        echo "For debugging, use: ares-inspect --app $APP_ID --port $DEBUG_PORT"
    fi
fi

echo "Sideloading process completed!"
exit 0