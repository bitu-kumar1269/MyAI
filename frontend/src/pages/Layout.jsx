import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { SignIn, useUser } from '@clerk/clerk-react';

const Layout = () => {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false); 
  const { user} = useUser();

  return user ?(
    <div className='flex flex-col h-screen'>
      
      <nav className='flex items-center justify-between px-6 h-16 border-b bg-white w-full'>
        <img 
          src={assets.logo} 
          alt='' 
          className='cursor-pointer w-32 sm:w-44'
          onClick={()=> navigate('/')} 
        />

        {
          sidebar ? (
            <X 
              className='w-6 h-6 text-gray-600 sm:hidden cursor-pointer'
              onClick={() => setSidebar(false)}
            />
          ) : (
            <Menu 
              className='w-6 h-6 text-gray-600 sm:hidden cursor-pointer'
              onClick={() => setSidebar(true)}
            />
          )
        }
      </nav>

      <div className='flex-1 flex h-[calc(100vh-64px)]'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar}/>
        <div className='flex-1 bg-[#F4F7FB]'>
          <Outlet/>
        </div>
      </div>

    </div>
  ) : (
    <div className='flex items-center justify-center h-screen'>
      <SignIn />
    </div>
  )
}

export default Layout