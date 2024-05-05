import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { nanoid } from "nanoid";
import { generateNewFileName } from "./utils";

type Bindings = {
  BUCKET: R2Bucket;
  DB: D1Database;
};

const exhibits = new Hono<{ Bindings: Bindings }>();

exhibits.get("/", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM exhibits").all();
    return c.json({ data: results });
  } catch (error) {
    return c.json(
      {
        error: error.message,
      },
      404
    );
  }
});

exhibits.post("/", async (c) => {
  const mediaKey = nanoid();

  const body = await c.req.parseBody();
  const image = body.image as File;
  const audio = body.audio as File;

  const imagePutResponse = await c.env.BUCKET.put(
    generateNewFileName(mediaKey, image),
    image
  );

  const audioPutResponse = await c.env.BUCKET.put(
    generateNewFileName(mediaKey, audio),
    audio
  );

  const { success } = await c.env.DB.prepare(
    `insert into exhibits (artist, title, medium, details, artist_statement, image_key, audio_key) values (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      body.artistName,
      body.title,
      body.medium,
      body.details,
      body.artistStatement,
      imagePutResponse.key,
      audioPutResponse.key
    )
    .run();

  if (success) {
    return c.json({ success }, 201);
  } else {
    throw new HTTPException(500, { message: "Failed to insert exhibit" });
  }
});

export default exhibits;
