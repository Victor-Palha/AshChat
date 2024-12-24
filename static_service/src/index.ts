import { saveFileController } from "./controllers/save-file-controller";
import { getFileController } from "./controllers/get-file-controller";

const PORT = Number(process.env.PORT) || 3006;

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/upload") {
        const response = await saveFileController(req);
        return new Response(response.message, { status: response.status });
    }

    if (req.method === "GET" && url.pathname.startsWith("/files/")) {
        const filename = url.pathname.split("/files/")[1];
        const response = await getFileController(filename);
        return response;
    }

    return new Response("AshChat A3 Server", {
      status: 200,
    });
  },
});
