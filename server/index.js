require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importar modelos
const User = require('./models/User');
const Product = require('./models/Product');
const Metric = require('./models/Metric');
const SocialPost = require('./models/SocialPost');

const app = express();
app.use(express.json());
app.use(cors());

// 1. CONEXIÓN A BASE DE DATOS
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error(err));

// --- RUTAS DE LA API ---

// A. REGISTRO DE USUARIO [cite: 8]
app.post('/api/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json({ message: "Usuario creado", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// A.2 INICIO DE SESIÓN (LOGIN) - AGREGA ESTO EN server/index.js
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // 1. Buscamos si existe el usuario
    const user = await User.findOne({ email });
    
    // 2. Si no existe o la contraseña no coincide
    if (!user || user.password !== password) {
      return res.status(400).json({ error: "Correo o contraseña incorrectos" });
    }

    // 3. Si todo está bien, devolvemos sus datos
    res.json({ message: "Login exitoso", userId: user._id, role: user.role, username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// B. CATÁLOGO (Ver productos) [cite: 19]
app.get('/api/products', async (req, res) => {
  // Populate trae los datos del vendedor en lugar de solo su ID
  const products = await Product.find().populate('seller', 'username');
  res.json(products);
});

// C. PUBLICAR PRENDA (Solo vendedores) 
app.post('/api/products', async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.json({ message: "Producto publicado" });
});

// D. SIMULACIÓN DE COMPRA (Métrica Clave) [cite: 25, 26]
app.post('/api/purchase-intent', async (req, res) => {
  const { productId, userId } = req.body;
  
  // Guardamos el "intento" en la base de datos
  const intent = new Metric({
    product: productId,
    interestedUser: userId
  });
  await intent.save();

  // Respondemos al frontend para que muestre el mensaje de confirmación
  res.json({ message: "Intención registrada. Gracias por tu interés." });
});

// E. SOCIAL FEED [cite: 30]
app.get('/api/posts', async (req, res) => {
  const posts = await SocialPost.find().sort({ createdAt: -1 }).populate('author', 'username');
  res.json(posts);
});

// F. DAR LIKE [cite: 32]
app.put('/api/posts/:id/like', async (req, res) => {
  await SocialPost.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
  res.json({ message: "Like agregado" });
});

// G. CREAR PUBLICACIÓN SOCIAL (Faltaba esta ruta)
app.post('/api/posts', async (req, res) => {
  try {
    const newPost = new SocialPost(req.body);
    await newPost.save();
    res.json({ message: "Publicación creada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// INICIAR SERVIDOR
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));