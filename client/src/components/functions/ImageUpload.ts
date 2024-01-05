import client from "../instance"

export default async function ImageUpload(data: string, name: string) {
    try {
        const response = await client.post("/content/file-upload", {
            fileData: data,
            fileName: name
        })
        return {
            data: response.data,
            error: false
        }
    } catch (error) {
        console.error(error)
        return {
            data: {},
            error: true
        }
    }
}