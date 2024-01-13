FROM denoland/deno

EXPOSE 8000

WORKDIR /app

USER deno

COPY store.ts .
RUN deno cache --reload store.ts

CMD ["run", "--allow-net", "--allow-read", "store.ts"]