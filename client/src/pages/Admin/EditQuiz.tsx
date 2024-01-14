import { useState, useEffect, Fragment } from "react"
import Nav from "../../components/Nav"
import Container from "../../components/Container"
import Loading from "../../components/Loading"
import { Breadcrumbs, BreadcrumbItem, Divider, RadioGroup, Radio, Select, SelectItem, Input, Checkbox, Tooltip, Button } from "@nextui-org/react"
import { Dot, UiChecks, UiRadiosGrid, SquareHalf, Save, Trash, PlusCircle } from "react-bootstrap-icons"
import { useParams } from "react-router-dom"
import AccessChecker from "../../components/functions/AccessChecker"
import client from "../../components/instance"
import GetLesson from "../../components/functions/GetLesson"
import GetCourse from "../../components/functions/GetCourse"
import { toast } from "react-toastify"

export default function EditQuiz() {
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
    }[]>([
        {
            question: "Question",
            answers: [
                {
                    answer: "Answer 1",
                    correct: true,
                    error: false
                },
                {
                    answer: "Answer 2",
                    correct: false,
                    error: false
                },
                {
                    answer: "Answer 3",
                    correct: false,
                    error: false
                },
                {
                    answer: "Answer 4",
                    correct: false,
                    error: false
                }
            ],
            questionType: "multiple-choice",
            saved: false,
            error: false
        }
    ])
    const [active, setActive] = useState<number>(0)
    const [name, setName] = useState<string>("")
    const [roles, setRoles] = useState<string[]>([])

    useEffect(() => {
        AccessChecker(2).then((res) => {
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
                                setQuestions(JSON.parse(res.data.questions))
                            }
                            setQuizData(res.data)
                            setLoading(false)
                        }
                    })
                })
            } else if (res.code === 500) {
                window.location.assign("/error")
            } else if (res.code === 401) {
                window.location.assign("/login")
            }
        })
    }, [])

    const validate = (questions: {
        question: string,
        answers: { answer: string, correct: boolean, error: boolean }[],
        questionType: "multiple-choice" | "multi-select" | "true-false",
        saved: boolean,
        error: boolean
    }[]) => {
        
        const newQuestions = [...questions]
        for (let i = 0; i < newQuestions.length; i++) {
            if (newQuestions[i].question === "") {
                newQuestions[i].error = true
                return false
            } else {
                newQuestions[i].error = false
                for (let j = 0; j < newQuestions[i].answers.length; j++) {
                    if (newQuestions[i].answers[j].answer === "") {
                        newQuestions[i].answers[j].error = true
                        return false
                    } else {
                        newQuestions[i].answers[j].error = false
                    }
                }
            }
        }
        setQuestions(newQuestions)
        return true
    }

    const saveQuiz = async (questions: {
        question: string,
        answers: { answer: string, correct: boolean, error: boolean }[],
        questionType: "multiple-choice" | "multi-select" | "true-false",
        saved: boolean,
        error: boolean
    }[]) => {
        const valid = validate(questions)
        if (valid) {
            for (let i = 0; i < questions.length; i++) {
                const newQuestions = [...questions]
                newQuestions[i].saved = true
                setQuestions(newQuestions)
            }
            try {
                toast.promise(
                    client.post("/content/edit-lesson", {
                        type: "quiz",
                        course_url: courseId,
                        unit_url: unitId,
                        url: quizId,
                        update_url: quizId,
                        title: quizData.title,
                        questions: JSON.stringify(questions)
                    }),
                    {
                        pending: "Saving quiz...",
                        success: "Quiz saved successfully.",
                        error: "An unexpected error occurred."
                    }
                )
            } catch (error) {
                console.error(error)
            }
        } else {
            toast.error("Please fill out all required fields.")
        }
    }

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
                                <BreadcrumbItem>{quizData.title}</BreadcrumbItem>
                            </Breadcrumbs>
                            <div className="text-3xl flex flex-row items-center gap-x-5">
                                Edit Quiz
                                <div className="flex flex-row gap-x-3">
                                    <Tooltip content="Save Quiz" color="primary" size="sm">
                                        <Save size={15} className="select-none cursor-pointer hover:text-primary" onClick={() => {
                                            saveQuiz(questions).then(() => {
                                                GetLesson(courseId!, unitId!, quizId!).then((res: { error: boolean, data: any }) => {
                                                    if (res.error) {
                                                        window.location.assign("/error")
                                                    } else {
                                                        setQuizData(res.data)
                                                    }
                                                })
                                            })
                                        }} />
                                    </Tooltip>
                                </div>
                            </div>
                            <Divider />
                            {
                                questions.map((item, index) => (
                                    <div key={index} className="cursor-pointer select-none flex flex-row items-center w-full">
                                        <p style={index === active ? { color: "#006FEE", fontWeight: "bold" } : {}} onClick={() => {
                                            setActive(index)
                                        }}>
                                            Question {index + 1}
                                        </p>
                                        <Tooltip content="Unsaved" size="sm" closeDelay={0}>
                                            <Dot size={25} className="text-primary" style={{ display: (item.saved || item.error) ? "none" : "" }} />
                                        </Tooltip>
                                        <Tooltip content="Error" color="danger" size="sm" closeDelay={0}>
                                            <Dot size={25} className="text-danger" style={{ display: item.saved || !item.error ? "none" : "" }} />
                                        </Tooltip>
                                        <Tooltip isDisabled={questions.length < 2} content="Delete Question" color="danger" size="sm" closeDelay={0}>
                                            <Trash size={15} className={questions.length > 1 ? "select-none cursor-pointer hover:text-danger ml-auto" : "select-none cursor-default ml-auto text-gray-400"} onClick={() => {
                                                if (questions.length > 1) {
                                                    const newQuestions = [...questions]
                                                    newQuestions.splice(index, 1)
                                                    setQuestions(newQuestions)
                                                    if (index === 0) {
                                                        setActive(0)
                                                    } else if (index < questions.length - 1) {
                                                        setActive(index)
                                                    } else {
                                                        setActive(index - 1)
                                                    }
                                                }
                                            }} />
                                        </Tooltip>
                                    </div>
                                ))
                            }
                            <Button className="w-full flex flex-row items-center justify-center" onClick={() => {
                                setQuestions([...questions, {
                                    question: "Question",
                                    answers: [
                                        {
                                            answer: "Answer 1",
                                            correct: true,
                                            error: false
                                        },
                                        {
                                            answer: "Answer 2",
                                            correct: false,
                                            error: false
                                        },
                                        {
                                            answer: "Answer 3",
                                            correct: false,
                                            error: false
                                        },
                                        {
                                            answer: "Answer 4",
                                            correct: false,
                                            error: false
                                        }
                                    ],
                                    questionType: "multiple-choice",
                                    saved: false,
                                    error: false
                                }])
                                setActive(questions.length)
                            }}>
                                <PlusCircle size={15} className="select-none cursor-pointer" />
                                <p>Create question</p>
                            </Button>
                        </div>
                    </div>
                    <div className="w-full lg:w-4/5 p-10 flex flex-col gap-y-5 overflow-y-auto">
                        <Select variant="bordered" selectedKeys={
                            [questions[active].questionType ? questions[active].questionType : "multiple-choice"]
                        } label="Question Type" labelPlacement="outside" className="w-1/2" startContent={
                            questions[active].questionType === "multiple-choice" ? <UiRadiosGrid /> : questions[active].questionType === "multi-select" ? <UiChecks /> : <SquareHalf />
                        } onChange={(e) => {
                            const newQuestions = [...questions]
                            if (e.target.value === "multiple-choice" || e.target.value === "multi-select") {
                                if (questions[active].questionType === "multiple-choice" || questions[active].questionType === "multi-select") {
                                    console.log(questions[active].questionType)
                                    for (let i = 0; i < newQuestions[active].answers.length; i++) {
                                        newQuestions[active].answers[i].answer = questions[active].answers[i].answer
                                        if (i === 0) {
                                            newQuestions[active].answers[i].correct = true
                                        } else {
                                            newQuestions[active].answers[i].correct = false
                                        }
                                    }
                                } else {
                                    newQuestions[active].answers = [
                                        {
                                            answer: "Answer 1",
                                            correct: true,
                                            error: false
                                        },
                                        {
                                            answer: "Answer 2",
                                            correct: false,
                                            error: false
                                        },
                                        {
                                            answer: "Answer 3",
                                            correct: false,
                                            error: false
                                        },
                                        {
                                            answer: "Answer 4",
                                            correct: false,
                                            error: false
                                        }
                                    ]
                                }
                            } else if (e.target.value === "true-false") {
                                newQuestions[active].answers = [
                                    {
                                        answer: "True",
                                        correct: true,
                                        error: false
                                    },
                                    {
                                        answer: "False",
                                        correct: false,
                                        error: false
                                    }
                                ]
                            }
                            newQuestions[active].saved = false
                            newQuestions[active].questionType = e.target.value as "multiple-choice" | "multi-select" | "true-false"
                            setQuestions(newQuestions)
                        }}>
                            <SelectItem key="multiple-choice">Multiple Choice</SelectItem>
                            <SelectItem key="multi-select">Multi-Select</SelectItem>
                            <SelectItem key="true-false">True/False</SelectItem>
                        </Select>
                        <p className="text-3xl">Question {active + 1}</p>
                        <div className="flex flex-col gap-y-3">
                            <Input variant="bordered" value={questions[active].question} className="w-5/6 lg:w-1/2" onChange={(e) => {
                                const newQuestions = [...questions]
                                newQuestions[active].question = e.target.value
                                newQuestions[active].saved = false
                                setQuestions(newQuestions)
                            }} />
                            {
                                questions[active].questionType === "multiple-choice" ? (
                                    <RadioGroup className="mt-3 w-5/6 lg:w-1/2" value={questions[active].answers.findIndex(p => p.correct === true).toString()}>
                                        {
                                            questions[active].answers.map((item, index) => (
                                                <Fragment key={index}>
                                                    <Radio value={index.toString()} color="success" onClick={() => {
                                                        const newQuestions = [...questions]
                                                        newQuestions[active].answers.forEach((_p, i) => {
                                                            if (i === index) {
                                                                newQuestions[active].answers[i].correct = true
                                                            } else {
                                                                newQuestions[active].answers[i].correct = false
                                                            }
                                                            newQuestions[active].saved = false
                                                        })
                                                        setQuestions(newQuestions)
                                                    }}>Answer {index + 1}</Radio>
                                                    <Input isInvalid={item.error} errorMessage={item.error ? "Required Field" : ""} value={item.answer} variant="bordered" size="sm" radius="lg" onChange={(e) => {
                                                        const newQuestions = [...questions]
                                                        newQuestions[active].answers[index].answer = e.target.value
                                                        newQuestions[active].saved = false
                                                        setQuestions(newQuestions)
                                                    }} onBlur={() => {
                                                        if (questions[active].answers[index].answer === "") {
                                                            const newQuestions = [...questions]
                                                            newQuestions[active].error = true
                                                            newQuestions[active].answers[index].error = true
                                                            setQuestions(newQuestions)
                                                        } else {
                                                            const newQuestions = [...questions]
                                                            newQuestions[active].error = false
                                                            newQuestions[active].answers[index].error = false
                                                            setQuestions(newQuestions)
                                                        }
                                                    }} />
                                                </Fragment>
                                            ))
                                        }
                                    </RadioGroup >
                                ) : questions[active].questionType === "multi-select" ? (
                                    <div className="mt-3 w-5/6 lg:w-1/2 flex flex-col gap-y-2">
                                        {
                                            questions[active].answers.map((item, index) => (
                                                <Fragment key={index}>
                                                    <Checkbox color="success" key={index} isSelected={item.correct} onClick={() => {
                                                        if (item.correct) {
                                                            const newQuestions = [...questions]
                                                            newQuestions[active].answers[index].correct = false
                                                            newQuestions[active].saved = false
                                                            setQuestions(newQuestions)
                                                        } else {
                                                            const newQuestions = [...questions]
                                                            newQuestions[active].answers[index].correct = true
                                                            newQuestions[active].saved = false
                                                            setQuestions(newQuestions)
                                                        }
                                                    }}>Answer {index + 1}</Checkbox>
                                                    <Input isInvalid={item.error} errorMessage={item.error ? "Required Field" : ""} value={item.answer} variant="bordered" size="sm" radius="lg" onChange={(e) => {
                                                        const newQuestions = [...questions]
                                                        newQuestions[active].answers[index].answer = e.target.value
                                                        newQuestions[active].saved = false
                                                        setQuestions(newQuestions)
                                                    }} onBlur={() => {
                                                        if (questions[active].answers[index].answer === "") {
                                                            const newQuestions = [...questions]
                                                            newQuestions[active].error = true
                                                            newQuestions[active].answers[index].error = true
                                                            setQuestions(newQuestions)
                                                        } else {
                                                            const newQuestions = [...questions]
                                                            newQuestions[active].error = false
                                                            newQuestions[active].answers[index].error = false
                                                            setQuestions(newQuestions)
                                                        }
                                                    }} />
                                                </Fragment>
                                            ))
                                        }
                                    </div>
                                ) : (
                                    <RadioGroup className="mt-3 w-5/6 lg:w-1/2" value={questions[active].answers.findIndex(p => p.correct === true).toString()}>
                                        {
                                            questions[active].answers.map((item, index) => (
                                                <Fragment key={index}>
                                                    <Radio value={index.toString()} color={item.answer === "True" ? "primary" : "danger"} onClick={() => {
                                                        const newQuestions = [...questions]
                                                        newQuestions[active].answers.forEach((_p, i) => {
                                                            newQuestions[active].saved = false
                                                            if (i === index) {
                                                                newQuestions[active].answers[i].correct = true
                                                            } else {
                                                                newQuestions[active].answers[i].correct = false
                                                            }
                                                        })
                                                        setQuestions(newQuestions)
                                                    }}>{item.answer}</Radio>
                                                </Fragment>
                                            ))
                                        }
                                    </RadioGroup >
                                )
                            }
                        </div>
                    </div>
                </div>
            </Container >
        )
    }
}