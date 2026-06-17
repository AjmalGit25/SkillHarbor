import { Link } from 'react-router-dom';

const Header = () => {
  return (
    < header className='flex items-center justify-between' >
      <Link to={"/"} className='flex items-center gap-2'>
        <img src="/logo.png" alt="Logo" className='h-10 w-auto rounded-full bg-red-300' />    {/* logo */}
        <h1 className='font-medium text-2xl text-orange-500'>Course Selling App</h1>
      </Link>
      <div className='space-x-4'>
        <Link to={"/login"} className='bg-transparent text-white py-2 px-4 border border-white rounded'>Login</Link>
        <Link to={"/signup"} className='bg-transparent text-white py-2 px-4 border border-white rounded'>Signup</Link>
      </div>
    </ header >
  )
}

export default Header;
