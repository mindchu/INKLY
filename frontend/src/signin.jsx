import React from 'react'
import { FcGoogle } from "react-icons/fc";
import { CONFIG } from './config';

function Signin() {
    const handleGoogleLogin = () => {
        // Redirect to backend Google login route
        // Note: We use window.location.href because it's an external redirect to the API
        window.location.href = `${CONFIG.API_URL}/login/google`;
    };

    return (
        <div className="w-screen h-screen bg-[#CDE9CE]">
            <div className='flex flex-row'>
                <div className='flex h-screen w-full lg:w-[50%] items-center justify-center px-4'>
                    <div className='flex flex-col w-full max-w-md lg:w-150 h-150 rounded-2xl opacity-90 bg-white p-8 items-center justify-center'>
                        <h2 className='text-3xl font-bold mb-2'>Welcome to INKLY</h2>
                        <p className='text-gray-600 mb-8 text-center'>Share and discover knowledge with a community of learners.</p>

                        <div className='w-full'>
                            <button
                                onClick={handleGoogleLogin}
                                className='flex items-center justify-center gap-3 w-full h-12 border-2 border-black rounded-xl bg-white hover:bg-gray-50 transition-colors font-medium text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                            >
                                <FcGoogle size={24} />
                                Sign in with Google
                            </button>
                        </div>

                        <p className='mt-8 text-xs text-gray-500 text-center px-4'>
                            By signing in, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
                <div className='hidden lg:block bg-[#EEF2E1] h-screen w-[50%] relative overflow-hidden'>
                    <div className='absolute inset-0 flex items-center justify-center opacity-10 grayscale'>
                        <div className='text-[200px] font-black tracking-tighter'>INKLY</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signin