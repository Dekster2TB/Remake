import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css'; 

// URL DE LA API (Asegúrate que sea la correcta de Render)
const API_URL = 'https://remake-6kfb.onrender.com/api'; 

// --- 1. PANTALLA DE BIENVENIDA (Login/Registro) ---
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
      setError(err.response?.data?.error || 'No pudimos conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <div className="card" style={{width: '90%', border: 'none', boxShadow: 'none', background: 'transparent'}}>
        <div className="text-center" style={{marginBottom: '40px'}}>
          <h1 className="brand-title">REMAKE</h1>
          <p className="text-muted" style={{fontSize: '1.1rem'}}>
            {isLogin ? 'Reinventa tu estilo.' : 'Únete a la revolución de la moda circular.'}
          </p>
        </div>
        
        <div className="card" style={{padding: '30px'}}>
            {error && <div style={{background: '#ff7675', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '15px'}}>{error}</div>}

            <form onSubmit={handleSubmit} className="form-group">
            {!isLogin && (
                <input placeholder="Nombre de usuario" onChange={e => setFormData({...formData, username: e.target.value})} required />
            )}
            <input placeholder="Correo electrónico" type="email" onChange={e => setFormData({...formData, email: e.target.value})} required />
            <input placeholder="Contraseña" type="password" onChange={e => setFormData({...formData, password: e.target.value})} required />
            
            {!isLogin && (
                <select onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="comprador">Quiero Comprar</option>
                <option value="vendedor">Quiero Vender</option>
                </select>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </button>
            </form>
        </div>

        <div className="text-center" style={{marginTop: '30px'}}>
          <p className="text-muted">
            {isLogin ? "¿Aún no tienes cuenta? " : "¿Ya tienes cuenta? "}
            <button onClick={() => setIsLogin(!isLogin)} className="btn-link">
              {isLogin ? "Regístrate aquí" : "Ingresa aquí"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- 2. CATÁLOGO DE PRODUCTOS ---
function Catalog({ userId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/products`).then(res => setProducts(res.data));
  }, []);

  const handleBuy = async (productId) => {
    await axios.post(`${API_URL}/purchase-intent`, { productId, userId });
    alert("✨ ¡Interés registrado! El vendedor será notificado.");
  };

  return (
    <div className="content-wrap">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2>Descubrir</h2>
        <span style={{fontSize: '0.9rem', background: '#e1e1e1', padding: '5px 10px', borderRadius: '20px'}}>Todo</span>
      </div>
      
      <div className="grid-2">
        {products.map(p => (
          <div key={p._id} className="card product-card">
            <img src={p.imageUrl} alt={p.title} />
            <div className="card-content">
              <h4 style={{fontSize: '1rem', marginBottom: '5px'}}>{p.title}</h4>
              <p style={{fontWeight: 'bold', fontSize: '1.1rem'}}>${p.price}</p>
              <button onClick={() => handleBuy(p._id)} className="btn btn-accent" style={{padding: '8px', fontSize: '14px', marginTop: '10px'}}>
                Lo quiero
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 3. PUBLICAR PRENDA (Vendedores) ---
function Publish({ userId }) {
  const [form, setForm] = useState({ title: '', price: '' });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("¡La foto es obligatoria!");
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await axios.post(`${API_URL}/products`, { 
        ...form, imageUrl: uploadRes.data.url, seller: userId 
      });
      
      alert("¡Publicado en REMAKE!");
      navigate('/'); 
    } catch (error) {
      alert("Error al subir");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="content-wrap">
      <h2>Vender en REMAKE</h2>
      <p className="text-muted" style={{marginBottom: '20px'}}>Dale una segunda vida a esa prenda.</p>
      
      <form onSubmit={handleSubmit} className="form-group card">
        <label className="file-upload-box">
          {imageFile ? 
            <span style={{color: 'var(--success)', fontWeight: 'bold'}}>📸 {imageFile.name}</span> : 
            <span>📂 Toca para subir foto de la prenda</span>
          }
          <input type="file" accept="image/*" style={{display: 'none'}} onChange={e => setImageFile(e.target.files[0])}/>
        </label>

        <input placeholder="¿Qué estás vendiendo?" onChange={e => setForm({...form, title: e.target.value})} required />
        <input placeholder="Precio ($)" type="number" onChange={e => setForm({...form, price: e.target.value})} required />
        
        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? 'Subiendo...' : 'Publicar Ahora'}
        </button>
      </form>
    </div>
  );
}

// --- 4. COMUNIDAD (Social Feed) ---
function SocialFeed({ userId }) {
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = () => { axios.get(`${API_URL}/posts`).then(res => setPosts(res.data)); };

  const handlePost = async () => {
    if (!newPostText) return;
    setLoading(true);
    try {
      let imageUrl = null;
      if (postImage) {
        const formData = new FormData();
        formData.append('image', postImage);
        const res = await axios.post(`${API_URL}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        imageUrl = res.data.url;
      }
      await axios.post(`${API_URL}/posts`, { text: newPostText, author: userId, imageUrl });
      setNewPostText(""); setPostImage(null); loadPosts();
    } catch(e) { alert("Error al publicar"); } finally { setLoading(false); }
  };

  const handleLike = async (postId) => {
    await axios.put(`${API_URL}/posts/${postId}/like`);
    loadPosts();
  };

  return (
    <div className="content-wrap">
      <h2>Comunidad</h2>
      
      {/* Caja para crear post */}
      <div className="card" style={{borderLeft: '4px solid var(--accent)'}}>
        <textarea 
          placeholder="Comparte tu outfit, ideas o preguntas..." 
          value={newPostText}
          onChange={e => setNewPostText(e.target.value)}
          rows="2"
          style={{border: 'none', padding: '0', resize: 'none'}}
        />
        <div style={{height: '1px', background: '#eee', margin: '10px 0'}}></div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
           <label style={{cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem'}}>
              <span>📷</span>
              {postImage ? 'Foto lista' : 'Foto'}
              <input type="file" accept="image/*" style={{display: 'none'}} onChange={e => setPostImage(e.target.files[0])}/>
           </label>
           <button onClick={handlePost} className="btn btn-primary" style={{width: 'auto', padding: '8px 20px', borderRadius: '20px'}}>
             {loading ? '...' : 'Publicar'}
           </button>
        </div>
      </div>

      {/* Lista de Posts */}
      {posts.map(post => (
        <div key={post._id} className="card post-card">
          <div className="card-content" style={{paddingBottom: 0}}>
            <strong style={{color: 'var(--primary)'}}>@{post.author?.username || 'Usuario'}</strong>
            <p style={{marginTop: '5px', fontSize: '0.95rem'}}>{post.text}</p>
          </div>
          {post.imageUrl && <img src={post.imageUrl} alt="post" />}
          <div className="card-content" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <button onClick={() => handleLike(post._id)} className="btn-link" style={{fontSize: '1.2rem'}}>
              ❤️ {post.likes}
            </button>
            <span className="text-muted" style={{fontSize: '0.8rem'}}>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- 5. PERFIL DE USUARIO ---
function Profile({ user, onLogout }) {
  return (
    <div className="content-wrap text-center">
      <h2>Mi Perfil</h2>
      <div className="card">
        <div className="avatar-circle" style={{background: 'var(--primary)', color: 'white'}}>
            {user.username.charAt(0).toUpperCase()}
        </div>
        <h3 style={{marginBottom: '5px'}}>@{user.username}</h3>
        <span style={{background: '#dfe6e9', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'}}>
          {user.role.toUpperCase()}
        </span>
        
        <div style={{marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
          <button onClick={onLogout} className="btn btn-danger">Cerrar Sesión</button>
        </div>
      </div>
    </div>
  )
}

// --- NAVEGACIÓN INFERIOR ---
function Navigation({ role }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'nav-item active' : 'nav-item';

  return (
    <nav className="bottom-nav">
      <Link to="/" className={isActive('/')}>🏠</Link>
      
      {/* El botón central cambia según el rol */}
      {role === 'vendedor' ? (
        <Link to="/vender" className="nav-item-main">➕</Link>
      ) : (
        <Link to="/social" className="nav-item-main">📷</Link>
      )}

      {/* Si es vendedor, el social va a un lado */}
      {role === 'vendedor' && <Link to="/social" className={isActive('/social')}>👥</Link>}
      
      <Link to="/perfil" className={isActive('/perfil')}>👤</Link>
    </nav>
  );
}

// --- APP PRINCIPAL ---
function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (id, role, username) => setUser({ id, role, username });
  const handleLogout = () => setUser(null);

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
            <Route path="/" element={<Catalog userId={user.id} />} />
            <Route path="/social" element={<SocialFeed userId={user.id} />} />
            <Route path="/vender" element={user.role === 'vendedor' ? <Publish userId={user.id} /> : <Navigate to="/" />} />
            <Route path="/perfil" element={<Profile user={user} onLogout={handleLogout} />} />
        </Routes>
        <Navigation role={user.role} />
      </div>
    </BrowserRouter>
  );
}

export default App;