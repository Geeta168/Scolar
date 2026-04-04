import { useState } from 'react'
import { Bot, User, Mail, Lock } from 'lucide-react'
import { useNavigate} from 'react-router-dom';



import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../api';

const Login = () => {

    const { setAuthUser } = useAuth();
    const navigate =   useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setLogin] = useState(false);
    

const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        let res;

        if (isLogin) {
            res = await loginUser({ email, password });
        } else {
            res = await registerUser({ username, email, password });
        }

        if (res.success) {
            setAuthUser(res.user);
            alert(isLogin ? "Login Successful" : "Registered Successfully");

            navigate("/scolarlist");

        } else {
            alert(res.message);
        }

    } catch (err) {
        console.log(err);
        alert("Something went wrong");
    }
};


    return (
        <div className='flex min-h-[80vh] items-center justify-center'>
            <div className='w-full max-w-md p-8 bg-[#111] border border-gray-800 rounded-3xl shadow-2xl'>


                <div className='flex flex-col items-center mb-8'>
                    <div>
                        <Bot className="w-10 h-10 text-indigo-500" />
                    </div>

                    <h2 className='text-3xl font-bold text-white'>
                        {(isLogin) ? "Login" : "register"}
                    </h2>
                    <h3 className='text-gray-500 mt-2'>
                        {(isLogin) ? "WelCome Back!" : "Create an Account"}
                    </h3>
                </div>

                <form className='space-y-5' onSubmit={handleSubmit}>

                    {!isLogin && (<div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">full Name</label>
                        <div className='relative'>
                            <User className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600' />
                            <input type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder='username'
                                className='w-full bg-[#1a1a1a] border border-gray-600 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-indigo-500 transition-colors text-white'
                                required={!isLogin}
                            />
                        </div>
                    </div>)}



                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-500'>email address</label>
                        <div className='relative'>
                            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600' />
                            <input type="email" placeholder='gmail@gmail.com'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='w-full bg-[#1a1a1a] border border-gray-600 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-indigo-500 transition-colors text-white'
                                required
                            />
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-500 ml-1'>password</label>
                        <div className='relative'>
                            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600' />
                            <input type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='.........'
                                className='w-full bg-[#1a1a1a] border border-gray-600 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-indigo-500 transition-colors text-white'
                                required
                            />
                        </div>

                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold"
                    >
                        {isLogin ? "Login" : "Register"}
                    </button>



    

                    <p className='text-center mt-6 text-gray-500'>
                        {isLogin ? (
                            <>
                                Dont have an account?{" "}
                                <span
                                    className="text-indigo-500 cursor-pointer underline"
                                    onClick={() => setLogin(false)}
                                >
                                    Register
                                </span>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <span
                                    className="text-indigo-500 cursor-pointer underline"
                                    onClick={() => setLogin(true)}
                                >
                                    Login
                                </span>
                            </>
                        )}
                    </p>

                    <div>

                    </div>
                </form>

            </div>
        </div>
    )
}

export default Login
