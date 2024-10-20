FROM python:3.12-alpine

WORKDIR /matching-service

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . /matching-service

EXPOSE 8080

CMD ["fastapi", "run", "--port", "8080"]