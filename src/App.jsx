import 'bootstrap/dist/css/bootstrap.min.css'
import '../src/css/font-awesome.min.css'
import '../src/css/themify-icons.css'
import '../src/css/flaticon.css'
import './sass/style.scss'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './css/advocacy.css'
import 'react-toastify/dist/ReactToastify.css';
import AllRoute from './main-component/router';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <div className="App" id="scrool">
      <AllRoute />
      <ToastContainer />
    </div>
  )
}

export default App
