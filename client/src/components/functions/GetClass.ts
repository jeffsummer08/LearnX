import client from "../instance"

export default async function GetClass(code: string) {
    try {
        const res = await client.get(`/classes/${code}`)
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