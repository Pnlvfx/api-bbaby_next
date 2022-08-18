import {Schema,model} from "mongoose";
import { CategoryProps } from "../@types/category";

const CategorySchema = new Schema<CategoryProps>({
    name: String
},
);
const Category = model('Category', CategorySchema);

export default Category;