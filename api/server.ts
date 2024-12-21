import express from 'express';
const app = express();
const port = 8000;
app.use(express.json());
import newsRoute from './routes/news';
import commentsRoute from './routes/comments';

app.use('/news', newsRoute);
app.use('/comments', commentsRoute);
app.listen(port, () => {
    console.log(`App listening on port - http://localhost:${port}`);
})