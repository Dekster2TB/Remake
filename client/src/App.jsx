import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css'; 

// const API_URL = 'http://localhost:5000/api'; // LOCAL
const API_URL = 'https://remake-6kfb.onrender.com/api'; // RENDER (Producción)

// --- 1. PANTALLA DE LOGIN / REGISTRO ---
function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', username: '', role: 'comprador' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isLogin ? `${API_URL}/login` : `${API_URL}/register`;
    
    try {
      const res = await axios.post(endpoint, formData);
      const userRole = res.data.role || formData.role; 
      onLogin(res.data.userId, userRole, res.data.username);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>RopaApp 👖</h1>
        <h2 style={styles.subtitle}>{isLogin ? '¡Hola de nuevo!' : 'Crea tu cuenta'}</h2>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <input style={styles.input} placeholder="Nombre de usuario" onChange={e => setFormData({...formData, username: e.target.value})} required />
          )}
          <input style={styles.input} placeholder="Correo electrónico" type="email" onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input style={styles.input} placeholder="Contraseña" type="password" onChange={e => setFormData({...formData, password: e.target.value})} required />
          
          {!isLogin && (
            <div style={styles.selectContainer}>
              <label style={styles.label}>Quiero usar la app para:</label>
              <select style={styles.select} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="comprador">Comprar Ropa</option>
                <option value="vendedor">Vender Ropa</option>
              </select>
            </div>
          )}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarme')}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <span onClick={() => setIsLogin(!isLogin)} style={styles.link}>
            {isLogin ? "Regístrate aquí" : "Inicia Sesión"}
          </span>
        </p>
      </div>
    </div>
  );
}

// --- 2. CATÁLOGO (HOME) ---
function Catalog({ userId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
  }, []);

  const handleBuy = async (productId) => {
    await axios.post(`${API_URL}/purchase-intent`, { productId, userId });
    alert("✅ ¡Gracias! Registramos tu interés.");
  };

  return (
    <div style={{ padding: '10px 10px 80px 10px' }}>
      <h2>Catálogo</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {products.map(p => (
          <div key={p._id} style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
            <div style={{ padding: '10px' }}>
              <h4 style={{ margin: '0 0 5px 0' }}>{p.title}</h4>
              <p style={{ margin: '0 0 10px 0', color: '#666' }}>${p.price}</p>
              <small>Vendedor: {p.seller?.username || 'Anónimo'}</small>
              <button onClick={() => handleBuy(p._id)} style={{ width: '100%', marginTop: '10px', background: '#007bff', color: 'white', border: 'none', padding: '8px', borderRadius: '5px' }}>
                Lo quiero
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 3. PUBLICAR PRENDA (CON FOTO) ---
function Publish({ userId }) {
  const [form, setForm] = useState({ title: '', price: '', description: '' });
  const [imageFile, setImageFile] = useState(null); // Guardamos el archivo
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("¡Debes subir una foto!");
    
    setUploading(true);
    try {
      // 1. Subir imagen primero
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = uploadRes.data.url;

      // 2. Guardar producto con la URL
      await axios.post(`${API_URL}/products`, { 
        ...form, 
        imageUrl, 
        seller: userId 
      });
      
      alert("¡Prenda publicada con éxito!");
      navigate('/'); 
    } catch (error) {
      console.error(error);
      alert("Error al publicar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Vender Prenda</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input placeholder="Título" onChange={e => setForm({...form, title: e.target.value})} required style={styles.input}/>
        <input placeholder="Precio ($)" type="number" onChange={e => setForm({...form, price: e.target.value})} required style={styles.input}/>
        
        {/* INPUT DE ARCHIVO */}
        <div style={{border: '2px dashed #ccc', padding: '20px', textAlign: 'center'}}>
          <label style={{cursor: 'pointer', display: 'block'}}>
            {imageFile ? `📸 ${imageFile.name}` : "Toca para subir foto"}
            <input 
              type="file" 
              accept="image/*" 
              style={{display: 'none'}} 
              onChange={e => setImageFile(e.target.files[0])}
            />
          </label>
        </div>

        <button type="submit" style={{...styles.button, background: 'green'}} disabled={uploading}>
          {uploading ? 'Subiendo foto...' : 'PUBLICAR'}
        </button>
      </form>
    </div>
  );
}

// --- 4. MURO SOCIAL (CON FOTO OPCIONAL) ---
function SocialFeed({ userId }) {
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [loadingPost, setLoadingPost] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    axios.get(`${API_URL}/posts`).then(res => setPosts(res.data));
  };

  const handlePost = async () => {
    if (!newPostText) return;
    setLoadingPost(true);

    try {
      let imageUrl = null;
      // Si seleccionó foto, la subimos
      if (postImage) {
        const formData = new FormData();
        formData.append('image', postImage);
        const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.url;
      }

      // Creamos el post
      await axios.post(`${API_URL}/posts`, { 
        text: newPostText, 
        author: userId,
        imageUrl: imageUrl // Puede ser null o la url
      });

      setNewPostText("");
      setPostImage(null);
      loadPosts(); 
    } catch (error) {
      alert("Error al publicar");
    } finally {
      setLoadingPost(false);
    }
  };

  const handleLike = async (postId) => {
    await axios.put(`${API_URL}/posts/${postId}/like`);
    loadPosts(); 
  };

  return (
    <div style={{ padding: '10px 10px 80px 10px' }}>
      <h2>Comunidad</h2>
      
      {/* Crear Publicación */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '10px', border: '1px solid #eee' }}>
        <textarea 
          placeholder="¿Qué estás pensando?" 
          value={newPostText}
          onChange={e => setNewPostText(e.target.value)}
          style={{ width: '100%', height: '60px', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
        />
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
           {/* Botón Foto Pequeño */}
           <label style={{cursor: 'pointer', color: '#007bff', fontSize: '14px'}}>
              {postImage ? '✅ Foto lista' : '📷 Agregar foto'}
              <input type="file" accept="image/*" style={{display: 'none'}} onChange={e => setPostImage(e.target.files[0])}/>
           </label>

           <button onClick={handlePost} disabled={loadingPost} style={{ background: 'black', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '20px' }}>
             {loadingPost ? '...' : 'Publicar'}
           </button>
        </div>
      </div>

      {/* Lista de Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {posts.map(post => (
          <div key={post._id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '10px', background: 'white' }}>
            <div style={{fontWeight: 'bold', marginBottom: '5px'}}>@{post.author?.username || 'Usuario'}</div>
            <p style={{ margin: '5px 0' }}>{post.text}</p>
            
            {/* Si tiene imagen, la mostramos */}
            {post.imageUrl && (
                <img src={post.imageUrl} alt="post" style={{width: '100%', borderRadius: '10px', marginTop: '10px', maxHeight: '300px', objectFit: 'cover'}}/>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#888', marginTop: '10px' }}>
              <button onClick={() => handleLike(post._id)} style={{ background: 'none', border: '1px solid #ddd', borderRadius: '20px', padding: '5px 10px', cursor: 'pointer' }}>
                ❤️ {post.likes}
              </button>
              <small>{new Date(post.createdAt).toLocaleDateString()}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 5. COMPONENTE DE PERFIL Y LOGOUT ---
function Profile({ user, onLogout }) {
    return (
        <div style={{padding: '20px', textAlign: 'center'}}>
            <h2>Mi Perfil</h2>
            <div style={{width: '80px', height: '80px', background: '#ddd', borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px'}}>
                👤
            </div>
            <h3>@{user.username}</h3>
            <p>Rol: {user.role.toUpperCase()}</p>
            <br/>
            <button onClick={onLogout} style={{background: 'red', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', fontSize: '16px'}}>
                Cerrar Sesión
            </button>
        </div>
    )
}

// --- APP PRINCIPAL ---
function App() {
  const [user, setUser] = useState(null);

  // Recuperar sesión si existe (opcional para el futuro, por ahora simple)
  // const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const handleLogin = (id, role, username) => {
    const userData = { id, role, username };
    setUser(userData);
    // localStorage.setItem('user', JSON.stringify(userData)); // Si quisieras persistencia
  };

  const handleLogout = () => {
    setUser(null);
    // localStorage.removeItem('user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div style={{paddingBottom: '70px'}}>
        <Routes>
            <Route path="/" element={<Catalog userId={user.id} />} />
            <Route path="/social" element={<SocialFeed userId={user.id} />} />
            <Route path="/vender" element={user.role === 'vendedor' ? <Publish userId={user.id} /> : <Navigate to="/" />} />
            <Route path="/perfil" element={<Profile user={user} onLogout={handleLogout} />} />
        </Routes>
      </div>

      {/* Menú de Navegación Inferior */}
      <nav style={{ 
        position: 'fixed', bottom: 0, width: '100%', height: '60px', 
        background: 'white', borderTop: '1px solid #ccc', 
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        zIndex: 1000
      }}>
        <Link to="/" style={{ textDecoration: 'none', fontSize: '24px' }}>🏠</Link>
        <Link to="/social" style={{ textDecoration: 'none', fontSize: '24px' }}>👥</Link>
        {user.role === 'vendedor' && (
          <Link to="/vender" style={{ textDecoration: 'none', fontSize: '24px' }}>➕</Link>
        )}
        <Link to="/perfil" style={{ textDecoration: 'none', fontSize: '24px' }}>👤</Link>
      </nav>
    </BrowserRouter>
  );
}

// Estilos
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5', fontFamily: 'Arial, sans-serif' },
  card: { background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px', textAlign: 'center' },
  title: { margin: '0', color: '#333', fontSize: '28px' },
  subtitle: { margin: '10px 0 20px', color: '#666', fontSize: '16px', fontWeight: 'normal' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', outline: 'none' },
  selectContainer: { textAlign: 'left' },
  label: { fontSize: '14px', color: '#555', marginBottom: '5px', display: 'block' },
  select: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' },
  button: { padding: '12px', borderRadius: '8px', border: 'none', background: '#007bff', color: 'white', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  toggleText: { marginTop: '20px', fontSize: '14px', color: '#666' },
  link: { color: '#007bff', cursor: 'pointer', fontWeight: 'bold' },
  error: { background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '14px' }
};

export default App;