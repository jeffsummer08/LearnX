import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { NextUIProvider } from "@nextui-org/react"
import Home from "./pages/Universal/Home"
import Login from "./pages/Universal/Login"
import Signup from "./pages/Universal/Signup"
import Dashboard from "./pages/Universal/Dashboard"
import Error from "./pages/Universal/Error"
import EditLesson from "./pages/Admin/EditLesson"
import Lesson from "./pages/Universal/Lesson"
import Course from "./pages/Universal/Course"
import { ToastContainer } from "react-toastify"

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
      path: "/signup",
      element: <Signup />
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
      path: "/error",
      element: <Error type="500" />
    },
    {
      path: "/courses/:courseId",
      element: <Course />
    },
    {
      path: "/courses/:courseId/lesson/:lessonId",
      element: <Lesson />
    },
    {
      path: "/courses/:courseId/lesson/:lessonId/edit",
      element: <EditLesson />
    }
  ])

  return (
    <NextUIProvider>
      <ToastContainer />
      <RouterProvider router={router} />
    </NextUIProvider>
  )
}
