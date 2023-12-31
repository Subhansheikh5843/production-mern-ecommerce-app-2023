import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";

export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(500).send({ message: "Name is required" });
    }
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(200).send({
        success: true,
        message: "Category Already Exist",
      });
    }

    const category = await categoryModel({ name, slug: slugify(name) }).save();
    res.status(200).send({
      success: true,
      message: "New Category Created",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Category",
      error,
    });
  }
};


//update controller

export const updateCategoryController = async(req,res)=>{
try {
  const {name} = req.body
  const {id} = req.params
  const category = await categoryModel.findByIdAndUpdate(id,{name,slug:slugify(name)},{new:true})

  res.status(200).send({
    success: true,
    message: "Category Updated Successfully",
    category,
  });
} catch (error) {
  console.log(error);
  res.status(500).send({
    success: false,
    message: "Error while updating Category",
    error,
  });
}
}


// get all category
export const categoryController = async(req,res)=>{
  try {
    const category = await categoryModel.find({})
    res.status(200).send({
      success: true,
      message: "All Category List",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting all Category",
      error,
    });
  }
}


// single category 

export const singleCategoryController = async(req,res)=>{
  try {
    
    const category = await categoryModel.findOne({slug:req.params.slug})
    res.status(200).send({
      success: true,
      message: "get single Category success",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting all single Category",
      error,
    });
  }
}

// delete category 

export const deleteCategoryController = async(req,res)=>{
  try {
    const {id} = req.params
    await categoryModel.findByIdAndDelete(id)
    res.status(200).send({
      success: true,
      message: "Category deleted success",
    
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting Category",
      error,
    });
  }

}