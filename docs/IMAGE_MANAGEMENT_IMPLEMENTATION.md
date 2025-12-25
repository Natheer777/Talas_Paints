# Product Image Management - Implementation Summary

## Overview
This document summarizes the implementation of two major features for product image management:
1. **Selective Image Deletion** - Delete specific images without deleting all images
2. **Unlimited Image Uploads** - Remove the 10-image limit per product

---

## Feature 1: Selective Image Deletion

### What Changed

#### 1. Updated `UpdateProductDTO` Interface
**File**: `src/application/use-cases/Products/UpdateProductUseCase.ts`

Added a new parameter:
```typescript
imagesToDelete?: string[]; // Array of image URLs to delete
```

#### 2. Enhanced `UpdateProductUseCase.execute()` Method
**File**: `src/application/use-cases/Products/UpdateProductUseCase.ts`

The logic now:
- Accepts an array of image URLs to delete (`imagesToDelete`)
- Verifies each URL belongs to the product before deletion
- Deletes specified images from AWS S3 storage
- Removes deleted URLs from the product's images array
- Continues processing even if individual deletions fail (with error logging)
- Handles new image uploads while preserving remaining images

**Processing Order**:
1. Delete specific images (if `imagesToDelete` provided)
2. Delete all remaining images (if `keepExistingImages=false` and new images uploaded)
3. Upload new images
4. Combine or replace images based on `keepExistingImages` flag

#### 3. Updated Controller
**File**: `src/presentation/controller/ProductsController.ts`

The `update()` method now:
- Accepts `imagesToDelete` from request body
- Parses it from JSON string or comma-separated string
- Passes it to the use case

#### 4. Updated Swagger Documentation
**Files**: 
- `src/docs/swagger-products.yaml`
- `src/docs/swagger.yaml`

Added `imagesToDelete` parameter documentation:
```yaml
imagesToDelete:
  type: array
  items:
    type: string
  description: Array of image URLs to delete from the product. Only images belonging to this product will be deleted.
  example: ["https://bucket.s3.amazonaws.com/products/abc/img1.jpg"]
```

---

## Feature 2: Unlimited Image Uploads

### What Changed

#### 1. Updated Upload Middleware
**File**: `src/presentation/middleware/UploadMiddleware.ts`

**Before**:
```typescript
export const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10, // ❌ Limited to 10 files
    },
});

export const uploadMultiple = upload.array('images', 10); // ❌ Limited to 10
```

**After**:
```typescript
export const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // ✅ Still 5MB per file
        // ✅ No file count limit - unlimited images allowed
    },
});

export const uploadMultiple = upload.array('images'); // ✅ Unlimited
```

#### 2. Updated Swagger Documentation
**Files**: 
- `src/docs/swagger-products.yaml`
- `src/docs/swagger.yaml`

**Before**:
```yaml
description: 'Product images (JPEG, PNG, or WebP, max 10 files, 5MB each)'
maxItems: 10
```

**After**:
```yaml
description: 'Product images (JPEG, PNG, or WebP, unlimited files, 5MB each)'
# maxItems removed
```

---

## API Usage Examples

### Example 1: Delete Specific Images Only
```bash
curl -X PUT "http://localhost:3000/api/products/{id}" \
  -F 'imagesToDelete=["https://bucket.s3.amazonaws.com/products/abc/img1.jpg","https://bucket.s3.amazonaws.com/products/abc/img2.jpg"]'
```

### Example 2: Delete Specific Images + Upload New Ones
```bash
curl -X PUT "http://localhost:3000/api/products/{id}" \
  -F 'imagesToDelete=["https://bucket.s3.amazonaws.com/products/abc/img1.jpg"]' \
  -F 'keepExistingImages=true' \
  -F 'images=@newImage1.jpg' \
  -F 'images=@newImage2.jpg' \
  -F 'images=@newImage3.jpg'
```

### Example 3: Upload Unlimited Images
```bash
curl -X POST "http://localhost:3000/api/products" \
  -F 'name=Premium Paint' \
  -F 'description=High quality paint' \
  -F 'category=Interior Paints' \
  -F 'sizes=[{"size":"1L","price":29.99}]' \
  -F 'status=visible' \
  -F 'images=@img1.jpg' \
  -F 'images=@img2.jpg' \
  -F 'images=@img3.jpg' \
  # ... add as many images as needed
  -F 'images=@img50.jpg'
```

### Example 4: JavaScript/TypeScript
```typescript
const formData = new FormData();

// Delete specific images
const imagesToDelete = [
  "https://bucket.s3.amazonaws.com/products/abc/img1.jpg",
  "https://bucket.s3.amazonaws.com/products/abc/img2.jpg"
];
formData.append('imagesToDelete', JSON.stringify(imagesToDelete));

// Keep remaining images
formData.append('keepExistingImages', 'true');

// Upload unlimited new images
const files = document.querySelector('#imageInput').files;
for (let i = 0; i < files.length; i++) {
  formData.append('images', files[i]);
}

const response = await fetch(`/api/products/${productId}`, {
  method: 'PUT',
  body: formData
});
```

---

## Use Cases

### Use Case 1: Delete 2 out of 5 Images
**Before**: Product has 5 images  
**Action**: Send `imagesToDelete` with 2 URLs  
**After**: Product has 3 images (the 2 specified images are deleted)

### Use Case 2: Delete 2 Images + Add 3 New Ones
**Before**: Product has 5 images  
**Action**: 
- `imagesToDelete`: 2 URLs
- `keepExistingImages`: "true"
- `images`: 3 new files

**After**: Product has 6 images (3 original + 3 new)

### Use Case 3: Upload 50+ Images to a Product
**Before**: No limit restriction  
**Action**: Upload 50 images in a single request  
**After**: Product has 50 images (all uploaded successfully)

---

## Important Notes

### Security
- ✅ Only images belonging to the product can be deleted
- ✅ Image ownership is verified before deletion
- ✅ Failed deletions are logged but don't stop the process

### Error Handling
- ✅ Graceful handling of S3 deletion failures
- ✅ Continues processing even if individual deletions fail
- ✅ Detailed error logging for debugging

### Validation
- ✅ Image URLs must exist in the product's current images
- ✅ File format validation (JPEG, PNG, WebP only)
- ✅ File size validation (5MB per file)
- ✅ Product existence validation

### Limits
- ✅ **No limit** on number of images per product
- ✅ **5MB limit** per individual image file
- ✅ File format: JPEG, PNG, WebP only

---

## Files Modified

### Backend Logic
1. `src/application/use-cases/Products/UpdateProductUseCase.ts`
2. `src/presentation/controller/ProductsController.ts`
3. `src/presentation/middleware/UploadMiddleware.ts`

### Documentation
4. `src/docs/swagger-products.yaml`
5. `src/docs/swagger.yaml`

---

## Testing Recommendations

### Test Case 1: Selective Deletion
1. Create a product with 5 images
2. Update the product with `imagesToDelete` containing 2 URLs
3. Verify only 2 images are deleted from S3
4. Verify product has 3 remaining images

### Test Case 2: Delete + Upload
1. Create a product with 5 images
2. Update with `imagesToDelete` (2 URLs), `keepExistingImages=true`, and 3 new images
3. Verify 2 images deleted, 3 new images uploaded
4. Verify product has 6 total images

### Test Case 3: Unlimited Upload
1. Create a product with 20+ images
2. Verify all images are uploaded successfully
3. Verify all images are stored in S3
4. Verify product record contains all image URLs

### Test Case 4: Invalid Image URL
1. Try to delete an image URL that doesn't belong to the product
2. Verify the image is not deleted
3. Verify the operation continues without error

---

## Migration Guide

### For Existing API Consumers

**No breaking changes!** The new features are backward compatible:

- Old code will continue to work
- `imagesToDelete` is optional
- Unlimited images work automatically (no code changes needed)

### Recommended Updates

If you want to use the new features:

```javascript
// OLD: Could only replace all or keep all
formData.append('keepExistingImages', 'false'); // Deletes all

// NEW: Can selectively delete specific images
const imagesToDelete = ["url1", "url2"];
formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
formData.append('keepExistingImages', 'true'); // Keep the rest
```

---

## Summary

✅ **Selective Image Deletion**: Delete specific images by URL  
✅ **Unlimited Images**: No more 10-image limit  
✅ **Backward Compatible**: Existing code continues to work  
✅ **Well Documented**: Swagger docs updated  
✅ **Secure**: Image ownership verification  
✅ **Robust**: Graceful error handling  

The implementation provides complete flexibility in managing product images while maintaining security and reliability.
