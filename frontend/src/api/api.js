import axios from 'axios';


// ============================================================
// AXIOS API
// ============================================================

const api = axios.create({

    baseURL: 'http://localhost:5001/api',

});


// ============================================================
// AJOUT AUTOMATIQUE DU TOKEN JWT
// ============================================================

api.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem('token');


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;
        }


        return config;
    },

    (error) => {

        return Promise.reject(error);
    }
);


// ============================================================
// EXPORT
// ============================================================

export default api;