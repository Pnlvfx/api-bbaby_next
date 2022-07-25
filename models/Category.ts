import {Schema,model} from "mongoose";

const CategorySchema = new Schema<CategoryProps>({
    name: String
},
);
const Category = model('Category', CategorySchema);

export default Category;