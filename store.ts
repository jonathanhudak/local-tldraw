import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { connect } from "https://deno.land/x/redis/mod.ts";

const client = await connect({
  hostname: "redis-server",
  port: 6379,
});

const router = new Router();
router
  .get("/:key", async (context) => {
    const { key } = context.params;
    const value = await client.get(key!);
    context.response.body = { value };
  })

  .post("/", async (context) => {
    const { value, key } = await context.request.body().value;
    await client.set(key, value);
    context.response.body = { status: "success" };
  })
  .put("/:key", async (context) => {
    const { key } = context.params;
    const { value } = await context.request.body().value;
    await client.set(key!, value);
    context.response.body = { status: "success" };
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server is running on http://localhost:8000");
await app.listen({ port: 8000 });
