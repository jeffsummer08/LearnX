import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { NextUIProvider } from "@nextui-org/react"
import Home from "./pages/Universal/Home"
import Login from "./pages/Universal/Login"
import Signup from "./pages/Student/Signup"
import Dashboard from "./pages/Universal/Dashboard"
import Error from "./pages/Universal/Error"
import EditLesson from "./pages/Admin/EditLesson"
import Lesson from "./pages/Universal/Lesson"
import Course from "./pages/Universal/Course"
import { ToastContainer } from "react-toastify"
import EditQuiz from "./pages/Admin/EditQuiz"
import TeacherSignup from "./pages/Teacher/TeacherSignup"
import Settings from "./pages/Universal/Settings"

export default function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      errorElement: <Error type="404" />
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/student/signup",
      element: <Signup />
    },
    {
      path: "/teacher/signup",
      element: <TeacherSignup />
    },
    {
      path: "/dashboard",
      element: <Dashboard />
    },
    {
      path: "/dashboard/:role",
      element: <Dashboard />,
    },
    {
      path: "/settings",
      element: <Settings />
    },
    {
      path: "/error",
      element: <Error type="500" />
    },
    {
      path: "/courses/:courseId",
      element: <Course />
    },
    {
      path: "/courses/:courseId/unit/:unitId/lesson/:lessonId",
      element: <Lesson />
    },
    {
      path: "/courses/:courseId/unit/:unitId/video/:lessonId",
      element: <Lesson />
    },
    {
      path: "/courses/:courseId/unit/:unitId/quiz/:lessonId",
      element: <Lesson />
    },
    {
      path: "/courses/:courseId/unit/:unitId/lesson/:lessonId/edit",
      element: <EditLesson />
    },
    {
      path: "/courses/:courseId/unit/:unitId/quiz/:quizId/edit",
      element: <EditQuiz />
    }
  ])

  return (
    <NextUIProvider>
      <ToastContainer pauseOnFocusLoss={false} pauseOnHover={false} />
      <RouterProvider router={router} />
    </NextUIProvider>
  )
}
