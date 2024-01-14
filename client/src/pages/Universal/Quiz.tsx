import { useState, useEffect, Fragment } from "react"
import Nav from "../../components/Nav"
import Container from "../../components/Container"
import Loading from "../../components/Loading"
import { Breadcrumbs, BreadcrumbItem, Divider, RadioGroup, Radio, Checkbox, Button } from "@nextui-org/react"
import { useParams } from "react-router-dom"
import AccessChecker from "../../components/functions/AccessChecker"
import client from "../../components/instance"
import GetLesson from "../../components/functions/GetLesson"
import GetCourse from "../../components/functions/GetCourse"
import { toast } from "react-toastify"
import shuffleArray from "../../components/functions/Shuffle"

export default function Quiz() {
    const { courseId, unitId, quizId } = useParams()
    const [loading, setLoading] = useState<boolean>(true)
    const [courseData, setCourseData] = useState<any>(null)
    const [quizData, setQuizData] = useState<any>(null)
    const [questions, setQuestions] = useState<{
        question: string,
        answers: { answer: string, correct: boolean, error: boolean }[],
        questionType: "multiple-choice" | "multi-select" | "true-false",
        saved: boolean,
        error: boolean
    }[]>([])
    const [answers, setAnswers] = useState<{ questions: string, answer: string[] }[]>([])
    const [active, setActive] = useState<number>(0)
    const [name, setName] = useState<string>("")
    const [roles, setRoles] = useState<string[]>([])
    const [logged, setLogged] = useState<boolean>(false)

    useEffect(() => {
        AccessChecker(0).then((res) => {
            if (res.code === 200) {
                setName(`${res.data.firstName} ${res.data.lastName}`)
                setRoles(res.data.role)
                GetCourse(courseId!).then((course) => {
                    if (course.error) {
                        window.location.assign("/error")
                    } else {
                        setCourseData(course.data)
                    }
                    GetLesson(courseId!, unitId!, quizId!).then((res: { error: boolean, data: any }) => {
                        if (res.error) {
                            window.location.assign("/error")
                        } else {
                            console.log(res.data)
                            if (res.data.questions.length > 0) {
                                setQuestions(shuffleArray(JSON.parse(res.data.questions)))
                                for (let i = 0; i < JSON.parse(res.data.questions).length; i++) {
                                    setAnswers((prevState) => [...prevState, { questions: JSON.parse(res.data.questions)[i].question, answer: [] }])
                                }
                            }
                            setQuizData(res.data)
                            setLoading(false)
                        }
                    })
                })
            } else if (res.code === 500) {
                window.location.assign("/error")
            } else if (res.code === 401) {
                setLogged(true)
            }
        })
    }, [])

    if (loading) {
        return <Loading />
    } else {
        return (
            <Container>
                <Nav role={roles} name={name} />
                <div className="w-full h-full flex flex-col-reverse md:flex-row max-h-full overflow-hidden">
                    <div aria-label="side-menu" className="w-full h-full flex md:w-1/5 justify-center border border-r-gray-200 overflow-y-auto">
                        <div className="w-5/6 mt-5 gap-y-3 flex flex-col items-start">
                            <Breadcrumbs size="lg">
                                <BreadcrumbItem href={`/courses/${courseId}`}>{courseData.title}</BreadcrumbItem>
                                <BreadcrumbItem href={`/courses/${courseId}`}>{courseData.units[courseData.units.findIndex((i: any) => i.url === unitId)].title}</BreadcrumbItem>
                            </Breadcrumbs>
                            <div className="text-3xl flex flex-row items-center gap-x-5">
                                {quizData.title}
                            </div>
                            <Divider />
                            {
                                questions.map((_item, index) => (
                                    <div key={index} className="cursor-pointer select-none flex flex-row items-center w-full">
                                        <p style={index === active ? { color: "#006FEE", fontWeight: "bold" } : {}} onClick={() => {
                                            setActive(index)
                                        }}>
                                            Question {index + 1}
                                        </p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <div className="w-full lg:w-4/5 p-10 flex flex-col gap-y-5 overflow-y-auto">
                        <p className="text-3xl">Question {active + 1}</p>
                        {
                            questions.map((item, index) => {
                                if (item.questionType === "multiple-choice") {
                                    return (
                                        <RadioGroup key={index} className="mt-3 w-5/6 lg:w-1/2" style={{ display: active === index ? "" : "none" }}>
                                            {
                                                questions[active].answers.map((item, index) => (
                                                    <Fragment key={index}>
                                                        <Radio value={index.toString()} color="success" onClick={() => {
                                                            const newAnswers = [...answers]
                                                            newAnswers[active].answer = [item.answer]
                                                            setAnswers(newAnswers)
                                                        }}>{item.answer}</Radio>
                                                    </Fragment>
                                                ))
                                            }
                                        </RadioGroup >
                                    )
                                } else if (item.questionType === "multi-select") {
                                    return (
                                        <div className="flex flex-col gap-y-2 mt-3" key={index} style={{ display: active === index ? "" : "none" }}>
                                            {
                                                questions[active].answers.map((item, index) => (
                                                    <Checkbox color="success" key={index} onClick={() => {
                                                        const newAnswers = [...answers]
                                                        if (newAnswers[active].answer.includes(item.answer)) {
                                                            newAnswers[active].answer.splice(newAnswers[active].answer.indexOf(item.answer), 1)
                                                        } else {
                                                            newAnswers[active].answer.push(item.answer)
                                                            setAnswers(newAnswers)
                                                        }
                                                    }}>{item.answer}</Checkbox>
                                                ))
                                            }
                                        </div>
                                    )
                                } else if (item.questionType === "true-false") {
                                    return (
                                        <RadioGroup className="mt-3 w-5/6 lg:w-1/2" style={{ display: active === index ? "" : "none" }}>
                                            {
                                                questions[active].answers.map((item, index) => (
                                                    <Fragment key={index}>
                                                        <Radio value={index.toString()} color={item.answer === "True" ? "primary" : "danger"} onClick={() => {
                                                            const newAnswers = [...answers]
                                                            newAnswers[active].answer = [item.answer]
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
                    </div>
                </div>
            </Container >
        )
    }
}