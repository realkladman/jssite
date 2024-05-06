const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const upload = multer({ dest: 'uploads/' });

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const randomId = crypto.randomBytes(20).toString('hex');
  const fileExtension = path.extname(file.originalname);
  const newFileName = randomId + fileExtension;

  const filePath = path.join(uploadDir, newFileName);
  fs.rename(file.path, filePath, err => {
    if (err) {
      return res.status(500).send(err);
    }

    res.send({ downloadLink: `/download/${newFileName}` });
  });
});

app.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'public', 'expired.html'));
    } else {
      res.download(filePath, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        } else {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            }
          });
        }
      });
    }
  });
});
app.use('/styles', express.static(path.join(__dirname, 'styles')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


