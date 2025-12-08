import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css'; 

// --- 1. PANTALLA DE LOGIN / REGISTRO MEJORADA ---
function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true); // true = Login, false = Registro
  const [formData, setFormData] = useState({ email: '', password: '', username: '', role: 'comprador' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Decide a qué ruta llamar según el modo
    const endpoint = isLogin 
      ? 'http://localhost:5000/api/login' 
      : 'http://localhost:5000/api/register';
    
    try {
      const res = await axios.post(endpoint, formData);
      // Si es login, el backend nos devuelve el rol. Si es registro, usamos el del formulario.
      const userRole = res.data.role || formData.role; 
      onLogin(res.data.userId, userRole);
    } catch (err) {
      // Muestra el error que viene del servidor (ej: "Contraseña incorrecta")
      setError(err.response?.data?.error || 'Error al conectar con el servidor');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>RopaApp 👖</h1>
        <h2 style={styles.subtitle}>{isLogin ? '¡Hola de nuevo!' : 'Crea tu cuenta'}</h2>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Campo de Usuario (Solo visible en Registro) */}
          {!isLogin && (
            <input 
              style={styles.input}
              placeholder="Nombre de usuario" 
              onChange={e => setFormData({...formData, username: e.target.value})} 
              required 
            />
          )}

          <input 
            style={styles.input}
            placeholder="Correo electrónico" 
            type="email" 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
          />
          <input 
            style={styles.input}
            placeholder="Contraseña" 
            type="password" 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required 
          />
          
          {/* Selector de Rol (Solo visible en Registro) */}
          {!isLogin && (
            <div style={styles.selectContainer}>
              <label style={styles.label}>Quiero usar la app para:</label>
              <select style={styles.select} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="comprador">Comprar Ropa</option>
                <option value="vendedor">Vender Ropa</option>
              </select>
            </div>
          )}

          <button type="submit" style={styles.button}>
            {isLogin ? 'Entrar' : 'Registrarme'}
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
    axios.get('http://localhost:5000/api/products').then(res => setProducts(res.data));
  }, []);

  const handleBuy = async (productId) => {
    await axios.post('http://localhost:5000/api/purchase-intent', { productId, userId });
    alert("✅ ¡Gracias! Registramos tu interés. Te contactaremos cuando esté disponible.");
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

// --- 3. PUBLICAR PRENDA (Vendedores) ---
function Publish({ userId }) {
  const [form, setForm] = useState({ title: '', price: '', imageUrl: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/products', { ...form, seller: userId });
    alert("¡Prenda publicada con éxito!");
    navigate('/'); 
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Vender Prenda</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input placeholder="Título (ej: Polera Vintage)" onChange={e => setForm({...form, title: e.target.value})} required style={{padding: '10px'}}/>
        <input placeholder="Precio ($)" type="number" onChange={e => setForm({...form, price: e.target.value})} required style={{padding: '10px'}}/>
        <input placeholder="URL de la Foto (link de google)" onChange={e => setForm({...form, imageUrl: e.target.value})} required style={{padding: '10px'}}/>
        <button type="submit" style={{padding: '15px', background: 'green', color: 'white'}}>PUBLICAR</button>
      </form>
    </div>
  );
}

// --- 4. MURO SOCIAL ---
function SocialFeed({ userId }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    axios.get('http://localhost:5000/api/posts').then(res => setPosts(res.data));
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if(!newPost) return;
    await axios.post('http://localhost:5000/api/posts', { text: newPost, author: userId });
    setNewPost("");
    loadPosts(); 
  };

  const handleLike = async (postId) => {
    await axios.put(`http://localhost:5000/api/posts/${postId}/like`);
    loadPosts(); 
  };

  return (
    <div style={{ padding: '10px 10px 80px 10px' }}>
      <h2>Comunidad</h2>
      
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f9f9f9', borderRadius: '10px' }}>
        <textarea 
          placeholder="¿Qué estás pensando?" 
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          style={{ width: '100%', height: '60px', padding: '5px', marginBottom: '5px' }}
        />
        <button onClick={handlePost} style={{ background: 'black', color: 'white', padding: '5px 15px', border: 'none' }}>Publicar</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {posts.map(post => (
          <div key={post._id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '10px', background: 'white' }}>
            <div style={{fontWeight: 'bold', marginBottom: '5px'}}>@{post.author?.username || 'Usuario'}</div>
            <p style={{ margin: '5px 0' }}>{post.text}</p>
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

// --- 5. APP PRINCIPAL ---
function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (id, role) => {
    setUser({ id, role });
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Catalog userId={user.id} />} />
        <Route path="/social" element={<SocialFeed userId={user.id} />} />
        <Route path="/vender" element={user.role === 'vendedor' ? <Publish userId={user.id} /> : <Navigate to="/" />} />
      </Routes>

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
      </nav>
    </BrowserRouter>
  );
}

// --- ESTILOS VISUALES (CSS en JS) ---
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