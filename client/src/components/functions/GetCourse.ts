import client from "../instance"

export default async function GetCourse(id: string) {
    try {
        const res = await client.get(`/content/course/${id}`)
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