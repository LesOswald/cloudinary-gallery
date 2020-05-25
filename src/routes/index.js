const { Router } = require('express');
const router = Router();

const Photo = require('../models/Photo');
const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const fs = require('fs-extra');

router.get('/', async(req, res) => {
    try {
        const photos = await Photo.find();
        console.log(photos);
        res.render('images', {photos});
    } catch (error) {
        console.log(error);
    }

});

router.get('/images/add', async(req, res) => {
    try {
        const photos = await Photo.find();
        res.render('image_form', {photos});
    } catch (error) {
        console.log(error);
    }

});

router.post('/images/add', async(req, res) => {
    const { title, description } = req.body;
    try {
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        const newPhoto = new Photo({
            title,
            description,
            imageURL: result.url,
            public_id: result.public_id
        })
        await newPhoto.save();
        await fs.unlink(req.file.path);
        res.redirect('/');
    } catch (error) {
        console.log(error);
    }

});

router.get('/images/delete/:photo_id', async(req, res) => {
    try {
        const { photo_id } = req.params;
        const photo = await Photo.findByIdAndDelete(photo_id);
        const result = await cloudinary.v2.uploader.destroy(photo.public_id);
        console.log(result);
        res.redirect('/images/add');
    } catch (error) {
        console.log(error);
    }

});

module.exports = router;