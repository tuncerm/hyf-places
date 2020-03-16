import {useState, useCallback, useEffect} from 'react';

let logoutTimer;

export const useAuth = () => {
    const [token, setToken] = useState(false);
    const [tokenExpirationDate, setTokenExpirationDate] = useState();
    const [userId, setUserId] = useState(null);
  
    const login = useCallback((uid, token, expirationDate) => {
      setUserId(uid);
      setToken(token);
      const tokenExpires = expirationDate || new Date().getTime() + 60 * 60 * 1000;
      setTokenExpirationDate(tokenExpires);
      localStorage.setItem('userData', JSON.stringify({userUd: uid, token: token, expiration: tokenExpires}));
    }, []);
  
    const logout = useCallback(() => {
      setUserId(null);
      setToken(null);
      setTokenExpirationDate(null);
      localStorage.removeItem('userData');
    }, []);

    useEffect(()=>{
        const storedData = JSON.parse(localStorage.getItem('userData'));
        if(storedData && storedData.token && storedData.expiration > new Date().getTime()){
        login(storedData.userId, storedData.token);
        }
    }, [login]);

    useEffect(()=>{
        if(token && tokenExpirationDate){
        logoutTimer = setTimeout(logout, tokenExpirationDate - new Date().getTime());
        } else {
        clearTimeout(logoutTimer);
        }
    }, [token, logout, tokenExpirationDate]);

    return{userId, token, login, logout}
}