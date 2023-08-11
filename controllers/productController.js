import slugify from "slugify";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import fs from "fs";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();
//payment gateway

// var gateway = new braintree.BraintreeGateway({
//   environment: braintree.Environment.Sandbox,
//   merchantId: process.env.BRAINTREE_MERCHANT_ID,
//   publicKey: process.env.BRAINTREE_PUBLIC_KEY,
//   privateKey: process.env.BRAINTREE_PRIVATE_KEY,
// });
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is required" });
      case !description:
        return res.status(500).send({ error: "description is required" });
      case !price:
        return res.status(500).send({ error: "price is required" });
      case !category:
        return res.status(500).send({ error: "category is required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is required and should be less than 1 Mb" });
    }
    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();

    res.status(201).send({
      success: true,
      message: "Products Created successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while creating product",
      error,
    });
  }
};

// get products

export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: " All Products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting Category",
      error,
    });
  }
};

// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const products = await productModel
      .findOne({ slug: req.params.slug })
      .populate("category")
      .select("-photo");
    res.status(200).send({
      success: true,
      message: " single Product Fetched",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single Category",
      error,
    });
  }
};

//get photo

export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel
      .findById(req.params.pid)
      .select("photo")
      .populate();
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting photo",
      error,
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "  Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//update product

export const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validatrion
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is required" });
      case !description:
        return res.status(500).send({ error: "description is required" });
      case !price:
        return res.status(500).send({ error: "price is required" });
      case !category:
        return res.status(500).send({ error: "category is required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is required and should be less than 1 Mb" });
    }
    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();

    res.status(201).send({
      success: true,
      message: "Products updated successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while updating product",
      error,
    });
  }
};

//filters
export const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while filtering product",
      error,
    });
  }
};

//product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in product count",
      error,
    });
  }
};

//product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in per page ctrl",
      error,
    });
  }
};

export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const result = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In search product Api",
      error,
    });
  }
};

//similar products

// export const relatedProductController = async (req, res) => {
//   try {
//     const { pid, cid } = req.params;
//     const products = await productModel
//       .find({
//         category: cid,
//         _id: { $ne: pid },
//       })
//       .select("-photo")
//       .limit(1)
//       .populate("category");
//     res.status(200).send({
//       success: true,
//       products,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).send({
//       success: false,
//       message: "Error while getting related product",
//       error,
//     });
//   }
// };
// similar products
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};
// onClick={() =>{setCart([...cart,p])
//   toast.success("Item Added to cart")}}

//get product by category

export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");

    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while getting  product",
      error,
    });
  }
};

//payment gateway
// // token
// export const braintreeTokenController = async (req, res) => {
//   try {
//     gateway.clientToken.generate({}, function (err, response) {
//       if (err) {
//         res.status(500).send(err);
//       } else {
//         res.send(response);
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// //payment
// export const braintreePaymentController = async (req, res) => {
//   try {
//     const { cart, nonce } = req.body;
//     let total = 0;
//     cart.map((i) => {
//       total += i.price;
//     });
//     let newTransection = gateway.transaction.sale(
//       {
//         amount: total,
//         paymentMethodNonce: nonce,
//         options: {
//           submitForSettlement: true,
//         },
//       },
//       function (error, result) {
//         if (result) {
//           const order = new orderModel({
//             products: cart,
//             payment: result,
//             buyer: req.user._id,
//           }).save();
//           res.json({ ok: true });
//         } else {
//           res.status(500).send(error);
//         }
//       }
//     );
//   } catch (error) {
//     console.log(error);
//   }
// };
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
export const braintreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};