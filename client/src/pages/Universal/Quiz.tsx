import { useState, useEffect, Fragment } from "react"
import Nav from "../../components/Nav"
import Container from "../../components/Container"
import Loading from "../../components/Loading"
import { Breadcrumbs, BreadcrumbItem, Divider, RadioGroup, Radio, Checkbox, Button, Tooltip } from "@nextui-org/react"
import { useParams } from "react-router-dom"
import AccessChecker from "../../components/functions/AccessChecker"
import client from "../../components/instance"
import GetLesson from "../../components/functions/GetLesson"
import GetCourse from "../../components/functions/GetCourse"
import { toast } from "react-toastify"
import shuffleArray from "../../components/functions/Shuffle"
import { Dot } from "react-bootstrap-icons"
import Error from "./Error"

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
    const [answers, setAnswers] = useState<{ question: string, answer: string[], saved: boolean }[]>([])
    const [active, setActive] = useState<number>(0)
    const [name, setName] = useState<string>("")
    const [roles, setRoles] = useState<string[]>([])
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [grade, setGrade] = useState<number>(0)
    const [logged, setLogged] = useState<boolean>(true)

    useEffect(() => {
        AccessChecker(0).then((res) => {
            if (res.code === 200) {
                setName(`${res.data.firstName} ${res.data.lastName}`)
                setRoles(res.data.role)
                GetCourse(courseId!).then((course) => {
                    if (course.error) {
                       
                    } else {
                        setCourseData(course.data)
                    }
                    GetLesson(courseId!, unitId!, quizId!).then((res: { error: boolean, data: any }) => {
                        if (res.error) {
                            
                        } else {
                            console.log(res.data)
                            if (res.data.questions.length > 0) {
                                let questionsArray = JSON.parse(res.data.questions)
                                questionsArray = shuffleArray(questionsArray)
                                let answerArray: { question: string, answer: string[], saved: boolean }[] = []
                                for (let i = 0; i < questionsArray.length; i++) {
                                    questionsArray[i].answers = shuffleArray(questionsArray[i].answers)
                                }
                                for (let i = 0; i < questionsArray.length; i++) {
                                    answerArray.push({ question: questionsArray[i].question, answer: [], saved: false })
                                }
                                setQuestions(questionsArray)
                                setAnswers(answerArray)
                                setGrade(res.data.grade)
                                setQuizData(res.data)
                                setLoading(false)
                            } else {
                                window.location.assign(`/courses/${courseId}`)
                            }
                        }
                    })
                })
            } else if (res.code === 500) {
                window.location.assign("/error")
            } else if (res.code === 401) {
                setLogged(false)
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
            console.log(questions)
            const grade = gradeQuiz()
            const total = questions.length
            const percent = Math.round((grade / total) * 100)
            setGrade(percent)
            await client.post("/content/update-lesson-progress", {
                course_url: courseId,
                unit_url: unitId,
                url: quizId,
                progress: percent
            })
            toast.success("Successfully submitted quiz!")
            setSubmitted(true)
        } catch (error: any) {
            console.error(error)
            console.error(error.response.msg)
        }
    }

    if (loading) {
        return <Loading />
    } else if (logged === false) {
        return <Error type="403" />
    } else if (submitted) {
        return (
            <Container>
                <Nav role={roles} name={name} />
                <div className="w-full h-full flex flex-col-reverse md:flex-row max-h-full overflow-hidden">
                    <div aria-label="side-menu" className="w-full h-[300px] md:h-full flex md:w-1/5 justify-center border border-r-gray-200 overflow-y-auto">
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
                                        <Tooltip content={"Unanswered"} placement="top" size="sm" closeDelay={0}>
                                            <Dot className="ml-auto text-primary" style={{ display: answers[index].saved ? "none" : "" }} size={25} />
                                        </Tooltip>
                                    </div>
                                ))
                            }
                            <Button className="w-full flex-shrink-0" onClick={submitQuiz} color="primary" isDisabled={answers.findIndex(i => i.saved === false) >= 0}>Submit Quiz</Button>
                        </div>
                    </div>
                    <div className="w-full lg:w-4/5 p-10 flex flex-col gap-y-5 overflow-y-auto">
                        <div className="flex flex-col gap-y-2">
                            <p className="text-lg">Question {active + 1}</p>
                            <p className="text-2xl">{questions[active].question}</p>
                        </div>
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
                                                            newAnswers[active].saved = true
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
                                                        }
                                                        if (newAnswers[active].answer.length === 0) {
                                                            newAnswers[active].saved = false
                                                        } else {
                                                            newAnswers[active].saved = true
                                                        }
                                                        setAnswers(newAnswers)
                                                    }}>{item.answer}</Checkbox>
                                                ))
                                            }
                                        </div>
                                    )
                                } else if (item.questionType === "true-false") {
                                    return (
                                        <RadioGroup className="mt-3 w-5/6 lg:w-1/2" style={{ display: active === index ? "" : "none" }} key={index}>
                                            {
                                                questions[active].answers.map((item, index) => (
                                                    <Fragment key={index}>
                                                        <Radio value={index.toString()} color={item.answer === "True" ? "primary" : "danger"} onClick={() => {
                                                            const newAnswers = [...answers]
                                                            newAnswers[active].answer = [item.answer]
                                                            newAnswers[active].saved = true
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
    } else {
        return (
            <Container>
                <Nav role={roles} name={name} />
                <div className="w-full h-full flex flex-col-reverse md:flex-row max-h-full overflow-hidden">
                    <div aria-label="side-menu" className="w-full h-[300px] md:h-full flex md:w-1/5 justify-center border border-r-gray-200 overflow-y-auto">
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
                                        <Tooltip content={"Unanswered"} placement="top" size="sm" closeDelay={0}>
                                            <Dot className="ml-auto text-primary" style={{ display: answers[index].saved ? "none" : "" }} size={25} />
                                        </Tooltip>
                                    </div>
                                ))
                            }
                            <Button className="w-full flex-shrink-0" onClick={submitQuiz} color="primary" isDisabled={answers.findIndex(i => i.saved === false) >= 0}>Submit Quiz</Button>
                        </div>
                    </div>
                    <div className="w-full lg:w-4/5 p-10 flex flex-col gap-y-5 overflow-y-auto">
                        <div className="flex flex-col gap-y-2">
                            <p className="text-lg">Question {active + 1}</p>
                            <p className="text-2xl">{questions[active].question}</p>
                        </div>
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
                                                            newAnswers[active].saved = true
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
                                                        }
                                                        if (newAnswers[active].answer.length === 0) {
                                                            newAnswers[active].saved = false
                                                        } else {
                                                            newAnswers[active].saved = true
                                                        }
                                                        setAnswers(newAnswers)
                                                    }}>{item.answer}</Checkbox>
                                                ))
                                            }
                                        </div>
                                    )
                                } else if (item.questionType === "true-false") {
                                    return (
                                        <RadioGroup className="mt-3 w-5/6 lg:w-1/2" style={{ display: active === index ? "" : "none" }} key={index}>
                                            {
                                                questions[active].answers.map((item, index) => (
                                                    <Fragment key={index}>
                                                        <Radio value={index.toString()} color={item.answer === "True" ? "primary" : "danger"} onClick={() => {
                                                            const newAnswers = [...answers]
                                                            newAnswers[active].answer = [item.answer]
                                                            newAnswers[active].saved = true
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