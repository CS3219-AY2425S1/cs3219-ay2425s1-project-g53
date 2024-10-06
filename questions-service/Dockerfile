# Use official Python image from the Dockerhub
FROM python:3.12-alpine

# Set the working directory in the container
WORKDIR /questions-sevice

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI application code
COPY ./app /questions-service/app

# Expose the FastAPI port (8080)
EXPOSE 8080

# Run the FastAPI app with Uvicorn
CMD ["fastapi", "dev", "--app", "app.main:app", "--port", "8080"]
