import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer>
      <hr className='my-8' />
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='flex flex-col items-center md:items-start'>
          <div>
            <img src="/logo.png" alt="Logo" className='h-10 w-auto rounded-full bg-red-300' />    {/* logo */}
            <h1 className='font-medium text-2xl text-orange-500'>Course Selling App</h1>
          </div>
          <div className='mt-3 ml-2 md:ml-8'>
            <p className='mb-2'>Follow Us</p>
            <div className='flex space-x-4'>
              <a href=""><FaFacebook /></a>
              <a href=""><FaInstagram /></a>
              <a href=""><FaXTwitter /></a>
            </div>
          </div>
        </div>
        <div className='flex flex-col items-center'>
          <h3 className='font-bold text-xl mb-2'>Quick Links</h3>
          <ul className='list-none space-y-2 text-gray-400'>
            <li className='hover:text-white duration-300'><a href="">Youtube- learn coding</a></li>
            <li className='hover:text-white duration-300'><a href="">Linkedin- learn coding</a></li>
            <li className='hover:text-white duration-300'><a href="">Github- learn coding</a></li>
          </ul>
        </div>
        <div className='flex flex-col items-center'>
          <h3 className='font-bold text-xl mb-2'>Copyright &copy; 2026</h3>
          <ul className='list-none space-y-2 text-gray-400'>
            <li className='hover:text-white duration-300'><a href="">Terms & Conditions</a></li>
            <li className='hover:text-white duration-300'><a href="">Privacy & Policy</a></li>
            <li className='hover:text-white duration-300'><a href="">Refunds & Cancellation</a></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
