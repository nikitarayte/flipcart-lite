//register
//login
//logout
const bcrypt = require("bcryptjs") //for password
const Admin = require("../models/Admin")
const jwt = require("jsonwebtoken") //to check who is login we use token

exports.registerAdmin = async (req, res) => {
    const { email, password } = req.body
    const result = await Admin.findOne({ email })
    if (result) {
        return res.status(409).json({ message: "email already registered" }) //check the email
    }
    const hash = await bcrypt.hash(password, 10) //to hash the password
    await Admin.create({ ...req.body, password: hash }) //to add entry in database

    res.json({ message: "admin register success" })
}
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body
    const result = await Admin.findOne({ email })
    if (!result) {
        return res.status(401).json({ message: "invalid credentials" })
    }

    const isVerify = await bcrypt.compare(password, result.password) //to compare password
    if (!isVerify) {
        return res.status(401).json({ message: "invalid credentials password" })
    }

    const token = jwt.sign({ _id: result._id }, process.env.JWT_SECRET)

    //          admin=cookie name
    res.cookie("admin", token, {
        maxAge: 1000 * 60 * 60 * 24, //1 day
        httpOnly: true,
        //secure:true
    })

    res.json({
        message: "admin login success", result: {
            _id: result._id,
            name: result.name,
            email: result.email
        }
    })
}
exports.logoutAdmin = async (req, res) => {
    res.clearCookie("admin")
    res.json({ message: "admin logout success" })
}
