# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for product images and videos.

## Prerequisites

- Supabase account with your JStore project
- Access to Supabase Dashboard
- Your project URL: `https://doxksbweeaxtewrlcvat.supabase.co`

---

## Step 1: Create Storage Buckets

### 1.1 Go to Storage Section

1. Open your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**

### 1.2 Create Product Images Bucket

1. **Bucket name**: `product-images`
2. **Public bucket**: ✅ **YES** (Enable public access)
   - This allows direct URL access to images without authentication
3. **File size limit**: `5 MB` (or adjust as needed)
4. **Allowed MIME types**:
   - `image/jpeg`
   - `image/png`
   - `image/webp`
   - `image/gif`
5. Click **Create bucket**

### 1.3 Create Product Videos Bucket

1. **Bucket name**: `product-videos`
2. **Public bucket**: ✅ **YES**
3. **File size limit**: `50 MB` (or adjust as needed)
4. **Allowed MIME types**:
   - `video/mp4`
   - `video/webm`
5. Click **Create bucket**

---

## Step 2: Configure Bucket Policies

### 2.1 Product Images Policies

1. Click on `product-images` bucket
2. Go to **Policies** tab
3. Click **New Policy**

**Policy 1: Public Read Access**
```sql
-- Allow anyone to view images (public read)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

**Policy 2: Authenticated Upload**
```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');
```

**Policy 3: Authenticated Update**
```sql
-- Allow authenticated users to update images
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');
```

**Policy 4: Authenticated Delete**
```sql
-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

### 2.2 Product Videos Policies

Repeat the same policies for `product-videos` bucket (replace `'product-images'` with `'product-videos'`)

---

## Step 3: Get Service Role Key

The service role key is needed for backend file uploads.

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click **API** tab
3. Scroll to **Project API keys**
4. Copy the **`service_role`** key (not the anon/public key!)
   - ⚠️ **IMPORTANT**: This key has full admin access - keep it secret!
   - Never commit this key to Git
   - Only use it on the backend server

**Your service role key location**: Keep this in environment variables or `application.yml`

---

## Step 4: Test Storage Access

### 4.1 Test Upload (Optional)

1. Go to `product-images` bucket
2. Click **Upload file**
3. Upload a test image
4. Note the public URL format:

```
https://doxksbweeaxtewrlcvat.supabase.co/storage/v1/object/public/product-images/{filename}
```

### 4.2 Verify Public Access

1. Copy the public URL from step 4.1
2. Open it in a new browser tab (incognito/private mode)
3. ✅ If you can see the image, public access is working!

---

## Step 5: Configure Backend Application

Add the following to `/home/thanhjash/JStore/main/src/main/resources/application.yml`:

```yaml
# Supabase Storage Configuration
supabase:
  url: https://doxksbweeaxtewrlcvat.supabase.co
  key: ${SUPABASE_SERVICE_ROLE_KEY:your-service-role-key-here}
  storage:
    buckets:
      images: product-images
      videos: product-videos
    limits:
      maxImageSize: 5242880  # 5 MB in bytes
      maxVideoSize: 52428800 # 50 MB in bytes
    allowedTypes:
      images:
        - image/jpeg
        - image/png
        - image/webp
        - image/gif
      videos:
        - video/mp4
        - video/webm
```

**For production**, use environment variable:

```bash
export SUPABASE_SERVICE_ROLE_KEY="your-actual-service-role-key"
```

---

## Step 6: Database Setup

Run the product_media table creation script:

1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy the contents of `product_media.sql`
4. Click **Run**
5. ✅ Verify the `product_media` table was created in **Table Editor**

---

## File Organization Best Practices

### Recommended Folder Structure

```
product-images/
  ├── products/
  │   ├── {product-id}/
  │   │   ├── main.jpg
  │   │   ├── gallery-1.jpg
  │   │   ├── gallery-2.jpg
  │   │   └── gallery-3.jpg
  │   └── ...
  └── temp/  (for temporary uploads)

product-videos/
  ├── products/
  │   ├── {product-id}/
  │   │   └── intro.mp4
  │   └── ...
  └── temp/
```

### File Naming Convention

**Images**: `product-{product-id}-{timestamp}-{index}.{ext}`
- Example: `product-42-1678901234-1.jpg`

**Videos**: `product-{product-id}-{timestamp}-intro.{ext}`
- Example: `product-42-1678901234-intro.mp4`

---

## Security Checklist

- [ ] ✅ Service role key is stored in environment variable (not committed to Git)
- [ ] ✅ Public buckets are enabled for `product-images` and `product-videos`
- [ ] ✅ RLS policies allow public read but require authentication for write/delete
- [ ] ✅ File size limits are configured
- [ ] ✅ MIME type restrictions are in place
- [ ] ✅ `.env` file is in `.gitignore`

---

## Troubleshooting

### Issue: "Storage bucket not found"
**Solution**: Double-check bucket names match exactly (`product-images`, `product-videos`)

### Issue: "403 Forbidden" when viewing images
**Solution**:
1. Ensure bucket is marked as **Public**
2. Verify RLS policy for SELECT is created
3. Check URL format is correct

### Issue: "413 Payload Too Large"
**Solution**:
1. Check file size against bucket limits
2. Adjust `maxImageSize` / `maxVideoSize` in application.yml
3. Update bucket file size limit in Supabase Dashboard

### Issue: "Invalid file type"
**Solution**:
1. Verify MIME type is in allowed list
2. Check file extension matches MIME type
3. Update allowed types in bucket configuration

---

## Next Steps

After completing this setup:

1. ✅ Run `product_media.sql` in Supabase SQL Editor
2. ✅ Add Supabase configuration to `application.yml`
3. ✅ Set `SUPABASE_SERVICE_ROLE_KEY` environment variable
4. ✅ Proceed with backend implementation (SupabaseStorageService)

---

## Support

- Supabase Storage Docs: https://supabase.com/docs/guides/storage
- Supabase Storage Policies: https://supabase.com/docs/guides/storage/security/access-control
- JStore Issues: https://github.com/your-repo/issues
