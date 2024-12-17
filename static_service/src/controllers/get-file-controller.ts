import { createReadStream, existsSync } from "fs";

const UPLOAD_DIR = "./uploads/";

export async function getFileController(filename: string){
    const filePath = UPLOAD_DIR + filename;
    try{
      if(existsSync(filePath)){
        return new Response(createReadStream(filePath), {
          headers: {
            "Content-Type": Bun.file(filePath).type,
          },
        });
      }else {
        return new Response("File not found", { status: 404 });
      }
    } catch(err) {
      return new Response("File not found", { status: 404 });
    }
}