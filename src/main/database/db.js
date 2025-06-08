import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'bashimoveis.db'));

db.prepare(`
  CREATE TABLE IF NOT EXISTS usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    birthdate DATE,
    password VARCHAR(255) NOT NULL,
    role TEXT CHECK (role IN ('CLIENTE', 'CORRETOR', 'ADMIN')) NOT NULL,
    status_sync TEXT,
    deleted INTEGER DEFAULT 0,
    updated_at TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS corretor (
    usuario_id INTEGER PRIMARY KEY,
    creci VARCHAR(20) NOT NULL,
    image_base64 TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS imovel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    endereco TEXT NOT NULL,
    cidade TEXT NOT NULL,
    bairro TEXT NOT NULL,
    estado TEXT NOT NULL,
    cep VARCHAR(10),
    preco DECIMAL(15, 2) NOT NULL,
    tipo TEXT CHECK (tipo IN ('CASA', 'APARTAMENTO', 'TERRENO', 'COMERCIAL')) NOT NULL,
    status TEXT CHECK (status IN ('DISPONIVEL', 'VENDIDO', 'ALUGADO')) DEFAULT 'DISPONIVEL',
    area_m2 REAL,
    quartos INTEGER,
    banheiros INTEGER,
    vagas_garagem INTEGER,
    corretor_id INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME,
    FOREIGN KEY (corretor_id) REFERENCES corretor(usuario_id) ON DELETE SET NULL
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS imovel_imagem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imovel_id INTEGER NOT NULL,
    image_base64 TEXT NOT NULL,
    legenda TEXT,
    ordem INTEGER,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (imovel_id) REFERENCES imovel(id) ON DELETE CASCADE
  );
`).run();

// Login
export const verifyLogin = async (email, password) => {
  try {
    const usuario = db.prepare('SELECT * FROM usuario WHERE email = ?').get(email);

    if (!usuario) {
      console.log(`Usuário com e-mail ${email} não encontrado.`);
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, usuario.password);

    if (!passwordMatch) {
      console.log('Senha incorreta.');
      return null;
    }

    console.log('Usuário autenticado:', usuario);
    return usuario;
  } catch (err) {
    console.error('Erro ao verificar login:', err);
    throw err;
  }
};

export const checkEmailExists = (email) => {
  const result = db.prepare('SELECT 1 FROM usuario WHERE email = ? AND deleted = 0').get(email);
  return !!result;
};

// User
export const createUser = async (userData) => {
  const now = new Date().toISOString().split('.')[0].replace('T', ' ');

  const hashedPassword = await bcrypt.hash(userData.password, 10); // 10 = saltRounds

  const stmt = db.prepare(`
    INSERT INTO usuario (name, email, phone, birthdate, password, role, status_sync, deleted, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pendente', 0, ?)
  `);

  const info = stmt.run(
    userData.name,
    userData.email,
    userData.phone,
    userData.birthdate,
    hashedPassword,
    userData.role,
    now
  );

  return {
    id: info.lastInsertRowid,
    ...userData,
    password: undefined,
  };
};

// Real Estate Agent
export const createRealEstateAgent = async (realEstateAgentData) => {
  const now = new Date().toISOString().split('.')[0].replace('T', ' ');

  const hashedPassword = await bcrypt.hash(realEstateAgentData.password, 10);

  const insertUsuario = db.prepare(`
    INSERT INTO usuario (name, email, phone, birthdate, password, role, status_sync, deleted, updated_at)
    VALUES (?, ?, ?, ?, ?, 'CORRETOR', 'pendente', 0, ?)
  `);

  let info;
  try {
    info = insertUsuario.run(
      realEstateAgentData.name,
      realEstateAgentData.email,
      realEstateAgentData.phone,
      realEstateAgentData.birthdate,
      hashedPassword,
      now
    );
    console.log('Usuário inserido com ID:', info.lastInsertRowid);
  } catch (err) {
    console.error('Erro ao inserir usuário corretor:', err);
    throw err;
  }

  const insertCorretor = db.prepare(`
    INSERT INTO corretor (usuario_id, creci, image_base64)
    VALUES (?, ?, ?)
  `);

  try {
    insertCorretor.run(
      info.lastInsertRowid,
      realEstateAgentData.creci,
      realEstateAgentData.image_base64 || null
    );
    console.log('Corretor inserido com usuário_id:', info.lastInsertRowid);
  } catch (err) {
    console.error('Erro ao inserir dados do corretor:', err);
    db.prepare('DELETE FROM usuario WHERE id = ?').run(info.lastInsertRowid);
    throw err;
  }

  return {
    id: info.lastInsertRowid,
    ...realEstateAgentData,
    password: undefined
  };
};

export const getRealEstateAgent = () => {
  try {
    const stmt = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        c.creci,
        c.image_base64
      FROM usuario u
      INNER JOIN corretor c ON u.id = c.usuario_id
      WHERE u.deleted = 0 AND u.role = 'CORRETOR'
      ORDER BY u.name ASC
    `);
    
    const results = stmt.all();
    return results || [];
  } catch (err) {
    console.error('Erro ao buscar corretores:', err);
    return [];
  }
};

export const getRealEstateAgentByName = (name) => {
  try {
    if (!name || typeof name !== 'string') return [];
    
    const stmt = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        c.creci,
        c.image_base64
      FROM usuario u
      INNER JOIN corretor c ON u.id = c.usuario_id
      WHERE u.deleted = 0 AND u.role = 'CORRETOR' 
      AND LOWER(u.name) LIKE LOWER(?)
      ORDER BY u.name ASC
    `);
    
    return stmt.all(`%${name.trim()}%`) || [];
  } catch (err) {
    console.error('Erro ao buscar corretores pelo nome:', err);
    return [];
  }
};

export const updateRealEstateAgent = async (data) => {
  const now = new Date().toISOString().split('.')[0].replace('T', ' ');

  let query = `
    UPDATE usuario
    SET name = ?, phone = ?, birthdate = ?, `;
  const params = [data.name, data.phone, data.birthdate];

  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    query += `password = ?, `;
    params.push(hashedPassword);
  }

  query += `updated_at = ?, status_sync = 'pendente'
    WHERE id = ? AND deleted = 0
  `;

  params.push(now, data.id);

  try {
    const usuarioStmt = db.prepare(query);
    usuarioStmt.run(...params);

    const corretorStmt = db.prepare(`
      UPDATE corretor
      SET creci = ?, image_base64 = ?
      WHERE usuario_id = ?
    `);

    corretorStmt.run(data.creci, data.image_base64 || null, data.id);

    return { success: true, message: 'Corretor atualizado com sucesso.' };
  } catch (err) {
    console.error('Erro ao atualizar corretor:', err);
    return { success: false, message: 'Erro ao atualizar dados do corretor.' };
  }
};

export const deleteRealEstateAgent = (id) => {
  try {
    const now = new Date().toISOString().split('.')[0].replace('T', ' ');
    
    const stmt = db.prepare(`
      UPDATE usuario
      SET deleted = 1, status_sync = 'pendente', updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run(now, id);
    return { success: true, message: 'Corretor excluído com sucesso.' };
  } catch (err) {
    console.error('Erro ao excluir corretor:', err);
    return { success: false, message: 'Erro ao excluir corretor.' };
  }
};

// Property
export const createProperty = (propertyData) => {
  const now = new Date().toISOString().split('.')[0].replace('T', ' ');

  const stmt = db.prepare(`
    INSERT INTO imovel (
      titulo, descricao, endereco, cidade, estado, cep, preco,
      tipo, status, area_m2, quartos, banheiros, vagas_garagem,
      corretor_id, atualizado_em
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    propertyData.titulo,
    propertyData.descricao,
    propertyData.endereco,
    propertyData.cidade,
    propertyData.estado,
    propertyData.cep,
    propertyData.preco,
    propertyData.tipo,
    propertyData.status || 'DISPONIVEL',
    propertyData.area_m2,
    propertyData.quartos,
    propertyData.banheiros,
    propertyData.vagas_garagem,
    propertyData.corretor_id,
    now
  );

  return {
    id: info.lastInsertRowid,
    ...propertyData
  };
};

export const getAllProperties = () => {
  const stmt = db.prepare(`
    SELECT i.*, u.name AS corretor_nome
    FROM imovel i
    LEFT JOIN corretor c ON i.corretor_id = c.usuario_id
    LEFT JOIN usuario u ON c.usuario_id = u.id
    ORDER BY i.criado_em DESC
  `);

  return stmt.all();
};

export const getPropertiesByCorretorId = (corretorId) => {
  const stmt = db.prepare(`
    SELECT i.*, u.name AS corretor_nome
    FROM imovel i
    LEFT JOIN corretor c ON i.corretor_id = c.usuario_id
    LEFT JOIN usuario u ON c.usuario_id = u.id
    WHERE i.corretor_id = ?
    ORDER BY i.criado_em DESC
  `);

  return stmt.all(corretorId);
};
