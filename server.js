import express from 'express';
import router from './routes/index.js'


const app = express();
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0',() => {
    console.log(`Server running on port ${port}`);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', router);
