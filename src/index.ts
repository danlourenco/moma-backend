import { Hono } from "hono";
import { cors } from "hono/cors";
import exhibitsApi from "./exhibits";

const api = new Hono().basePath("/api");

api.use(cors());
api.route("/exhibits", exhibitsApi);

api.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default api;
