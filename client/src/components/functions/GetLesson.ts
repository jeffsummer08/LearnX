import client from "../instance"

export default async function GetLesson(course_url: string, unit_url: string, lesson_url: string) {
    try {
        const res = await client.get(`/content/lesson/${course_url}/${unit_url}/${lesson_url}`)
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