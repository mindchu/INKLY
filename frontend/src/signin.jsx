import React from 'react'
import { useState } from 'react'
import { FcGoogle } from "react-icons/fc";
import { IoMdArrowBack } from "react-icons/io";


function Signin() {
    return (
        <div className="w-screen h-screen bg-[#CDE9CE]">
            <div className='flex flex-row'>
                <div className='flex h-screen w-full lg:w-[50%] items-center justify-center px-4'>
                    <div className='flex flex-col w-full max-w-md lg:w-150 h-150 rounded-2xl opacity-90 bg-white p-8'>
                        <p className='text-xl lg:text-2xl mb-6'>Sign in to continue</p>
                        <div>
                            <div className='flex flex-row w-full h-10 border-2 rounded-[0.7rem] border-black bg-[#CDE9CE]'>
                                <div className='flex-1 h-7 bg-[#0000F9] mt-1 mb-1 ml-1 rounded-2xl flex items-center justify-center text-white'>
                                    <button className='text-center text-sm lg:text-base'>
                                        Signin
                                    </button>
                                </div>
                                <div className='flex-1 h-7 bg-gray-200 mt-1 mb-1 mr-1 rounded-2xl flex items-center justify-center'>
                                    <button className='text-center text-sm lg:text-base'>
                                        Register
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='hidden lg:block bg-blue-200 h-screen w-[50%] opacity-30'>
                </div>
            </div>
        </div>
    );
}

export default Signin