const categoryModel = require('../model/categories')
const productModel = require('../model/products')
const warehouseModel = require('../model/warehouses')
const userModel = require('../model/users')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cardModel = require('../model/cards');
const orderDetailModel = require('../model/orderDetail');
const orderModel = require('../model/orders');


const createCategory = async (req, res) => {
    const { categoryName } = req.body;
    
    if (categoryName) {
        const upperCaseCategoryName = categoryName.toUpperCase();
        
        const existingCategory = await categoryModel.findOne({ categoryName: upperCaseCategoryName });
        
        if (existingCategory) {
            res.status(400).json({ message: "Category already exists" });
        } else {
            const rs = await categoryModel.create({ categoryName: upperCaseCategoryName });
            res.status(201).json({ message: "Category created successfully", category: rs });
        }
    } else {
        res.status(400).json({ message: "Category name is required" });
    }
};

const editCategory = async (req, res) => {
    const categoryId = req.params.categoryId;
    const { categoryName } = req.body;

    if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
    }

    try {
        const existingCategory = await categoryModel.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        if (categoryName) {
            const upperCaseCategoryName = categoryName.toUpperCase();
            const existingCategoryName = await categoryModel.findOne({ categoryName: upperCaseCategoryName });
            if (existingCategoryName) {
                return res.status(400).json({ message: "Category name already exists" });
            }
            
            existingCategory.categoryName = upperCaseCategoryName;
            await existingCategory.save();

            return res.status(200).json({ message: "Category updated successfully", category: existingCategory });
        } else {
            return res.status(400).json({ message: "Category name is required" });
        }
    } catch (err) {
        return res.status(500).json({ message: "An error occurred while updating the category", error: err.message });
    }
};

const deleteCategory = async (req, res) => {
    const categoryId = req.params.categoryId;

    if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
    }

    try {
        const existingCategory = await categoryModel.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        await categoryModel.deleteOne({ _id: categoryId });

        return res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: "An error occurred while deleting the category", error: err.message });
    }
};

const createProduct = async (req, res) => {
    let { categoryId, productName, productPrice, productImg, productImgDetail, productMaterial, productDescription } = req.body;

    // Kiểm tra xem tất cả các trường bắt buộc đã được cung cấp hay chưa
    if (!categoryId || !productName || !productPrice || !productImg || !productImgDetail || !productMaterial || !productDescription) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Kiểm tra xem sản phẩm có tồn tại trong cơ sở dữ liệu hay không
        const existingProduct = await productModel.findOne({ productName: productName.toUpperCase() });
        if (existingProduct) {
            return res.status(400).json({ message: "Product name already exists" });
        }

        // Chuyển đổi productName thành chữ in hoa
        productName = productName.toUpperCase();

        // Tạo một sản phẩm mới
        const newProduct = new productModel({
            categoryId,
            productName,
            productPrice,
            productImg,
            productImgDetail,
            productMaterial,
            productDescription,
        });

        // Lưu sản phẩm vào cơ sở dữ liệu
        const savedProduct = await newProduct.save();

        // Trả về phản hồi thành công
        res.status(201).json({ message: "Product created successfully", product: savedProduct });
    } catch (error) {
        // Xử lý lỗi
        res.status(500).json({ message: "An error occurred while creating the product", error: error.message });
    }
};



const allProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;  
    const limit = parseInt(req.query.limit) || 1;  
    const categoryId = req.query.categoryId;
    const productName = req.query.productName;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const startDate = req.query.startDate; 
    const endDate = req.query.endDate;     

    try {
        let query = {};

        // Lọc sản phẩm theo tên sản phẩm
        if (productName) {
            query = { ...query, productName: { $regex: productName, $options: 'i' } };
        }

        // Lọc sản phẩm theo categoryId
        if (categoryId) {
            query = { ...query, categoryId: categoryId };
        }

        // Lọc sản phẩm theo khoảng giá sản phẩm
        if (minPrice && maxPrice) {
            query = { ...query, productPrice: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) } };
        } else if (minPrice) {
            query = { ...query, productPrice: { $gte: parseInt(minPrice) } };
        } else if (maxPrice) {
            query = { ...query, productPrice: { $lte: parseInt(maxPrice) } };
        }

        // Lọc sản phẩm theo khoảng thời gian ngày đăng
        if (startDate && endDate) {
            query = { ...query, datePosted: { $gte: new Date(startDate), $lte: new Date(endDate) } };
        } else if (startDate) {
            query = { ...query, datePosted: { $gte: new Date(startDate) } };
        } else if (endDate) {
            query = { ...query, datePosted: { $lte: new Date(endDate) } };
        }

        // Kiểm tra nếu không có query nào được truyền thì lấy tất cả sản phẩm
        if (Object.keys(query).length === 0) {
            // Tìm tất cả các sản phẩm nếu không có bất kỳ điều kiện nào
            const products = await productModel.find({})
                .populate('warehouse')
                .populate('categoryId')
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();

            // Đếm tổng số sản phẩm
            const totalCount = await productModel.countDocuments({});

            // Tính toán số trang
            const totalPages = Math.ceil(totalCount / limit);

            // Trả về kết quả
            return res.status(200).json({
                currentPage: page,
                totalPages: totalPages,
                totalCount: totalCount,
                products: products
            });
        }

        // Tìm các sản phẩm với query đã xây dựng và chỉ định limit và skip
        const products = await productModel.find(query)
            .populate('warehouse')
            .populate('categoryId')
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        // Đếm tổng số sản phẩm phù hợp với điều kiện tìm kiếm
        const totalCount = await productModel.countDocuments(query);

        // Tính toán số trang dựa trên tổng số sản phẩm và limit
        const totalPages = Math.ceil(totalCount / limit);

        // Trả về kết quả
        return res.status(200).json({
            currentPage: page,
            totalPages: totalPages,
            totalCount: totalCount,
            products: products
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};


const editProduct = async (req, res) => {
    const productId = req.params.productId;
    const { categoryId, productName, productPrice, productImg, productImgDetail, productMaterial, productDescription } = req.body;

    try {
        // Tìm sản phẩm theo productId
        const product = await productModel.findOne({ _id: productId });

        // Kiểm tra xem sản phẩm có tồn tại không
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Cập nhật các trường thông tin sản phẩm nếu được cung cấp từ người dùng
        if (categoryId) product.categoryId = categoryId;
        if (productName) product.productName = productName.toUpperCase(); // Chuyển đổi productName thành chữ in hoa
        if (productPrice) product.productPrice = productPrice;
        if (productImg) product.productImg = productImg;
        if (productImgDetail && Array.isArray(productImgDetail)) {
            // Cập nhật danh sách productImgDetail dựa trên thông tin từ người dùng
            productImgDetail.forEach((imgDetail) => {
                const { index, value } = imgDetail;
                if (index !== undefined && index >= 0 && index < product.productImgDetail.length) {
                    product.productImgDetail[index] = value;
                } else {
                    product.productImgDetail.push(value);
                }
            });
        }
        if (productMaterial) product.productMaterial = productMaterial;
        if (productDescription) product.productDescription = productDescription;

        // Lưu sản phẩm đã cập nhật vào cơ sở dữ liệu
        const updatedProduct = await product.save();

        // Trả về sản phẩm đã được cập nhật
        res.status(200).send(updatedProduct);
    } catch (err) {
        // Xử lý lỗi nếu có bất kỳ vấn đề gì xảy ra trong quá trình cập nhật sản phẩm
        console.error('Error updating product:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

const createWarehouse = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { ProductId, size, amount } = req.body;

        if (!productId || !ProductId || !size || !amount) {
            return res.status(400).send('Missing required fields');
        }

        // Check if the size for the given product already exists in the warehouse
        const existingSize = await warehouseModel.findOne({ productId: ProductId, size: size });
        if (existingSize) {
            return res.status(409).send('Size of product already exists');
        }

        // Create the new warehouse size entry
        const newSize = await warehouseModel.create({ productId: ProductId, size: size, amount: amount });

        // Add the new warehouse size reference to the product's warehouse array
        const addSize = await productModel.findById(productId);
        if (!addSize) {
            return res.status(404).send('Product not found');
        }
        addSize.warehouse.push(newSize._id);
        await addSize.save();

        return res.status(201).json({ message: "Size added successfully", newSize: newSize });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

const editWarehouse = async (req, res) => {
    try {
        const warehouseId = req.params.warehouseId;
        const { amount } = req.body;

        if (!warehouseId || !amount) {
            return res.status(400).send('Missing required fields');
        }

        // Find and update the warehouse entry
        const updatedWarehouse = await warehouseModel.findByIdAndUpdate(
            warehouseId,
            { $set: { amount: amount } },
            { new: true }
        );

        if (!updatedWarehouse) {
            return res.status(404).send('Warehouse entry not found');
        }

        return res.status(200).json({ message: "Warehouse entry updated successfully", updatedWarehouse: updatedWarehouse });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

const allSizeOfProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided

        if (!productId) {
            return res.status(400).send('Product ID is required');
        }

        // Calculate the number of items to skip based on the page and limit
        const skip = (page - 1) * limit;

        // Find the sizes for the given product ID with pagination
        const sizes = await warehouseModel.find({ productId: productId })
            .skip(skip)
            .limit(limit);

        // Get the total count of sizes for the given product ID
        const totalSizes = await warehouseModel.countDocuments({ productId: productId });

        // Calculate total pages
        const totalPages = Math.ceil(totalSizes / limit);

        return res.status(200).json({
            sizes: sizes,
            page: page,
            totalPages: totalPages,
            totalSizes: totalSizes
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

const register = async (req, res) => {
    try {
        const { fullName, IdAccount, password, role, email, ward, district, address, province, phoneNumber } = req.body;

        // Kiểm tra tất cả các trường bắt buộc
        if (!fullName || !IdAccount || !password || !email || !ward || !district || !address || !province || !phoneNumber) {
            return res.status(400).send('Tất cả các trường đều là bắt buộc');
        }

        // Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send('Địa chỉ email không hợp lệ');
        }

        // Kiểm tra định dạng số điện thoại (ví dụ: +84 123 456 7890 hoặc 0123456789)
        const phoneRegex = /^(?:\+84|0)[1-9][0-9]{8,9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).send('Số điện thoại không hợp lệ');
        }

        // Kiểm tra mật khẩu
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).send('Mật khẩu phải có ít nhất 10 ký tự, bao gồm chữ thường, chữ in hoa, số và ký tự đặc biệt');
        }

        // Kiểm tra xem email hoặc IdAccount đã tồn tại hay chưa
        const existingUser = await userModel.findOne({ $or: [{ email: email }, { IdAccount: IdAccount }] });
        if (existingUser) {
            return res.status(409).send('Email hoặc Tên tài khoản đã tồn tại');
        }

        // Băm mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = new userModel({
            fullName,
            IdAccount,
            password: hashedPassword,
            role,
            email,
            ward,
            district,
            address,
            province,
            phoneNumber
        });

        // Lưu người dùng vào cơ sở dữ liệu
        await newUser.save();

        return res.status(201).json({ message: 'Đăng ký thành công', user: newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Lỗi máy chủ nội bộ');
    }
};

const login = async (req, res) => {
    try {
        const { IdAccount, password } = req.body;

        // Kiểm tra tất cả các trường bắt buộc
        if (!IdAccount || !password) {
            return res.status(400).send('Tài khoản và mật khẩu là bắt buộc');
        }

        // Tìm người dùng theo IdAccount
        const user = await userModel.findOne({ IdAccount: IdAccount });
        if (!user) {
            return res.status(401).send('Tài khoản không tồn tại');
        }

        // So sánh mật khẩu đã băm
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Mật khẩu không đúng');
        }

        // Tạo token với thời gian hết hạn (ví dụ: 1 giờ)
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            'your_jwt_secret', // Thay đổi thành bí mật của bạn
            { expiresIn: '3h' } // Thời gian hết hạn của token
        );

        // Trả về thông tin người dùng và token
        return res.status(200).json({
            message: 'Đăng nhập thành công',
            token: token,
            user: {
                fullName: user.fullName,
                IdAccount: user.IdAccount,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Lỗi máy chủ nội bộ');
    }
};

const editUser = async (req, res) => {
    const userId = req.user.userId;
    const { password, email, ward, district, address, province, phoneNumber } = req.body;

    // Kiểm tra định dạng email nếu được cung cấp
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send('Định dạng email không hợp lệ');
        }
    }

    // Kiểm tra định dạng số điện thoại nếu được cung cấp
    if (phoneNumber) {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).send('Định dạng số điện thoại không hợp lệ');
        }
    }

    try {
        // Tìm người dùng theo userId
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send('Người dùng không tồn tại');
        }

        // Cập nhật thông tin người dùng nếu các trường tương ứng có trong yêu cầu
        if (email) {
            const emailExisting = await userModel.find({ email: email })
            if (emailExisting.length !== 0) {
                return res.status(404).send('Email đã được đăng ký');
            } else {
                user.email = email;
            }
        } 
        if (ward) user.ward = ward;
        if (district) user.district = district;
        if (address) user.address = address;
        if (province) user.province = province;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        // Nếu mật khẩu được cung cấp, băm mật khẩu mới
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // Lưu thay đổi vào cơ sở dữ liệu
        await user.save();

        // Trả về thông tin người dùng đã cập nhật (không bao gồm mật khẩu)
        return res.status(200).json({
            message: 'Cập nhật thông tin người dùng thành công',
            user: {
                email: user.email,
                ward: user.ward,
                district: user.district,
                address: user.address,
                province: user.province,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Lỗi máy chủ nội bộ');
    }
};

const allUsers = async (req, res) => {
    try {
        // Lấy trang hiện tại và số lượng người dùng trên mỗi trang từ query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1;

        // Tính toán số lượng người dùng cần bỏ qua
        const skip = (page - 1) * limit;

        // Lấy tất cả người dùng với phân trang
        const users = await userModel.find().skip(skip).limit(limit);

        // Tính tổng số lượng người dùng
        const totalUsers = await userModel.countDocuments();

        // Tính tổng số trang
        const totalPages = Math.ceil(totalUsers / limit);

        // Trả về danh sách người dùng cùng với thông tin phân trang
        return res.status(200).json({
            users: users,
            totalUsers: totalUsers,
            totalPages: totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Lỗi máy chủ nội bộ');
    }
};

const addToCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Tìm người dùng dựa trên userId
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send('Người dùng không tồn tại');
        }

        // Lấy các thông tin từ request body
        const { productId, size, amount } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!productId || !size || !amount) {
            return res.status(400).send('Tất cả các trường là bắt buộc');
        }

        // Chuyển amount thành số
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).send('Số lượng phải là một số hợp lệ và lớn hơn 0');
        }

        // Kiểm tra sự tồn tại của sản phẩm
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).send('Sản phẩm không tồn tại');
        }

        // Lấy tên sản phẩm
        const productName = product.productName;

        // Kiểm tra kích thước sản phẩm trong kho
        const sizeInWarehouse = await warehouseModel.findOne({ productId: productId, size: size });
        if (!sizeInWarehouse) {
            return res.status(400).send('Size không tồn tại trong kho');
        }

        if (parsedAmount > sizeInWarehouse.amount) {
            return res.status(400).send('Số lượng đã vượt quá số lượng trong kho');
        }

        // Kiểm tra sản phẩm trong giỏ hàng của người dùng
        const existingCartItem = await cardModel.findOne({ IdAccount: userId, productId, size });

        if (existingCartItem) {
            existingCartItem.amount += parsedAmount;
            const total = product.productPrice * parsedAmount;
            if (existingCartItem.amount > sizeInWarehouse.amount) {
                return res.status(400).send('Số lượng đã vượt quá số lượng trong kho');
            }
            existingCartItem.total += total;
            await existingCartItem.save();
        } else {
            const newProduct = new cardModel({
                IdAccount: userId,
                productId,
                productName,
                size,
                amount: parsedAmount,
                total: product.productPrice * parsedAmount
            });
            await newProduct.save();
        }

        // Trả về phản hồi thành công
        return res.status(201).json({ message: 'Sản phẩm đã được thêm vào giỏ hàng hoặc số lượng đã được cập nhật' });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Lỗi máy chủ nội bộ');
    }
};

const allProductInCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Tìm người dùng dựa trên userId
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send('Người dùng không tồn tại');
        }

        // Lấy các tham số phân trang từ query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Lấy các sản phẩm trong giỏ hàng của người dùng
        const cartItems = await cardModel.find({ IdAccount: userId })
            .skip(skip)
            .limit(limit);

        // Đếm tổng số sản phẩm trong giỏ hàng
        const totalItems = await cardModel.countDocuments({ IdAccount: userId });

        // Tính tổng số trang
        const totalPages = Math.ceil(totalItems / limit);

        // Trả về phản hồi với danh sách sản phẩm và thông tin phân trang
        return res.status(200).json({
            message: 'Lấy danh sách sản phẩm trong giỏ hàng thành công',
            cartItems,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                itemsPerPage: limit
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Lỗi máy chủ nội bộ');
    }
};

const editCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { cartId, amount } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!cartId || amount === undefined || amount === null) {
            return res.status(400).send('Tất cả các trường là bắt buộc');
        }

        // Chuyển đổi amount thành số
        const amountNumber = Number(amount);
        if (isNaN(amountNumber) || amountNumber <= 0) {
            return res.status(400).send('Số lượng phải là một số dương');
        }

        // Tìm sản phẩm trong giỏ hàng theo cartId và userId
        const product = await cardModel.findOne({ _id: cartId, IdAccount: userId });
        if (!product) {
            return res.status(404).send('Sản phẩm này không có trong giỏ hàng');
        }

        // Kiểm tra số lượng sản phẩm trong kho
        const checkWarehouse = await warehouseModel.findOne({ productId: product.productId, size: product.size });
        if (!checkWarehouse) {
            return res.status(404).send('Sản phẩm không tồn tại trong kho');
        }

        if (amountNumber > checkWarehouse.amount) {
            return res.status(400).send('Số lượng đã vượt quá số lượng trong kho');
        }
        const price = await productModel.findOne({_id: product.productId})
        // Cập nhật số lượng và tổng giá
        const total = amountNumber * price.productPrice;
        if (isNaN(total)) {
            return res.status(500).send('Tính toán tổng giá trị không hợp lệ');
        }
        
        product.amount = amountNumber;
        product.total = total;

        // Lưu thay đổi vào cơ sở dữ liệu
        await product.save();

        // Trả về phản hồi thành công
        return res.status(200).json({ message: 'Cập nhật giỏ hàng thành công', product });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Lỗi máy chủ nội bộ');
    }
};

const deleteCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { cartId } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!cartId) {
            return res.status(400).send('cartId là bắt buộc');
        }

        // Tìm sản phẩm trong giỏ hàng theo cartId và userId
        const product = await cardModel.findOneAndDelete({ _id: cartId, IdAccount: userId });
        if (!product) {
            return res.status(404).send('Sản phẩm này không có trong giỏ hàng');
        }

        // Trả về phản hồi thành công
        return res.status(200).json({ message: 'Sản phẩm đã được xóa khỏi giỏ hàng', product });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Lỗi máy chủ nội bộ');
    }
};

const createOrder = async (req, res) => {
    try {
        const userId = req.user.userId
        const { cartId, paymentMethod, fullName, email, ward, district, address, province, phoneNumber } = req.body

        // Kiểm tra các trường bắt buộc
        if (!cartId || !paymentMethod) {
            return res.status(400).send('cartId và paymentMethod là bắt buộc');
        }

        // Kiểm tra định dạng email nếu được cung cấp
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).send('Định dạng email không hợp lệ');
            }
        }

        // Kiểm tra định dạng số điện thoại nếu được cung cấp
        if (phoneNumber) {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phoneNumber)) {
                return res.status(400).send('Định dạng số điện thoại không hợp lệ');
            }
        }

        // Tìm người dùng dựa trên userId
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send('Người dùng không tồn tại');
        }

        if (fullName) user.fullName = fullName
        if (email) user.email = email
        if (ward) user.ward = ward;
        if (district) user.district = district;
        if (address) user.address = address;
        if (province) user.province = province;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        
        const parsedCartId = JSON.parse(cartId);
        

        // Kiểm tra xem cartIds có phải là một mảng không
        if (!Array.isArray(parsedCartId)) {
            return res.status(400).send('cartIds phải là một mảng');
        }

        // Kiểm tra từng cartId trong mảng
        const cartItems = await cardModel.find({ _id: { $in: parsedCartId }, IdAccount: userId });
        if (cartItems.length !== parsedCartId.length) {
            return res.status(400).send('Một hoặc nhiều cartId không hợp lệ');
        }

        let totalAmount = 0
        let totalPrice = 0

        cartItems.forEach(item => {
            totalAmount += item.amount
            totalPrice += item.total
        });

        // Tạo đối tượng đơn hàng mới
        const newOrder = new orderModel({
            userId,
            fullName: user.fullName,
            email: user.email,
            ward: user.ward,
            district: user.district,
            address: user.address,
            province: user.province,
            phoneNumber: user.phoneNumber,
            paymentMethod,
            totalAmount,
            totalPrice,
            orderDate: new Date(),
            status: 1
        });

        // Lưu đơn hàng vào cơ sở dữ liệu
        const savedOrder = await newOrder.save();

        // Tạo chi tiết đơn hàng
        for (const item of cartItems) {
            await orderDetailModel.create({
                IdAccount: userId,
                orderId: savedOrder._id,
                productId: item.productId,
                productName: item.productName,
                size: item.size,
                amount: item.amount,
                total: item.total
            });
        }

        // Xóa các mục trong giỏ hàng sau khi tạo đơn hàng thành công
        await cardModel.deleteMany({ _id: { $in: parsedCartId }, IdAccount: userId });

        // Trả về phản hồi thành công
        return res.status(201).json({ message: 'Đơn hàng đã được tạo thành công', order: savedOrder });

    } catch (err) {
        console.error(err);
        return res.status(500).send('Lỗi máy chủ nội bộ');
    }
    
    
}

const allOrder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 10 } = req.query;

        // Chuyển đổi page và limit thành số nguyên
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        if (isNaN(pageNumber) || isNaN(limitNumber)) {
            return res.status(400).send('Page và limit phải là số');
        }

        // Tìm tổng số đơn hàng của người dùng
        const totalOrders = await orderModel.countDocuments({ userId });

        // Tìm tất cả các đơn hàng của người dùng với phân trang
        const orders = await orderModel.find({ userId })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({ orderDate: -1 });

        // Tính toán tổng số trang
        const totalPages = Math.ceil(totalOrders / limitNumber);

        // Trả về phản hồi với danh sách các đơn hàng và thông tin phân trang
        return res.status(200).json({
            orders,
            pagination: {
                totalOrders,
                totalPages,
                currentPage: pageNumber,
                limit: limitNumber
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Lỗi máy chủ nội bộ');
    }
};

const deleteOrder = async (req, res) => {
    try {
        const userId = req.user.userId
        const { orderId } = req.body
        // Kiểm tra orderId có được cung cấp hay không
        if (!orderId) {
            return res.status(400).send('orderId là bắt buộc');
        }
        // Tìm đơn hàng dựa trên orderId và userId
        const order = await orderModel.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).send('Đơn hàng không tồn tại hoặc bạn không có quyền xóa đơn hàng này');
        }
        if (order.status === 1) {
            // Xóa chi tiết đơn hàng liên quan đến orderId
            await orderDetailModel.deleteMany({ orderId });

            // Xóa đơn hàng
            await orderModel.deleteOne({ _id: orderId });

            // Trả về phản hồi thành công
            return res.status(200).json({ message: 'Đơn hàng và chi tiết đơn hàng đã được xóa thành công' });
        } else {
            return res.status(200).json({ message: 'Đơn hàng không thể hủy bạn có thể liên hệ với shop để hủy đơn' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Lỗi máy chủ nội bộ');
    }
}

const editOrder = async (req, res) => {
    try {
        let { orderId, status } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!orderId || status === undefined) {
            return res.status(400).send('Tất cả các trường đều là bắt buộc');
        }

        status = parseInt(status);
        // Kiểm tra tính hợp lệ của trạng thái
        if (status <= 0 || status > 3) {
            return res.status(400).send('Trạng thái không phù hợp: 1-Chờ xác nhận, 2-Đã xác nhận, 3-Đã hủy');
        }

        // Tìm đơn hàng dựa trên orderId
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).send('Đơn hàng không tồn tại');
        }
        
        // Kiểm tra điều kiện thay đổi trạng thái
        if ((order.status === 1 && status !== 2) || (order.status === 2 && status !== 3)) {
            return res.status(400).send('Trạng thái không hợp lệ cho đơn hàng này');
        }
        
        // Kiểm tra xem trạng thái mới có giống trạng thái hiện tại không
        if (status === order.status) {
            return res.status(400).send('Đơn hàng đang ở trạng thái này');
        }

        // Nếu trạng thái mới là 2 (Đã xác nhận), cần trừ số lượng sản phẩm trong kho
        if (status === 2) {
            const orderDetails = await orderDetailModel.find({ orderId });
            for (let item of orderDetails) {
                const warehouseItem = await warehouseModel.findOne({ productId: item.productId, size: item.size });
                if (!warehouseItem) {
                    return res.status(400).send(`Sản phẩm với ID: ${item.productId} và kích thước: ${item.size} không tồn tại trong kho`);
                }
                // Kiểm tra số lượng sản phẩm có đủ để trừ không
                if (warehouseItem.amount < item.amount) {
                    return res.status(400).send(`Không đủ số lượng sản phẩm với ID: ${item.productId} và kích thước: ${item.size} trong kho`);
                }

                // Trừ số lượng sản phẩm trong kho
                warehouseItem.amount -= item.amount;
                await warehouseItem.save();
            }
        }

        // Nếu trạng thái mới là 3 (Đã hủy), cần hoàn lại số lượng sản phẩm vào kho
        if (status === 3) {
            const orderDetails = await orderDetailModel.find({ orderId });
            for (let item of orderDetails) {
                const warehouseItem = await warehouseModel.findOne({ productId: item.productId, size: item.size });
                if (!warehouseItem) {
                    return res.status(400).send(`Sản phẩm với ID: ${item.productId} và kích thước: ${item.size} không tồn tại trong kho`);
                }

                // Hoàn lại số lượng sản phẩm vào kho
                warehouseItem.amount += item.amount;
                await warehouseItem.save();
            }
        }

        // Cập nhật trạng thái của đơn hàng
        order.status = status;
        await order.save();

        // Trả về phản hồi thành công
        return res.status(200).json({ message: 'Đơn hàng đã được cập nhật', order });

    } catch (err) {
        console.error(err);
        return res.status(500).send('Lỗi máy chủ nội bộ');
    }
};



module.exports = {
    createCategory , editCategory, deleteCategory, createProduct, allProducts, editProduct, createWarehouse, editWarehouse, allSizeOfProduct, register, login, editUser, allUsers, addToCart, allProductInCart, editCart, deleteCart, createOrder, allOrder, deleteOrder, editOrder
}
