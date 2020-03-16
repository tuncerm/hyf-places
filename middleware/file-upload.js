const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const {CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET} = process.env;
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'images',
    allowedFormats: ['jpg', 'jpeg', 'png'],
    filename: function (req, file, cb) {
      cb(undefined, file.filename);
    }
});

const fileUpload = multer({storage: storage});

module.exports = fileUpload;

// const multer = require('multer');
// const uuid = require('uuid/v1');

// const MIME_TYPE_MAP = {
//     'image/png': 'png',
//     'image/jpeg': 'jpeg',
//     'image/jpg': 'jpg'
// }

// const fileUpload = multer({
//     limits: 500000,
//     storage: multer.diskStorage({
//         destination:(req, file, cb)=>{
//             cb(null, 'uploads/images')
//         },
//         filename:(req, file, cb)=>{
//             const ext = MIME_TYPE_MAP[file.mimetype];
//             cb(null, uuid() + '.' + ext)
//         }
//     }),
//     fileFilter:(req, file, cb)=>{
//         const isValid = !!MIME_TYPE_MAP[file.mimetype];
//         let error = isValid ? null: new Error('Invalid mime type!');
//         cb(error, isValid);
//     }
// });

// module.exports = fileUpload;