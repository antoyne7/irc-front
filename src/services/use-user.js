import axios from 'axios';
import { useEffect, useState } from 'react';
import authHeader from './auth-header';
import param from './param';

function useUser() {
    const [userState, setUserState] = useState({
        user: null,
        isError: false,
        isLoading: true,
    })

    useEffect(() => {
        async function fetchData() {
            axios.get(
                param.auth.checkToken,
                { headers: authHeader() },
            ).then((response) => {
                setUserState(() => {
                    return {
                        user: response.data,
                        error: response.status > 299,
                        loading: false
                    }
                })
            }).catch(() => {
                setUserState(() => {
                    return {
                        user: false,
                        error: true,
                        loading: false
                    }
                })
            })
        }
        fetchData()
    }, [])


    return userState;
}

export default useUser;
