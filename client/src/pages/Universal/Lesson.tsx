import { useEffect, useState, Fragment, useRef } from "react"
import { useParams } from "react-router-dom"
import Loading from "../../components/Loading"
import Container from "../../components/Container"
import Nav from "../../components/Nav"
import AccessChecker from "../../components/functions/AccessChecker"
import GetLesson from "../../components/functions/GetLesson"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import GetCourse from "../../components/functions/GetCourse"
import { Divider, RadioGroup, Radio, Checkbox, Card, CardBody, CardHeader, CardFooter, Button } from "@nextui-org/react"
import { ChevronLeft } from "react-bootstrap-icons"
import { toast } from "react-toastify"
import client from "../../components/instance"

export default function Lesson() {
    const [loading, setLoading] = useState<boolean>(true)
    const [name, setName] = useState<string | null>(null)
    const [role, setRole] = useState<string[] | null>(null)
    const [content, setContent] = useState<any>(null)
    const [active, setActive] = useState<number>(0)
    const [courseData, setCourseData] = useState<any>(null)
    const [videoUrl, setVideoUrl] = useState<string>("")
    const { courseId, unitId, lessonId } = useParams()
    const [questions, setQuestions] = useState<{
        question: string,
        answers: { answer: string, correct: boolean, error: boolean }[],
        questionType: "multiple-choice" | "multi-select" | "true-false",
        saved: boolean,
        error: boolean
    }[]>([])
    const [answers, setAnswers] = useState<{ question: string, answer: string[], saved: boolean }[]>([])
    const [activeQuestion, setActiveQuestion] = useState<number>(0)
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [grade, setGrade] = useState<number>(0)
    const [logged, setLogged] = useState<boolean>(true)
    const [startQuiz, setStartQuiz] = useState<boolean>(false)
    const toastId = useRef<any>(null)

    useEffect(() => {
        AccessChecker(-1).then((res) => {
            if (res.code === 200) {
                setName(`${res.data.firstName} ${res.data.lastName}`)
                setRole(res.data.role)
                setLogged(true)
                GetCourse(courseId!).then((course) => {
                    setCourseData(course.data)
                    setActive(course.data.units[course.data.units.findIndex((i: any) => i.url === unitId)].lessons.findIndex((i: any) => i.url === lessonId))
                    GetLesson(courseId!, unitId!, lessonId!).then((res: { error: boolean, data: any }) => {
                        if (res.error) {

                        } else {
                            setContent(res.data)
                            if (res.data.type === "article") {
                                setContent((prevState: any) => ({
                                    ...prevState,
                                    markdown: prevState.markdown.replace(/(<img("[^"]*"|[^\/">])*)>/gi, "$1/>")
                                }))
                                setLoading(false)
                            } else if (res.data.type === "quiz") {
                                console.log(res.data)
                                if (res.data.questions.length > 0) {
                                    let questionsArray = JSON.parse(res.data.questions)
                                    let answerArray: { question: string, answer: string[], saved: boolean }[] = []
                                    for (let i = 0; i < questionsArray.length; i++) {
                                        answerArray.push({ question: questionsArray[i].question, answer: [], saved: false })
                                    }
                                    setQuestions(questionsArray)
                                    setAnswers(answerArray)
                                    setGrade(res.data.progress)
                                    console.log(questionsArray)
                                    setLoading(false)
                                } else {
                                    window.location.assign(`/courses/${courseId}`)
                                }
                            } else if (res.data.type === "video") {
                                setVideoUrl(res.data.videoUrl)
                                setLoading(false)
                            }
                        }
                    })
                })
            } else if (res.code === 500) {
                window.location.assign("/error")
            }
        })
    }, [])

    const gradeQuiz = () => {
        let grade = 0
        for (let i = 0; i < questions.length; i++) {
            if (questions[i].questionType === "multiple-choice") {
                for (let j = 0; j < questions[i].answers.length; j++) {
                    if (questions[i].answers[j].correct) {
                        if (answers[i].answer[0] === questions[i].answers[j].answer) {
                            grade++
                        }
                    }
                }
            } else if (questions[i].questionType === "multi-select") {
                let totalCorrectAnswers = 0
                let correctAnswers = 0
                let selectedIncorrectAnswers = 0
                for (let j = 0; j < questions[i].answers.length; j++) {
                    if (questions[i].answers[j].correct) {
                        totalCorrectAnswers++
                        for (let k = 0; k < answers[i].answer.length; k++) {
                            if (questions[i].answers[j].answer !== answers[i].answer[k]) {
                                selectedIncorrectAnswers++
                            } else if (questions[i].answers[j].answer === answers[i].answer[k]) {
                                correctAnswers++
                            }
                        }
                    }
                }
                grade += ((correctAnswers) / (totalCorrectAnswers + selectedIncorrectAnswers))
            } else if (questions[i].questionType === "true-false") {
                for (let j = 0; j < questions[i].answers.length; j++) {
                    if (questions[i].answers[j].correct) {
                        if (answers[i].answer[0] === questions[i].answers[j].answer) {
                            grade++
                        }
                    }
                }
            }
        }
        return grade
    }

    const submitQuiz = async () => {
        try {
            toastId.current = toast.loading("Submitting quiz...")
            console.log(questions)
            const grade = gradeQuiz()
            const total = questions.length
            const percent = Math.round((grade / total) * 100)
            setGrade(percent)
            await client.post("/content/update-lesson-progress", {
                course_url: courseId,
                unit_url: unitId,
                url: lessonId,
                progress: percent
            })
            toast.update(toastId.current, {
                render: "Quiz submitted successfully!",
                type: "success",
                isLoading: false,
                autoClose: 1500,
                hideProgressBar: true
            })
            setSubmitted(true)
        } catch (error: any) {
            console.error(error)
            console.error(error.response.msg)
        }
    }

    if (loading) {
        return <Loading />
    } else {
        return (
            <Container>
                <Nav role={role} name={name} />
                <div className="flex flex-col-reverse md:flex-row w-full h-full overflow-hidden">
                    <div aria-label="side-menu" className="h-[300px] md:h-full flex justify-center md:w-1/5 border border-r-gray-200 overflow-y-auto">
                        <div className="w-5/6 mt-5 gap-y-5 flex flex-col items-start">
                            <div className="flex flex-col gap-y-1">
                                <p className="text-sm cursor-pointer select-none flex flex-row items-center gap-x-2" onClick={() => {
                                    window.location.assign(`/courses/${courseId}`)
                                }}><ChevronLeft />{courseData.title}</p>
                                <h1 className="text-lg md:text-lg lg:text-2xl">{courseData.units[courseData.units.findIndex((i: any) => i.url === unitId)].title}</h1>
                            </div>
                            <Divider />
                            {
                                courseData.units && courseData.units.length > 0 ? courseData.units[courseData.units.findIndex((i: any) => i.url === unitId)].lessons.map((item: any, index: number) => (
                                    <div className="font-bold select-none cursor-pointer w-full flex flex-col" key={index} onClick={() => {
                                        if (item.url === lessonId) return
                                        if (item.type === "quiz") {
                                            window.location.assign(`/courses/${courseId}/unit/${unitId}/quiz/${item.url}`)
                                        } else if (item.type === "video") {
                                            window.location.assign(`/courses/${courseId}/unit/${unitId}/video/${item.url}`)
                                        } else if (item.type === "article") {
                                            window.location.assign(`/courses/${courseId}/unit/${unitId}/lesson/${item.url}`)
                                        }
                                    }} style={{
                                        color: index === active ? "#006FEE" : "inherit"
                                    }}>
                                        <p>{
                                            item.type === "quiz" ? "Assessment:" : item.type === "video" ? "Video:" : item.type === "article" ? "Lesson:" : ""
                                        }</p>
                                        <p className="w-[calc(100%)] whitespace-nowrap overflow-hidden overflow-ellipsis">{item.title}</p>
                                    </div>
                                )) : (
                                    <></>
                                )
                            }
                        </div>
                    </div>
                    <div className="w-full md:w-4/5 h-full max-h-full overflow-y-auto p-10">
                        {
                            content.type === "video" ? (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <h1 className="text-3xl">{content.title}</h1>
                                    <iframe className="mt-7" width="700" height="450" src={videoUrl} allowFullScreen></iframe>
                                </div>
                            ) : (
                                <></>
                            )
                        }
                        {
                            content.type === "Lesson" ? (
                                <>
                                    <h1 className="pb-5">{courseData.units[courseData.units.findIndex((i: any) => i.url === unitId)].lessons[active].title}</h1>
                                    <Markdown rehypePlugins={[rehypeRaw]}>{content.markdown}</Markdown>
                                </>
                            ) : (
                                <></>
                            )
                        }
                        {
                            content.type === "quiz" && !startQuiz ? (
                                <>
                                    <Card className="p-5">
                                        <CardHeader>
                                            <h1 className="text-3xl">{content.title}</h1>
                                        </CardHeader>
                                        <Divider />
                                        <CardBody>
                                            {grade >= 0 ? (
                                                <p className="text-2xl">You scored {grade}%</p>
                                            ) : (
                                                <h3>Are you ready?</h3>
                                            )}
                                        </CardBody>
                                        <CardFooter className="flex flex-row justify-end">
                                            <Button color="primary" onClick={() => {
                                                setStartQuiz(true)
                                            }}>Start Quiz</Button>
                                        </CardFooter>
                                    </Card>
                                </>
                            ) : (
                                <></>
                            )
                        }
                        {
                            content.type === "quiz" && startQuiz && submitted ? (
                                <>
                                    <Card className="p-5">
                                        <CardHeader>
                                            <h1 className="text-3xl">{content.title}</h1>
                                        </CardHeader>
                                        <Divider />
                                        <CardBody>
                                            <p className="text-2xl">You scored {grade}%</p>
                                        </CardBody>
                                        <CardFooter className="flex flex-row justify-end">
                                            <Button color="primary" onClick={() => {
                                                window.location.assign(`/courses/${courseId}`)
                                            }}>Return to Course</Button>
                                        </CardFooter>
                                    </Card>
                                </>
                            ) : (
                                <></>
                            )
                        }
                        {
                            content.type === "quiz" && startQuiz && !submitted ? (
                                <>
                                    <Card className="p-5">
                                        <CardHeader>Question {activeQuestion + 1}</CardHeader>
                                        <Divider />
                                        <CardBody>
                                            <p className="text-2xl">{questions[activeQuestion].question}</p>
                                            {
                                                questions.map((item, index) => {
                                                    if (item.questionType === "multiple-choice") {
                                                        return (
                                                            <RadioGroup key={index} className="mt-3 w-5/6 lg:w-1/2" style={{ display: activeQuestion === index ? "" : "none" }}>
                                                                {
                                                                    questions[activeQuestion].answers.map((item, index) => (
                                                                        <Fragment key={index}>
                                                                            <Radio value={index.toString()} color="success" onClick={() => {
                                                                                const newAnswers = [...answers]
                                                                                newAnswers[activeQuestion].answer = [item.answer]
                                                                                newAnswers[activeQuestion].saved = true
                                                                                setAnswers(newAnswers)
                                                                            }}>{item.answer}</Radio>
                                                                        </Fragment>
                                                                    ))
                                                                }
                                                            </RadioGroup >
                                                        )
                                                    } else if (item.questionType === "multi-select") {
                                                        return (
                                                            <div className="flex flex-col gap-y-2 mt-3" key={index} style={{ display: activeQuestion === index ? "" : "none" }}>
                                                                {
                                                                    questions[activeQuestion].answers.map((item, index) => (
                                                                        <Checkbox color="success" key={index} onClick={() => {
                                                                            const newAnswers = [...answers]
                                                                            if (newAnswers[activeQuestion].answer[index] === item.answer) {
                                                                                newAnswers[activeQuestion].answer.splice(newAnswers[activeQuestion].answer.indexOf(item.answer), 1)
                                                                            } else {
                                                                                newAnswers[activeQuestion].answer.push(item.answer)
                                                                            }
                                                                            if (newAnswers[activeQuestion].answer.length === 0) {
                                                                                newAnswers[activeQuestion].saved = false
                                                                            } else {
                                                                                newAnswers[activeQuestion].saved = true
                                                                            }
                                                                            setAnswers(newAnswers)
                                                                        }}>{item.answer}</Checkbox>
                                                                    ))
                                                                }
                                                            </div>
                                                        )
                                                    } else if (item.questionType === "true-false") {
                                                        return (
                                                            <RadioGroup className="mt-3 w-5/6 lg:w-1/2" style={{ display: activeQuestion === index ? "" : "none" }} key={index}>
                                                                {
                                                                    questions[activeQuestion].answers.map((item, index) => (
                                                                        <Fragment key={index}>
                                                                            <Radio value={index.toString()} color={item.answer === "True" ? "primary" : "danger"} onClick={() => {
                                                                                const newAnswers = [...answers]
                                                                                newAnswers[activeQuestion].answer = [item.answer]
                                                                                newAnswers[activeQuestion].saved = true
                                                                                setAnswers(newAnswers)
                                                                            }}>{item.answer}</Radio>
                                                                        </Fragment>
                                                                    ))
                                                                }
                                                            </RadioGroup >
                                                        )
                                                    }
                                                })
                                            }
                                        </CardBody>
                                        <Divider />
                                        <CardFooter className="flex flex-row flex-wrap gap-x-2 justify-end items-center">
                                            <Button isDisabled={activeQuestion === 0} onClick={() => {
                                                setActiveQuestion((prevState) => prevState - 1)
                                            }}>Previous</Button>
                                            <Button color={
                                                (answers.findIndex(i => i.saved === false) === -1 && activeQuestion === questions.length - 1) ? "primary" : (answers[activeQuestion].saved && activeQuestion !== questions.length - 1) ? "primary" : "default"
                                            } isDisabled={
                                                answers.findIndex(i => i.saved === false) >= 0 && activeQuestion === questions.length - 1
                                            } onClick={() => {
                                                if (activeQuestion === questions.length - 1) {
                                                    submitQuiz()
                                                } else {
                                                    setActiveQuestion((prevState) => prevState + 1)
                                                }
                                            }}>
                                                {activeQuestion === questions.length - 1 ? "Submit" : "Next"}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </>
                            ) : (
                                <></>
                            )
                        }
                    </div>
                </div>
            </Container >
        )
    }
}