import { saveFileController } from "./controllers/save-file-controller";
import { getFileController } from "./controllers/get-file-controller";

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Rota para upload de arquivos
    if (req.method === "POST" && url.pathname === "/upload") {
        const response = await saveFileController(req);
        return new Response(response.message, { status: response.status });
    }

    // Rota para buscar arquivos
    if (req.method === "GET" && url.pathname.startsWith("/files/")) {
        const filename = url.pathname.split("/files/")[1];
        const response = await getFileController(filename);
        return response;
    }

    // Rota padrão
    return new Response("AshChat A3 Server", {
      status: 200,
    });
  },
});
