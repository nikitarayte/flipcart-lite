// product crud
const path = require("path")
const Product = require("../models/Product")
const { upload } = require("../utils/upload")
const cloudinary = require("cloudinary").v2

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
})

exports.addProduct = async (req, res) => {
    upload(req, res, async err => {
        if (err) {
            console.log(err)
            return res.status(400).json({ message: "unable to upload" })
        }
        if (req.files) {
            // const allImages = []
            // for (const item of req.files) {
            //     const { secure_url } = await (cloudinary.uploader.upload(item.path)) //to upload the image use this function and this return a promise
            //     allImages.push(secure_url)
            // }
            // console.log(allImages)

            //promise all 👇

            // await Promise.all(allImages)
            const allImages = []
            const heros = []
            for (const item of req.files) {
                allImages.push(cloudinary.uploader.upload(item.path)) //to upload the image use this function and this return a promise
            }
            const data = await Promise.all(allImages)
            for (const item of data) {
                heros.push(item.secure_url)
            }
            await Promise.all(allImages)

            //promise all end
            await Product.create({ ...req.body, hero: heros })
            res.json({ message: "product add success" })
        } else {
            res.status(400).json({ message: "hero image is required" })
        }
    })
}
exports.getProducts = async (req, res) => {
    const result = await Product.find()
    res.json({ message: "product fetch success", result })
}
exports.updateProducts = async (req, res) => {

    upload(req, res, async err => {
        try {
            const allImages = []
            if (req.files.length > 0) {
                //only upload new img 
                for (const item of req.files) {
                    const { secure_url } = await cloudinary.uploader.upload(item.path)
                    allImages.push(secure_url)
                }
            }
            const oldProduct = await Product.findById(req.params.productID)
            //change only data
            if (req.body.remove) {
                const result = oldProduct.hero.filter(item => !req.body.remove.includes(item))
                oldProduct.hero = result
                if (typeof req.body.remove === "string") {
                    await cloudinary.uploader.destroy(path.basename(req.body.remove, path.extname(req.body.remove)))
                } else {
                    for (const item of req.body.remove) {
                        await cloudinary.uploader.destroy(path.basename(item,path.extname(item)))
                    }
                }

            }
            await Product.findByIdAndUpdate(req.params.productID, { ...req.body, hero: [...oldProduct.hero, ...allImages] })
            res.json({ message: "product update success" })
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "something went wrong" })
        }

        // if (err) {
        //     console.log(err);
        //     return res.status(400).json({ message: "unable  to upload" })
        // }
        // // console.log(req.body)
        // // console.log(req.files)

        // if (req.body.remove) {
        //     //remove old image
        //     await cloudinary.uploader.destroy(path.basename(req.body.remove))
        // }

        // const heros = []
        // if (req.files) {
        //     // upload new image 
        //     const allImages = []
        //     for (const item of req.files) {
        //         allImages.push(cloudinary.uploader.upload(item.path))
        //     }
        //     const data = await Promise.all(allImages)
        //     for (const item of data) {
        //         heros.push(item.secure_url)
        //     }
        // }

        // await Product.findByIdAndUpdate(req.params.productID, { ...req.body, hero: heros })

        // res.json({ message: "product update success" })
    })
}
exports.deleteProducts = async (req, res) => {
    const result = await Product.findById(req.params.productID)
    // step 1 cloudinary
    for (const item of result.hero) {
        await cloudinary.uploader.destroy(path.basename(item, path.extname(item)))
    }
    // step 2 database
    await Product.findByIdAndDelete(req.params.productID)
    res.json({ message: "product delete success" })
}