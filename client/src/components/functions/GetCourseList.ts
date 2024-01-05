import client from "../instance"

export default async function GetCourseList() {
    try {
        const res = await client.get(`/content/course-list`)
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