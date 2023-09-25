export const observationColumns = {
  createdAt: true,
  data: true,
  id: true,
  imageId: true,
  isDraft: true,
  updatedAt: true,
  uploadInProgress: true,
  fileUploads: {
    select: {
      id: true,
      createdAt: true,
      mimetype: true,
      originalName: true,
    }
  },
  image: {
    select: {
      id: true,
      createdAt: true,
      mimetype: true,
      originalName: true,
    }
  },
  user: {
    select: {
      email: true
    }
  }
};