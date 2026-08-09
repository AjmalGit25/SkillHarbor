import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="mt-5">
      <div className="bg-linear-to-l from-sky-500 to-blue-800 opacity-50 h-px rounded-2xl mb-5"></div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='flex flex-col items-center md:items-start'>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className='h-9 w-auto rounded-full' />    {/* logo */}
            <h4 className='font-medium text-md sm:text-2xl '>
              <span className='bg-linear-to-l from-sky-500 to-blue-800 bg-clip-text text-transparent'>Skill</span>
              <span className='text-white'>Harbor</span>
            </h4>
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
            <li className='hover:text-white duration-300'><a href="/admin/signup">Become an Educator</a></li>
            <li className='hover:text-white duration-300'><a href="/admin/login">Educator Login</a></li>
            <li className='hover:text-white duration-300'><a href="https://github.com/AjmalGit25/SkillHarbor">Github - SkillHarbor</a></li>
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
