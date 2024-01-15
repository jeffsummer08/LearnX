import client from "../instance"

export default async function GetClassList() {
    try {
        const res = await client.get("/classes")
        return {
            data: res.data,
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