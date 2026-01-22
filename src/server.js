import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();



const startServer = () => {
    try {
        app.listen(process.env.PORT, () => {
            console.log('====================================');
            console.log(`Server is running on port ${process.env.PORT}`);
            console.log('====================================');
        }
        );
    } catch (error) {
        console.log('error starting server: ', error);

    }
}

startServer();