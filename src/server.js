const fastify = require("fastify")({ logger: true });
const path = require("path");
let cache = [];
fastify.register(require("@fastify/formbody"));
// Serve static files from the "public" directory
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname),
  prefix: "/", // optional: default '/'
});

// HTMX get request handler
fastify.get("/data", async (request, reply) => {
  // Send back a simple response or HTML snippet
  return createResponse(cache);
});

fastify.post("/data", async (request, reply) => {
  console.log("posted", request.body);
  const value = request.body.value;
  const index = cache.length;
  cache.push({ id: index, value });

  return createResponse(cache);
});

fastify.put("/data", async (request, reply) => {
  console.log("putted", request.body);
  const { id, value } = request.body;
  const data = cache.find((item) => item.id === Number(id));
  data = { id: Number(id), value };

  return createResponse(cache);
});

fastify.delete("/data", async (request, reply) => {
  console.log("deleted", request.body);
  const id = Number(request.body.id);
  cache = cache.filter((item) => item.id !== id);

  return createResponse(cache);
});

fastify.delete("/reset", async (request, reply) => {
  cache = [];

  return createResponse(cache);
});

function createResponse(data) {
  console.log(data);
  return data
    .map(({ id, value }) => {
      return `
        <li>
          <form>
            <input name="id" value="${id}" readonly />
            <input hx-put="data" hx-trigger="input" hx-target="[data-list]" hx-swap="innerHTML" name="value" value="${value}"/>
            <i hx-delete="data" hx-target="[data-list]" hx-swap="innerHTML">X</i>
          </form>
        </li>`;
    })
    .join("");
}
const start = async () => {
  try {
    await fastify.listen(3000);
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
