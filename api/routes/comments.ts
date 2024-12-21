import express from "express";
import fs from "fs";
import {News} from "./news";
import {promisify} from "node:util";

const router = express.Router();
const commentsFile = '';
const newsFile = '';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

interface Comment {
    id: number;
    newsId: number;
    author: string;
    text: string;
}

const readComments = async (): Promise<Comment[]> => {
    const data = await readFileAsync(commentsFile, 'utf8');
    return JSON.parse(data);
}
const writeComments = async (data: Comment[]): Promise<void> => {
    await writeFileAsync(commentsFile, JSON.stringify(data, null, 2));
}
const readNews = async (): Promise<News[]> => {
    const data = await readFileAsync(newsFile, 'utf8');
    return JSON.parse(data);
};

router.get('/', async (req, res) => {
    try {
        const comments = await readComments();
        const news = await readNews();
        if (req.query.news_id) {
            const newsId = parseInt(req.query.news_id as string);
            const article = news.find(article => article.id === newsId);
            if (!article) {
                res.status(404).json({message: "News ID not found"});
                return;
            }
            res.json(comments.filter(comment => comment.newsId === newsId));
            return;
        }
        res.json(comments);
        return;
    } catch (error) {
        res.status(500).json({message: 'internal server error'});
        return;
    }
});

router.post('/', async (req, res) => {
    try {
        const comments = await readComments();
        const news = await readNews();
        const newId: number = req.body.newsId;
        if (!newId || !news.find(article => article.id === newId)) {
            res.status(400).json({message: 'Invalid or missing news ID'});
            return;
        }
        const newComment: Comment = {
            id: comments.length > 0 ? comments[comments.length - 1].id + 1 : 1,
            newsId: req.body.newsId,
            author: req.body.author || 'Anonymous',
            text: req.body.text
        };
        comments.push(newComment);
        await writeComments(comments);
        res.status(201).json(newComment);
        return;
    } catch (error) {
        console.error('error processing request:', error);
        res.status(500).json({message: 'internal server error'});
        return;
    }
});

router.delete('/:id', async (req, res) => {
    try {
        let comments = await readComments();
        const commentIndex = comments.findIndex(comment => comment.id === parseInt(req.params.id));
        if (commentIndex !== -1) {
            comments.splice(commentIndex, 1);
            await writeComments(comments);
            res.json({message: 'Comment deleted'});
            return;
        } else {
            res.status(404).json({message: 'Comment not found'});
            return;
        }
    } catch (error) {
        res.status(500).json({message: 'internal server error'});
        return;
    }
});

export default router;