# Use nginx base image
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom config
COPY default.conf /etc/nginx/conf.d/

# Copy built frontend files into nginx html directory
COPY dist/ /usr/share/nginx/html
