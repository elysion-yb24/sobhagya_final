# Backend Blog API Specification

## Files to Create/Modify in `sobhagya-backend-new/user-service`

### 1. Create Blog Model
**File:** `user-service/src/models/blog.js`

```javascript
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, trim: true },
    image: { type: String, default: "" },
    author: { type: String, required: true, trim: true },
    authorImage: { type: String, default: "" },
    authorBio: { type: String, default: "" },
    date: { type: String, required: true },
    readTime: { type: String, default: "5 min read" },
    tags: [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports.Blog = mongoose.model('Blog', blogSchema);
```

### 2. Update Models Index
**File:** `user-service/src/models/index.js`

Add this line:
```javascript
module.exports.Blog = require('./blog').Blog;
```

### 3. Create Blog Controller
**File:** `user-service/src/controllers/admin/blogController.js`

```javascript
const { Blog } = require('../../models');

// Get all blogs with pagination
exports.getBlogs = async (req, res) => {
    try {
        let { skip, limit } = req.query;

        // Validate skip and limit
        if (!skip || !limit) {
            return res.status(200).json({
                success: false,
                message: 'INVALID LIMIT/SKIP',
                data: null
            });
        }

        skip = parseInt(skip);
        limit = parseInt(limit);

        if (limit > 100) {
            return res.status(200).json({
                success: false,
                message: 'INVALID LIMIT - Maximum 100',
                data: null
            });
        }

        // Query only published blogs
        const query = { isPublished: true };

        // Get total count for pagination
        const total = await Blog.countDocuments(query);

        // Fetch blogs with pagination, sorted by date (newest first)
        const blogs = await Blog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v');

        return res.status(200).json({
            success: true,
            message: 'Blogs fetched successfully',
            data: {
                list: blogs,
                total: total,
                skip: skip,
                limit: limit,
                hasMore: (skip + limit) < total
            }
        });

    } catch (error) {
        console.error('Error fetching blogs:', error);
        return res.status(200).json({
            success: false,
            message: error.message || 'Failed to fetch blogs',
            data: null
        });
    }
};

// Get single blog by ID
exports.getBlog = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(200).json({
                success: false,
                message: 'Blog ID is required',
                data: null
            });
        }

        // Find blog by ID (can be MongoDB ObjectId or numeric ID)
        let blog;
        if (mongoose.Types.ObjectId.isValid(id)) {
            blog = await Blog.findOne({ _id: id, isPublished: true });
        } else {
            // If it's a numeric ID, you might need to add a numericId field to the schema
            blog = await Blog.findOne({ _id: id, isPublished: true });
        }

        if (!blog) {
            return res.status(200).json({
                success: false,
                message: 'Blog not found',
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Blog fetched successfully',
            data: blog
        });

    } catch (error) {
        console.error('Error fetching blog:', error);
        return res.status(200).json({
            success: false,
            message: error.message || 'Failed to fetch blog',
            data: null
        });
    }
};
```

**Note:** Add this import at the top of the file:
```javascript
const mongoose = require('mongoose');
```

### 4. Update Controllers Index
**File:** `user-service/src/controllers/index.js`

Add this line:
```javascript
module.exports.blogController = require("./admin/blogController");
```

### 5. Update Admin Routes
**File:** `user-service/src/routes/adminRoutes.js`

Add the blogController import at the top:
```javascript
const {autoBusyOfflineController,getDailySignupsController,userAdminController,reviewsController,updatePeopleController,detailController,partnerCategoryController,userController,blogController} = require('../controllers')
```

Add these routes (add after line 31, before the closing):
```javascript
// BLOG ROUTES
router.get('/get-blogs', validateTeamUserAuth, blogController.getBlogs);
router.get('/get-blog', validateTeamUserAuth, blogController.getBlog);
```

**Note:** If you want blogs to be publicly accessible (no auth required), remove `validateTeamUserAuth`:
```javascript
router.get('/get-blogs', blogController.getBlogs);
router.get('/get-blog', blogController.getBlog);
```

## API Endpoints

### Get All Blogs
- **URL:** `GET /user/api/admin/get-blogs`
- **Query Parameters:**
  - `skip` (required): Number of blogs to skip (for pagination)
  - `limit` (required): Number of blogs to return (max 100)
- **Response:**
```json
{
  "success": true,
  "message": "Blogs fetched successfully",
  "data": {
    "list": [...],
    "total": 50,
    "skip": 0,
    "limit": 10,
    "hasMore": true
  }
}
```

### Get Single Blog
- **URL:** `GET /user/api/admin/get-blog`
- **Query Parameters:**
  - `id` (required): Blog ID (MongoDB ObjectId)
- **Response:**
```json
{
  "success": true,
  "message": "Blog fetched successfully",
  "data": {
    "_id": "...",
    "title": "...",
    "content": "...",
    ...
  }
}
```

## Full URL Examples

- Development: `http://localhost:7002/user/api/admin/get-blogs?skip=0&limit=10`
- Production: `https://micro.sobhagya.in/user/api/admin/get-blogs?skip=0&limit=10`

## Notes

1. The API follows the same pattern as other admin routes in the user-service
2. Blogs are filtered by `isPublished: true` to only return published blogs
3. Blogs are sorted by `createdAt` in descending order (newest first)
4. The API returns the same response structure as other endpoints in the service
5. Error responses follow the same format: `{ success: false, message: "...", data: null }`




