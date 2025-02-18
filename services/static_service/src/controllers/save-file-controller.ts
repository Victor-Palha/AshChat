import { randomUUID } from "crypto";
import { saveFileService } from "../services/save-file-service";

type SaveFileControllerResponse = {
    message: string;
    status: number;
}
export async function saveFileController(req: Request): Promise<SaveFileControllerResponse> {
    const formData = await req.formData();
    const entries = [...formData.entries()];

    if (entries.length === 0) {
        return {
            message: "No files were uploaded",
            status: 400,
        };
    }

    let file = formData.get(entries[0][0]) as any;

    if (typeof file === "string") {
        const regex = /filename=([^;]+)/;
        const match = entries[0][0].match(regex);
        const fileName = match ? match[1].trim() : "default-file.txt";
        const buffer = Buffer.from(file, "base64") as any;
        file = new File([buffer], fileName, { type: "application/octet-stream" });
    }

    if (!(file instanceof File)) {
        return {
            message: "Invalid file format",
            status: 400,
        };
    }

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    try {
        const pathName = await saveFileService(new File([file], sanitizedFileName, { type: file.type }));
        return {
            message: `${pathName}`,
            status: 201,
        };
    } catch (error) {
        console.error("Error saving file: ", error);
        return {
            message: "Internal server error",
            status: 500,
        };
    }
};