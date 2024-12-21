import express from "express";
import fs from "fs";
import multer from "multer";
const router = express.Router();
const newsFile = '';

export interface News {
    id: number;
    title: string;
    content: string;
    image?: string;
    datePublished: string;
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({storage: storage});

const readData = (): News[] => {
    const data = fs.readFileSync(newsFile, 'utf8');
    return JSON.parse(data) as News[];
}
const writeData = (data: News[]) =>  {
    fs.writeFileSync(newsFile, JSON.stringify(data, null, 2));
}

router.get('/', (_req, res) => {
    const news = readData();
    res.json(news.map(news => ({id: news.id, title: news.title, datePublished: news.datePublished, image: news.image})));
});
router.get('/:id', (req, res) => {
    const news = readData();
    const article = news.find(article => article.id === parseInt(req.params.id));
    if (article) {
        res.json(article);
    } else {
        res.status(404).json({message: 'Not Found'});
    }
});

router.post('/', upload.single('image'), (req, res) => {
    const news = readData();
    const newArticle: News = {
        id: news.length > 0 ? news[news.length - 1].id + 1 : 1,
        title: req.body.title,
        content: req.body.content,
        image: req.file ? req.file.path.replace(/\\/g, '/') : '',
        datePublished: new Date().toISOString()
    };
    news.push(newArticle);
    writeData(news);
    res.status(201).json(newArticle);
});

router.delete('/:id', (req, res) => {
    let news = readData();
    const newsIndex = news.findIndex(article => article.id === parseInt(req.params.id));
    if (newsIndex !== -1) {
        news.splice(newsIndex, 1);
        writeData(news);
        res.json({message: 'News deleted'});
    } else {
        res.status(404).json({message: 'Not Found'});
    }
});

export default router;