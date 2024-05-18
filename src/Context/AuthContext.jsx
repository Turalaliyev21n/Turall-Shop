import React, {useState,useCallback,useEffect} from "react";
import {Bounce, toast} from "react-toastify";



export const AuthContext = React.createContext({
    handleExit: () => {},
    token: null,
    setToken: () => {}
});

export const AuthContextProvider = ({children}) => {

    const [token,setToken] = useState(localStorage.token);

    useEffect(() => {
        setToken(localStorage.getItem("token"));
    }, []);


    const handleExit = useCallback(() => {
        delete localStorage.token;
        setToken(null);
        toast.success('You are logged off', {
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
        });
    }, [setToken])

    return (
        <AuthContext.Provider value={{
            token,
            handleExit,
            setToken: (token) => {
                localStorage.setItem("token", token);
                setToken(token);
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
};