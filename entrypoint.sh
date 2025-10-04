#!/bin/sh

# Exit immediately if a  command exits with a non-zero status.
set -e

# Check if the API_KEY environment  variable is set
if [ -z "${API_KEY}" ]; then
  echo "Error: The API_KEY environment  variable is not set." >&2
  exit 1
fi

# The HTML file to be  modified
HTML_FILE="/usr/share/nginx/html/index.html"

# Use sed to replace the placeholder with the actual API key.
# The `sed` command looks for the line `API_KEY: 
sed -i "s/API_KEY: \"\"/API_KEY: \"${API_KEY}\"/g" $HTML_FILE

# Start nginx
exec nginx -g 'daemon off;'
