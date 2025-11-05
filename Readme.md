# Menu Management System API

A comprehensive Node.js backend API for managing hierarchical menu structures with categories, subcategories, and items. Built with Express.js, MongoDB, and Cloudinary for image management.

## 🚀 Features

- **Hierarchical Menu Structure**: Category → SubCategory → Items
- **Image Management**: Cloudinary integration for image uploads
- **Tax Inheritance**: Subcategories and items can inherit tax settings from parent categories
- **Search Functionality**: Full-text search for items by name
- **Automatic Calculations**: Total amount auto-calculated (Base Amount - Discount)
- **CRUD Operations**: Complete Create, Read, Update, Delete for all entities

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd menu-management

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the server
npm start

# For development with auto-reload
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📡 API Endpoints

Base URL: `http://localhost:5000/api`

### Categories

| Method   | Endpoint                  | Description                | Content-Type          |
| -------- | ------------------------- | -------------------------- | --------------------- |
| `POST`   | `/categories`             | Create new category        | `multipart/form-data` |
| `GET`    | `/categories`             | Get all categories         | -                     |
| `GET`    | `/categories/:identifier` | Get category by ID or name | -                     |
| `PUT`    | `/categories/:id`         | Update category            | `multipart/form-data` |
| `DELETE` | `/categories/:id`         | Delete category            | -                     |

### SubCategories

| Method   | Endpoint                              | Description                             | Content-Type          |
| -------- | ------------------------------------- | --------------------------------------- | --------------------- |
| `POST`   | `/subcategories`                      | Create new sub-category                 | `multipart/form-data` |
| `GET`    | `/subcategories`                      | Get all sub-categories                  | -                     |
| `GET`    | `/subcategories/category/:categoryId` | Get all sub-categories under a category | -                     |
| `GET`    | `/subcategories/:identifier`          | Get sub-category by ID or name          | -                     |
| `PUT`    | `/subcategories/:id`                  | Update sub-category                     | `multipart/form-data` |
| `DELETE` | `/subcategories/:id`                  | Delete sub-category                     | -                     |

### Items

| Method   | Endpoint                            | Description                        | Content-Type          |
| -------- | ----------------------------------- | ---------------------------------- | --------------------- |
| `POST`   | `/items`                            | Create new item                    | `multipart/form-data` |
| `GET`    | `/items`                            | Get all items                      | -                     |
| `GET`    | `/items/search?name=<query>`        | Search items by name               | -                     |
| `GET`    | `/items/category/:categoryId`       | Get all items under a category     | -                     |
| `GET`    | `/items/subcategory/:subCategoryId` | Get all items under a sub-category | -                     |
| `GET`    | `/items/:identifier`                | Get item by ID or name             | -                     |
| `PUT`    | `/items/:id`                        | Update item                        | `multipart/form-data` |
| `DELETE` | `/items/:id`                        | Delete item                        | -                     |

---

**Note:** All endpoints with `multipart/form-data` content type require image upload via form-data with field name `image`.
