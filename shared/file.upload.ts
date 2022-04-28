import * as multer from 'multer';

export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let uploadFile = file.originalname.split('.');
    let name = `${uniqueSuffix}.${uploadFile[uploadFile.length - 1]}`;
    cb(null, name);
  },
});
