package com.store.main.service;

import com.store.main.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service for uploading files to Supabase Storage
 */
@Service
@Slf4j
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseServiceRoleKey;

    @Value("${supabase.storage.buckets.images:product-images}")
    private String imagesBucket;

    @Value("${supabase.storage.buckets.videos:product-videos}")
    private String videosBucket;

    @Value("${supabase.storage.limits.maxImageSize:5242880}")
    private long maxImageSize; // 5 MB default

    @Value("${supabase.storage.limits.maxVideoSize:52428800}")
    private long maxVideoSize; // 50 MB default

    private final RestTemplate restTemplate = new RestTemplate();

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );

    private static final List<String> ALLOWED_VIDEO_TYPES = Arrays.asList(
        "video/mp4", "video/webm"
    );

    /**
     * Upload an image to Supabase Storage
     *
     * @param file MultipartFile to upload
     * @param productId Product ID for organizing files
     * @return Public URL of the uploaded file
     */
    public String uploadImage(MultipartFile file, Long productId) throws IOException {
        validateImage(file);

        String fileName = generateFileName(productId, file.getOriginalFilename());
        String filePath = "products/" + productId + "/" + fileName;

        return uploadToSupabase(file, imagesBucket, filePath);
    }

    /**
     * Upload a video to Supabase Storage
     *
     * @param file MultipartFile to upload
     * @param productId Product ID for organizing files
     * @return Public URL of the uploaded file
     */
    public String uploadVideo(MultipartFile file, Long productId) throws IOException {
        validateVideo(file);

        String fileName = generateFileName(productId, file.getOriginalFilename());
        String filePath = "products/" + productId + "/" + fileName;

        return uploadToSupabase(file, videosBucket, filePath);
    }

    /**
     * Delete a file from Supabase Storage
     *
     * @param fileUrl Public URL of the file
     */
    public void deleteFile(String fileUrl) throws IOException {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        // Extract bucket and path from URL
        // URL format: https://PROJECT.supabase.co/storage/v1/object/public/BUCKET/PATH
        String bucketAndPath = extractBucketAndPath(fileUrl);
        if (bucketAndPath == null) {
            log.warn("Could not extract bucket and path from URL: {}", fileUrl);
            return;
        }

        String[] parts = bucketAndPath.split("/", 2);
        if (parts.length != 2) {
            log.warn("Invalid bucket and path format: {}", bucketAndPath);
            return;
        }

        String bucket = parts[0];
        String path = parts[1];

        deleteFromSupabase(bucket, path);
    }

    /**
     * Get public URL for a file
     *
     * @param bucket Bucket name
     * @param path File path within bucket
     * @return Public URL
     */
    public String getPublicUrl(String bucket, String path) {
        return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucket, path);
    }

    // ============================================================
    // Private Helper Methods
    // ============================================================

    private void validateImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        if (file.getSize() > maxImageSize) {
            throw new BadRequestException(
                String.format("Image size exceeds maximum limit of %d MB", maxImageSize / 1024 / 1024)
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException(
                "Invalid image type. Allowed types: JPEG, PNG, WebP, GIF"
            );
        }
    }

    private void validateVideo(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        if (file.getSize() > maxVideoSize) {
            throw new BadRequestException(
                String.format("Video size exceeds maximum limit of %d MB", maxVideoSize / 1024 / 1024)
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_VIDEO_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException(
                "Invalid video type. Allowed types: MP4, WebM"
            );
        }
    }

    private String generateFileName(Long productId, String originalFilename) {
        String extension = getFileExtension(originalFilename);
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        return String.format("product-%d-%s-%s%s", productId, timestamp, uniqueId, extension);
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDot = filename.lastIndexOf('.');
        return lastDot == -1 ? "" : filename.substring(lastDot);
    }

    private String uploadToSupabase(MultipartFile file, String bucket, String filePath) throws IOException {
        String uploadUrl = String.format("%s/storage/v1/object/%s/%s",
            supabaseUrl, bucket, filePath);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseServiceRoleKey);
            headers.set("apikey", supabaseServiceRoleKey);

            // Use the actual file's content type instead of application/octet-stream
            String contentType = file.getContentType();
            if (contentType != null && !contentType.isEmpty()) {
                headers.setContentType(org.springframework.http.MediaType.parseMediaType(contentType));
            } else {
                headers.setContentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM);
            }

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

            ResponseEntity<String> response = restTemplate.exchange(
                uploadUrl,
                HttpMethod.POST,
                entity,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("File uploaded successfully: {}", filePath);
                return getPublicUrl(bucket, filePath);
            } else {
                log.error("Supabase upload failed. Status: {}", response.getStatusCode());
                throw new IOException("Failed to upload file to Supabase");
            }
        } catch (Exception e) {
            log.error("Error uploading file", e);
            throw new IOException("Failed to upload file: " + e.getMessage());
        }
    }

    private void deleteFromSupabase(String bucket, String path) throws IOException {
        String deleteUrl = String.format("%s/storage/v1/object/%s/%s",
            supabaseUrl, bucket, path);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseServiceRoleKey);
            headers.set("apikey", supabaseServiceRoleKey);

            HttpEntity<Void> entity = new HttpEntity<>(null, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                deleteUrl,
                HttpMethod.DELETE,
                entity,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("File deleted successfully: {}", path);
            } else {
                log.warn("Supabase delete failed. Status: {}", response.getStatusCode());
                // Don't throw exception - file might already be deleted
            }
        } catch (Exception e) {
            log.warn("Error deleting file", e);
            // Don't throw exception - file might already be deleted
        }
    }

    private String extractBucketAndPath(String fileUrl) {
        // URL format: https://PROJECT.supabase.co/storage/v1/object/public/BUCKET/PATH
        String marker = "/storage/v1/object/public/";
        int index = fileUrl.indexOf(marker);
        if (index == -1) {
            return null;
        }
        return fileUrl.substring(index + marker.length());
    }
}
