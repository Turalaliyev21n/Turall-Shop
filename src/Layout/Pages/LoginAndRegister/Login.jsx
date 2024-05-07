import {useState, useEffect, useCallback, useContext} from 'react';
import styles from "./LoginAndRegister.module.scss";
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import PageHeading from '../../Common/PageHeading/PageHeading';
import { Link, useNavigate } from 'react-router-dom';
import { Bounce, toast } from 'react-toastify';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import axios from 'axios';
import {DataContext} from "../../../Context/DataContext.jsx";



const Login = () => {

    const  {
        fetchUserName,
    } =  useContext(DataContext);

    
  const [userLogin, setUserLogin] = useState({
    userLoginEmail: "",
    userLoginPassword: ""
  })
    const [viewPassword,setViewPassword] = useState(false);

  const handlePassView = useCallback(()=>{
      setViewPassword(prevState => !prevState);
  },[setViewPassword])


  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0); 
  }, []);
  


    const logIn = useCallback(async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get("http://localhost:8000/user");
            const users = response.data;
            const userWithEmail = users.find(
                (userData) =>
                    userData.userEmail === userLogin.userLoginEmail
            );
            const userPassword = users.find(
                (userData) =>
                    userData.userPassword === userLogin.userLoginPassword
            );
            if (userWithEmail && userPassword) {
                localStorage.setItem("user", JSON.stringify({email: userWithEmail.userEmail}));
                toast.success(`Hesabınıza uğurla daxil oldunuz.`, {
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                });
                fetchUserName();
                navigate("/home");
            } else if(!userWithEmail) {
                toast.error(`Belə hesab mövcud deyil.`, {
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                });
            }
            else if(!userPassword) {
                toast.error(`Bu hesab üçün şifrə yanlışdır.`, {
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                });
            }
        } catch (error) {
            console.error("Ошибка:", error);
        }
    }, [userLogin, navigate]);
  return (
    <>
    <Header />
    <main className={styles.pageWrapper}>
        <div className={styles.pageContent}>
        <PageHeading title={"Login"} />
        <div className={styles.formContainer}>
            <form onSubmit={logIn}>
              <div className={styles.inputContainer}>
                <p>Email address <span>*</span></p>
                <input type="email"  required placeholder="Email" onChange={(e) => setUserLogin({ ...userLogin, userLoginEmail: e.target.value })} value={userLogin.userLoginEmail}></input>
              </div>
              <div className={styles.inputContainer}>
                <p>Password <span>*</span></p>
                <div className={styles.passInputWrapper}>
                    <div className={styles.viewBtn} onClick={handlePassView}>
                        {viewPassword ? <Eye  /> : <EyeSlash />}
                    </div>
                <input  type={viewPassword ? "text" : "password"}  required placeholder="Password" onChange={(e) => setUserLogin({ ...userLogin, userLoginPassword: e.target.value })} value={userLogin.userLoginPassword} />
                </div>
              </div>
              <button type="submit" className={styles.submitButton}>LOG IN</button>

              <div className={styles.redirect}>
                <Link to="/register">Don't have and account? Click Here.</Link>
              </div>
            </form>
          </div>

        </div>
      
    </main>
    <Footer />
    </>
  )
}

export default Login
