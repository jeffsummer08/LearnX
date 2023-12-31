import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { NextUIProvider } from "@nextui-org/react"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Error from "./pages/Error"
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
    }
  ])

  return (
    <NextUIProvider>
      <ToastContainer />
      <RouterProvider router={router} />
    </NextUIProvider>
  )
}
