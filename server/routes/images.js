const express = require('express');
const multer = require('multer');
const pgp = require('pg-promise')();

const router = express.Router();

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'image_database',
};

const db = pgp(dbConfig);

// Multer configuration to handle image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Store uploads in the "uploads" directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imageName = req.file.originalname;
    const imageUrl = req.file.path;

    const query = `INSERT INTO images (image_name, image_url, annotations) VALUES ($1, $2, $3) RETURNING *`;
    const values = [imageName, imageUrl, []];

    const image = await db.one(query, values);
    res.status(201).json({ message: 'Image uploaded successfully', image });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.post('/annotate/:id', async (req, res) => {
  try {
    const imageId = req.params.id;
    const annotations = req.body.annotations;

    const query = `UPDATE images SET annotations = $2 WHERE id = $1 RETURNING *`;
    const values = [imageId, annotations];

    const image = await db.oneOrNone(query, values);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ message: 'Annotations stored successfully', image });
  } catch (error) {
    res.status(500).json({ error: 'Failed to store annotations' });
  }
});

router.get('/generateUniqueId', (req, res) => {
  const uniqueId = pgp.as.format('$1^', pgp.utils.uuid());
  res.json({ uniqueId });
});

router.get('/download/:id', async (req, res) => {
  try {
    const imageId = req.params.id;

    const query = `SELECT * FROM images WHERE id = $1`;
    const image = await db.oneOrNone(query, [imageId]);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.setHeader('Content-Type', 'image/jpeg');
    fs.createReadStream(image.image_url).pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download image' });
  }
});

module.exports = router;
