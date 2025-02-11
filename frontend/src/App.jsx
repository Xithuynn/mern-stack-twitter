import React from 'react'
import {createBrowserRouter,Navigate,Outlet, RouterProvider } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';

import SignUpPage from './pages/auth/signup/SignUpPage.jsx'
import Login from './pages/auth/login/Login.jsx'
import HomePage from './pages/home/HomePage.jsx'
import RightPanel from './components/common/RightPanel.jsx'
import Sidebar from './components/common/sideBar.jsx'
import NotificationPage from './pages/notification/NotificationPage.jsx'
import ProfilePage from './pages/profile/ProfilePage.jsx'
import { Toaster } from 'react-hot-toast'


export default function App() {
  const { data: authuser, isLoading } = useQuery({
    queryKey: ["authuser"],
    queryFn: async () => {
            try{
                const res = await fetch("/api/auth/me")

                if (res.status === 204 || res.headers.get("content-length") === "0") {
                  throw new Error("Empty response from server");
              }
                const data = await res.json();
                if(data.error) {
                    return null
                }

                if(!res.ok) throw new Error(data.error || "something went wrong")
                console.log("authUser is here:", data)
               
                return data;
            } catch(error) {
                throw new Error(error)
            }
    },
    // select: data=== undefined? null: data,
    retry: false
  })
  
  console.log(authuser)
const Layout = () => {

  
  return(
     <div className='flex max-w-6xl h-screen mx-auto justify-center gap-2 '>
          <div className='md:flex-[2_2_0] w-18 max-w-52'>
             {authuser&& <Sidebar  /> }
          </div>
          <div className='flex-[4_4_0] overflow-y-auto '>
              <Outlet />
          </div>
          <div>
             { authuser && <RightPanel />}
          </div>
          <div>
              < Toaster />
          </div>
     </div>
  )
}
   const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
              path: "/signup",
              element: !authuser? <SignUpPage /> : <Navigate to={"/"} />
            },
            {
              path: "/login",
              element: !authuser? <Login /> : <Navigate to={"/"} />
            },
            {
              path: "/",
              element: authuser ? <HomePage /> : <Navigate to={"/login"}/>
            },
            {
              path: "/notifications",
              element: authuser?  <NotificationPage /> : <Navigate to={"/login"}/>
            }, 
            { path: "/profile/johndoe",
              element: authuser? <ProfilePage /> : <Navigate to={"/login"} />
            }
        ]
    }
  ])
  
  if(isLoading) return <div className="h-screen max-w-screen flex justify-center items-center">
      <LoadingSpinner />
  </div>
  return <RouterProvider router={router} />;

}
