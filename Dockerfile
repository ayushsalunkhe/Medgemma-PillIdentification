FROM nginx:1.25.3-alpine

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Copy application files
COPY . /usr/share/nginx/html

# Replace placeholder and start nginx in one command
CMD /bin/sh -c "envsubst '\$API_KEY' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.tmp.html && mv /usr/share/nginx/html/index.tmp.html /usr/share/nginx/html/index.html && nginx -g 'daemon off;'"
