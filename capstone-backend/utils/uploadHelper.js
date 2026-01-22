const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Multer memory storage for handling files in memory
const memoryStorage = multer.memoryStorage();

// File filter for images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// File filter for PDFs
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// Multer configurations
const uploadImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for images
});

const uploadPDF = multer({
  storage: memoryStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit for PDFs
});

// Upload to Cloudinary from buffer
const uploadToCloudinary = (buffer, folder, resourceType = 'image', originalFilename = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: `capstone-archive/${folder}`,
      resource_type: resourceType === 'pdf' ? 'raw' : resourceType,
      timeout: 120000,
    };

    // For PDFs, preserve the .pdf extension in public_id
    if (resourceType === 'pdf' && originalFilename) {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      // Remove extension from original filename
      const cleanName = originalFilename.replace(/\.pdf$/i, '');
      const safeName = cleanName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
      // Do NOT include .pdf in public_id - Cloudinary handles raw files differently
      options.public_id = `${safeName}_${timestamp}_${randomString}`;
    }

    if (resourceType === 'image') {
      options.allowed_formats = ['jpg', 'png', 'jpeg', 'gif', 'webp'];
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          let finalUrl = result.secure_url;
          
          // For PDFs, add fl_attachment flag with proper filename
          if (resourceType === 'pdf' && originalFilename) {
            let cleanFilename = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
            // Ensure filename ends with .pdf
            if (!cleanFilename.toLowerCase().endsWith('.pdf')) {
              cleanFilename += '.pdf';
            }
            // Use proper Cloudinary transformation format
            const urlParts = result.secure_url.split('/upload/');
            if (urlParts.length === 2) {
              finalUrl = `${urlParts[0]}/upload/fl_attachment:${encodeURIComponent(cleanFilename)}/${urlParts[1]}`;
            }
          }
          
          resolve({
            url: finalUrl,
            public_id: result.public_id,
          });
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType === 'pdf' ? 'raw' : resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw error;
  }
};

module.exports = {
  uploadImage,
  uploadPDF,
  uploadToCloudinary,
  deleteFromCloudinary
};