# Use the official Nginx image  from Docker Hub
FROM nginx:1.25.3-alpine

# Copy all application files to  the Nginx html directory
COPY . /usr/share/nginx/html

# Copy the entrypoint  script
COPY entrypoint.sh /entrypoint.sh

# Make the entrypoint script executable
RUN chmod  +x /entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]

 # The default command for the nginx image will be executed after the entrypoint script
# CMD ["nginx", "- g", "daemon off;"]
