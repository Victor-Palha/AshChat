import { saveFileService } from "../services/save-file-service";

type SaveFileControllerResponse = {
    message: string;
    status: number;
}
export async function saveFileController(req: Request): Promise<SaveFileControllerResponse> {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
        return {
            message: "File not found",
            status: 400,
        }
    }

    try {
        const pathName = await saveFileService(file);
        return {
            message: `${pathName}`,
            status: 201,
        };
    } catch (error) {
        return {
            message: "Internal server error",
            status: 500,
        }
    }
};