import Container from "../../components/Container"
import Nav from "../../components/Nav"
import { useState, useEffect, useRef } from "react"
import AccessChecker from "../../components/functions/AccessChecker"
import Loading from "../../components/Loading"
import Error from "../Universal/Error"
import TextEditor from "../../components/TextEditor"
import { MDXEditorMethods } from "@mdxeditor/editor"

export default function EditLesson() {
    const [loading, setLoading] = useState(true)
    const [valid, setValid] = useState<boolean | null>(null)
    const editorRef = useRef<MDXEditorMethods>(null)
    useEffect(() => {
        AccessChecker(2).then((res) => {
            if (res.code === 200) {
                setLoading(false)
                setValid(true)
            } else if (res.code === 401) {
                window.location.assign("/login")
            } else if (res.code === 500) {
                window.location.assign("/error")
            } else if (res.code === 403) {
                setValid(false)
            }
        })
    }, [])

    const showMarkdown = () => {
        console.log(editorRef.current?.getMarkdown())
    }

    if (loading) {
        return <Loading />
    } else if (valid === false) {
        return <Error type="403" />
    } else if (valid === true) {
        return (
            <Container>
                <Nav />
                <div className="flex flex-col items-center justify-center w-full h-full max-h-full py-5">
                    <div className="h-[10%]">
                        <p className="text-2xl">Create Lesson</p>
                        <button onClick={showMarkdown}>Show Markdown</button>
                    </div>
                    <div className="border border-gray-400 h-[90%] max-h-[90%] rounded-md mt-5 w-3/4 overflow-hidden textEditor">
                        <TextEditor editorRef={editorRef} />
                    </div>
                </div>
            </Container>
        )
    }
}