import { Outlet, useLocation } from 'react-router-dom';
import './App.css';

const App = () => {
  const location = useLocation();

  return (
    <>
      <Outlet />
    </>
  );
}

export default App;