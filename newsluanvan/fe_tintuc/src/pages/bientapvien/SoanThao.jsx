import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const SoanThao = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState('');
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [libraryImages, setLibraryImages] = useState([]);
  const [imageCallback, setImageCallback] = useState(null);
  const editorRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [articleId, setArticleId] = useState(null);
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (showImageLibrary) {
      fetch('http://localhost:3000/api/medias')
        .then(res => res.json())
        .then(data => setLibraryImages(data))
        .catch(() => setLibraryImages([]));
    }
  }, [showImageLibrary]);

  useEffect(() => {
    fetch('http://localhost:3000/api/category')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetch('http://localhost:3000/api/tags')
      .then(res => res.json())
      .then(data => setAllTags(data))
      .catch(() => setAllTags([]));
  }, []);

  const handleEditorChange = (content) => {
    setContent(content);
  };

  const handleSaveDraft = async () => {
    if (!title || !category || !content) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('content', content);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }
      formData.append('action', 'draft');
      const adminId = localStorage.getItem('adminId'); // Lấy id biên tập viên đã đăng nhập
      if (!adminId) {
        setError('Thiếu userId (người dùng chưa đăng nhập)');
        return;
      }
      formData.append('userId', adminId); // Gửi userId lên backend
      const response = await fetch('http://localhost:3000/api/soanthao', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Lỗi lưu nháp!');
        return;
      }
      setArticleId(data.id);
      setError('');
      alert('Đã lưu nháp!');
    } catch (err) {
      setError('Lỗi kết nối server!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset lỗi trước khi submit
    if (!title || !category || !content) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('content', content);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }
      formData.append('action', 'submit');
      formData.append('tags', JSON.stringify(tags));
      const adminId = localStorage.getItem('adminId');
      if (!adminId) {
        setError('Thiếu userId (người dùng chưa đăng nhập)');
        return;
      }
      formData.append('userId', adminId);
      // 1. Lưu vào articles
      const response = await fetch('http://localhost:3000/api/soanthao', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Lỗi đăng bài!');
        return;
      }
      setArticleId(data.id);
      // 2. Lưu vào articles_approvals (nếu cần, ở đây luôn là gửi duyệt)
      // Nếu backend đã tự động lưu vào articles_approvals thì có thể bỏ đoạn này
      // Nếu vẫn cần gọi API phụ:
      /*
      const approvalRes = await fetch('http://localhost:3000/api/articles_approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles_id: data.id,
          status: 'pending',
          user_id: adminId
        })
      });
      const approvalData = await approvalRes.json();
      if (!approvalRes.ok) {
        setError(approvalData.message || 'Lỗi gửi duyệt bài!');
        return;
      }
      */
      // Thành công: reset form và error
      setError('');
      alert('Gửi duyệt bài thành công!');
      setTitle('');
      setCategory('');
      setContent('');
      setThumbnail(null);
      setArticleId(null);
    } catch (err) {
      setError('Lỗi kết nối server!');
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.url) {
      await fetch('http://localhost:3000/api/medias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_url: data.url,
          file_name: file.name,
          file_type: file.type,
          article_id: articleId || null
        })
      });
    }
    return data.url;
  };

  const filePickerCallback = (callback, value, meta) => {
    setImageCallback(() => callback);
    setShowImageLibrary(true);
  };

  const handleSelectImage = (url) => {
    if (imageCallback) {
      imageCallback(url, { alt: '' });
    }
    setShowImageLibrary(false);
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Soạn thảo bài viết</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label htmlFor="title" className="form-label">Tiêu đề bài viết *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Nhập tiêu đề bài viết..."
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="category" className="form-label">Danh mục *</label>
                    <select
                      className="form-select"
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="thumbnail" className="form-label">Ảnh thumbnail</label>
                    <input
                      type="file"
                      className="form-control"
                      id="thumbnail"
                      accept="image/*"
                      onChange={(e) => setThumbnail(e.target.files[0])}
                    />
                    {thumbnail && (
                      <small className="text-muted">
                        Đã chọn: {thumbnail.name}
                      </small>
                    )}
                  </div>

                  

                  <div className="col-12 mb-3">
                    <label className="form-label">Nội dung bài viết *</label>
                    <Editor
                      apiKey="45grzb8lc69dadcvt2yggo903sdvqxl3oa5hki4cv2n3gfne"
                      onInit={(evt, editor) => editorRef.current = editor}
                      init={{
                        height: 500,
                        menubar: true,
                        plugins: [
                          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                          'bold italic forecolor | alignleft aligncenter ' +
                          'alignright alignjustify | bullist numlist outdent indent | ' +
                          'removeformat | image | help',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                        file_picker_types: 'image',
                        file_picker_callback: function (callback, value, meta) {
                          const input = document.createElement('input');
                          input.setAttribute('type', 'file');
                          input.setAttribute('accept', 'image/*');
                          input.onchange = async function () {
                            const file = this.files[0];
                            if (file) {
                              const url = await uploadImage(file);
                              callback(url, { alt: file.name });
                            }
                          };
                          input.click();
                        }
                      }}
                      onEditorChange={handleEditorChange}
                    />
                  </div>

                  {error && (
                    <div className="col-12 mb-3">
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    </div>
                  )}



                  <div className="col-md-12 mb-3">
                    <FormControl fullWidth>
                      <InputLabel id="tags-label">Tags</InputLabel>
                      <Select
                        labelId="tags-label"
                        id="tags"
                        multiple
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        renderValue={(selected) => selected.join(', ')}
                      >
                        {allTags.map((tag) => (
                          <MenuItem key={tag.id || tag} value={tag.name || tag}>
                            {tag.name || tag}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {/* Thêm tag mới */}
                    <div className="mt-2 d-flex">
                      <TextField
                        size="small"
                        label="Thêm tag mới"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newTag.trim()) {
                            e.preventDefault();
                            if (!tags.includes(newTag.trim())) setTags([...tags, newTag.trim()]);
                            setNewTag('');
                          }
                        }}
                        style={{ flex: 1, marginRight: 8 }}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (newTag.trim() && !tags.includes(newTag.trim())) {
                            setTags([...tags, newTag.trim()]);
                            setNewTag('');
                          }
                        }}
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>












                  <div className="col-12">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleSaveDraft}
                      >
                        <i className="fa fa-save me-2"></i>
                        Lưu nháp
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        <i className="fa fa-paper-plane me-2"></i>
                        Gửi Duyệt Bài
                      </button>
                    </div>




                    



                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showImageLibrary && (
        <div className="modal" style={{
          display: 'block',
          background: 'rgba(0,0,0,0.3)',
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999
        }}>
          <div className="modal-dialog" style={{maxWidth: 600, margin: '5% auto'}}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chọn ảnh từ thư viện</h5>
                <button type="button" className="btn-close" onClick={() => setShowImageLibrary(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {libraryImages.length === 0 && <div>Không có ảnh nào.</div>}
                  {libraryImages.map(img => (
                    <div className="col-4 mb-2" key={img.id}>
                      <img
                        src={img.file_url}
                        alt=""
                        style={{
                          width: '100%',
                          cursor: 'pointer',
                          border: '2px solid #eee',
                          borderRadius: 4
                        }}
                        onClick={() => handleSelectImage(img.file_url)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoanThao;
