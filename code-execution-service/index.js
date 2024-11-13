import express from 'express';
import piston from 'piston-client';
import bodyParser from 'body-parser';

const app = express();
const client = piston({});

app.use(bodyParser.json());

app.post('/execute', async (req, res) => {
    const { language, code } = req.body;

    try {
        const result = await client.execute(language, code);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Code execution service running on port ${PORT}`);
});
