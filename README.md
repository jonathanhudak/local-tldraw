# Local Tldraw

Adds Redis-based persistence for storing [tldraw](https://github.com/tldraw/tldraw) drawings locally.

## Setup

Required [Docker](https://docs.docker.com/get-docker/)

```bash
docker-compose up

# open another terminal
npm run dev
```

## Redis Store

```bash
docker-compose up
```

Create Key/Value Pair

```bash
curl -X POST -H "Content-Type: application/json" -d '{"value":"myValue", "key": "fartz"}' http://localhost:8000/
```

Get Key/Value Pair

http://localhost:8000/fartz

Update Key/Value Pair

```bash
curl -X PUT -H "Content-Type: application/json" -d '{"value":"powerz"}' http://localhost:8000/fartz
```

Delete Key/Value Pair

```bash
curl -X DELETE http://localhost:8000/fartz
```




