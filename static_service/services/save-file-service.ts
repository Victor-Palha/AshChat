import { randomUUID } from "crypto";
import { join } from "path";

const UPLOAD_DIR = "./uploads";

export async function saveFileService(file: any): Promise<string> {
    const randomName = randomUUID();
    const extFile = file.name.split('.').pop();
    const filename = randomName+"."+extFile
    const filePath = join(UPLOAD_DIR, filename);
    const buffer = await file.arrayBuffer();
    await Bun.write(filePath, buffer);
    return filename;
  }