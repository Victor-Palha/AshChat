import { createReadStream, existsSync } from "fs";
import { join } from "path";

const UPLOAD_DIR = "./uploads";

export async function getFileController(filename: string){
    const filePath = join(UPLOAD_DIR, filename);

    if (existsSync(filePath)) {
      return new Response(createReadStream(filePath), {
        headers: {
          "Content-Type": Bun.file(filePath).type,
        },
      });
    } else {
      return new Response("File not found", { status: 404 });
    }
}