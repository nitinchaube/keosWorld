const Category = require("../models/category");
const Sub = require("../models/sub");
const Product = require("../models/product");

const slugify = require("slugify");

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    //creating new category
    const category = await new Category({ name, slug: slugify(name) }).save();
    res.json(category);
  } catch (err) {
    res.status(400).send("Create Category Failed");
  }
};

exports.list = async (req, res) => {
  res.json(await Category.find({}).sort({ createdAt: -1 }).exec());
};

exports.read = async (req, res) => {
  let category = await Category.findOne({ slug: req.params.slug }).exec(); //collecting the slug from params
  // res.json(category);
  const products = await Product.find({ category: category })
    .populate("category")
    .exec();

  res.json({
    category,
    products,
  })
};

exports.update = async (req, res) => {
  const { name } = req.body;

  try {
    const updated = await Category.findOneAndUpdate(
      { slug: req.params.slug },
      { name: name, slug: slugify(name) },
      { new: true } // for passign the newly updated in json
    );
    res.json(updated);
  } catch (err) {
    res.status(400).send("Category update failed");
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (err) {
    res.status(400).send("Category delete Failed");
  }
};

exports.getSubs = (req, res) => {
  Sub.find({ parent: req.params._id }).exec((err, subs) => {
    if (err) console.log(err);
    res.json(subs);
  });
};
