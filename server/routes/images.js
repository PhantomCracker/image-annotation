const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

const router = express.Router();

// Multer configuration to handle image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Store uploads in the "uploads" directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

mongoose.connect('mongodb://127.0.0.1:27017/image_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const imageSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  imageName: String,
  imageUrl: String,
  annotations: [String],
});

const Image = mongoose.model('Image', imageSchema);

const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const image = new Image({
      _id: new mongoose.Types.ObjectId(),
      imageName: req.file.originalname,
      imageUrl: req.file.path,
      annotations: [],
    });
    await image.save();
    res.status(201).json({ message: 'Image uploaded successfully', image });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.post('/annotate/:id', async (req, res) => {
  try {
    const imageId = req.params.id;
    console.log(imageId);
    const annotations = req.body.annotations;
    console.log(annotations);

    const image = await Image.findById(imageId, function (err, docs) {
      if (err){
        console.log(err);
      }
      else{
        console.log("Result : ", docs);
      }
    });
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    image.annotations = annotations;
    await image.save();
    res.json({ message: 'Annotations stored successfully', image });
  } catch (error) {
    res.status(500).json({ error: 'Failed to store annotations' });
  }
});

router.get('/generateUniqueId', (req, res) => {
  const uniqueId = new mongoose.Types.ObjectId();
  res.json({ uniqueId });
});

router.get('/download/:id', async (req, res) => {
  try {
    const imageId = req.params.id;
    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.setHeader('Content-Type', 'image/jpeg');
    fs.createReadStream(image.imageUrl).pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download image' });
  }
});

module.exports = router;
