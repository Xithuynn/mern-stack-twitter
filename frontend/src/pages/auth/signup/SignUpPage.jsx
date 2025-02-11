import {React , useState} from 'react'
import XSvg from '../../../components/svgs/X'

import { FaUser } from "react-icons/fa";
import { TfiEmail } from "react-icons/tfi";
import { PiPasswordBold } from "react-icons/pi";
import { MdDriveFileRenameOutline } from "react-icons/md"
import {useMutation , useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { useNavigate } from 'react-router-dom';

function SignUpPage() {
 
    
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        email: '',
        username: '',
        fullname: '',
        password: '', 

    })
    const queryClient = useQueryClient();
    
    const { mutate:registerMutation, isError, isPending, error } = useMutation({
        mutationFn: async ({ email, username, fullname, password}) => {
            try{
                const res = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, username, fullname, password})
                })
                const data = await res.json();

                if(!res.ok) throw new Error("Something went wrong")
                if(data.error) throw new Error(data.error)
            } catch(error) {
                throw new Error(error)
            }
        },
        onSuccess: async () => {
            toast.success("Account created successfully")
            await queryClient.invalidateQueries({queryKey:["authuser"]})
            navigate("/")
        }
    })
    const handleSubmit = (e) => {
        e.preventDefault();
        registerMutation(formData)
    }
    const handleInputChange = (e) => {
        setFormData({...formData, [e.target.name] : e.target.value})
    }
  return (
    <div  className=' max-w-screen-lg mx-auto  flex h-screeen items-center justify-center gap-6'>
        <div className=' hidden lg:flex items-center justify-center'>
            <XSvg className=" lg:w-2/3 fill-white "/>
        </div>
        <div className=' flex flex-col justify-center items-center  mt-8 md:mt-10'>
            <form action="" className=' mx-auto  flex flex-col gap-4'  onSubmit={handleSubmit} >
                <XSvg className="lg:hidden w-1/3  flex fill-white" />
                <h1 className=' text-4xl font-extrabold text-white'>Join Now!</h1>
                <label className='input input-bordered input-primary flex items-center rounded gap-2'>
                    <TfiEmail />
                    <input 
                            type="email" 
                            className=''
                            placeholder='Email'
                            name='email'
                            onChange={handleInputChange}
                            value={formData.email}
                            />
                </label>
                <div className='flex flex-col gap-2'>
                    <label className='input input-bordered input-primary flex items-center rounded gap-2'>
                        <FaUser/>
                        <input 
                            type="text"
                            className=''
                            placeholder='username'
                            name="username"
                            onChange={handleInputChange}
                            value={formData.username} />
                    </label>
                    <label className='input input-bordered input-primary flex items-center rounded gap-2'>
                    <MdDriveFileRenameOutline />
                        <input 
                            type="text"
                            className=''
                            placeholder='Fullname'
                            name="fullname"
                            onChange={handleInputChange}
                            value={formData.fullname} />
                    </label>
                    
                </div>
                <label className='input input-bordered input-primary flex items-center rounded gap-2'>
                        <PiPasswordBold/>
                        <input 
                            type="password"
                            className=''
                            placeholder='password'
                            name="password"
                            onChange={handleInputChange}
                            value={formData.password} />
                    
                </label>
                <button className='btn rounded text-white btn-primary'>
                    {isPending ? "Loading...": "Sign Up"}
                </button>
                {isError && <p className="text-red-500">{error.message}</p>}
            </form>
            <div className='flex flex-col mx-auto gap-2 mt-8cd  min-w-full text-center'>
                <p className='text-white text-lg'>Already have an account?</p>
                
                <button className=' btn rounded text-white btn-primary'
                    onClick={()=> navigate("/login")}>
                    Sign in
                </button>
               
            </div>
        </div>
    </div>
  )
}

export default SignUpPage;
