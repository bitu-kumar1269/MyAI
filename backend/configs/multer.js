let uploadPromise;

const getUpload = async () => {
  if (!uploadPromise) {
    uploadPromise = import("multer").then(({ default: multer }) => {
      const storage = multer.diskStorage({});
      return multer({ storage });
    });
  }

  return uploadPromise;
};

export const singleUpload = (fieldName) => async (req, res, next) => {
  try {
    const upload = await getUpload();
    return upload.single(fieldName)(req, res, next);
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
